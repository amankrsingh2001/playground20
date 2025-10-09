import Redis, { redis } from '@repo/redis';
import { prismaClient } from '@repo/db';
import { v4 as uuidv4 } from 'uuid';
import {
    JOIN_ROOM_SCRIPT,
    LEAVE_ROOM_SCRIPT,
    GET_PUBLIC_ROOM_SCRIPT
} from "./lua"
import {
    // RoomType,
    GameMode,
    RoomSettings,
    PlayerStatus,
    RoomStatus,
    Difficulty
} from '@repo/types';
import { roomLogger } from "@repo/logger";
export enum RoomType {
    PRIVATE = "PRIVATE",
    PUBLIC = "PUBLIC"
}

export class RoomManager {
    private static readonly DEFAULT_CAPACITY = 20;
    private static readonly INVITE_CODE_LENGTH = 8;

    /**
     * Create a new room (public or private)
     */
    async createRoom(
        type: RoomType,
        mode: GameMode = GameMode.BATTLE_ROYALE,
        hostId: string,
        settings?: Partial<RoomSettings>
    ): Promise<{ roomId: string; inviteCode?: string }> {
        const roomId = `room_${Date.now()}_${Math.random().toString(36).slice(2, 2 + RoomManager.INVITE_CODE_LENGTH)}`;
        const inviteCode = type === RoomType.PRIVATE
            ? this.generateInviteCode()
            : undefined;

        // Default settings based on game mode
        const defaultSettings: RoomSettings = {
            gameMode: mode,
            questionLimit: mode === GameMode.BATTLE_ROYALE ? 10 : 20,
            timePerQuestion: 10,
            ...(mode === GameMode.BATTLE_ROYALE && {
                eliminationCount: 2,
                difficultyProgression: true,
                initialDifficulty: 1,
                maxDifficulty: 5,
                difficultyIncrement: 1
            })
        };

        const finalSettings = { ...defaultSettings, ...settings };

        // Store in Redis for real-time operations
        await this.storeRoomInRedis(roomId, type, hostId, finalSettings);

        // Store in database for persistent tracking
        await this.storeRoomInDatabase(roomId, type, hostId, finalSettings, inviteCode);

        return { roomId, inviteCode };
    }

    /**
     * Store room metadata in Redis
     */
    private async storeRoomInRedis(
        roomId: string,
        type: RoomType,
        hostId: string,
        settings: RoomSettings
    ) {
        const client = Redis.client.getInstance();
        try {
            await redis.hsetAll(
                `room:${roomId}:meta`,
                Object.fromEntries(
                    Object.entries({
                        type,
                        mode: settings.gameMode,
                        hostId,
                        status: RoomStatus.WAITING,
                        capacity: RoomManager.DEFAULT_CAPACITY.toString(),
                        ...settings,
                    }).map(([key, value]) => [key, value !== undefined ? String(value) : ""])
                )
            );

        } catch (error) {
            console.error(error);
        }

    }


    /**
     * Store room metadata in database
     */
    private async storeRoomInDatabase(
        roomId: string,
        type: RoomType,
        hostId: string,
        settings: RoomSettings,
        inviteCode?: string
    ) {
        await prismaClient.room.create({
            data: {
                id: roomId,
                slug: `room-${Math.random().toString(36).slice(2, 2 + 6)}`,
                type,
                status: 'WAITING',
                capacity: RoomManager.DEFAULT_CAPACITY,
                inviteCode: inviteCode || `PUBLIC_${roomId}`,
                hostId,
                gameMode: settings.gameMode,
                questionLimit: settings.questionLimit,
                timePerQuestion: settings.timePerQuestion,
                difficultyProgression: settings.difficultyProgression,
                initialDifficulty: this.mapDifficultyToEnum(settings?.initialDifficulty || 1),
                // maxDifficulty: settings.maxDifficulty,
                eliminationCount: settings.eliminationCount,
                difficultyIncrement: settings.difficultyIncrement,
            }
        });
    }


    /**
 * Map numeric difficulty to Prisma enum
 */
    private mapDifficultyToEnum(difficulty: number): 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT' | 'MASTER' {
        if (difficulty <= 1) return 'EASY';
        if (difficulty <= 2) return 'MEDIUM';
        if (difficulty <= 3) return 'HARD';
        if (difficulty <= 4) return 'EXPERT';
        return 'MASTER';
    }

    /**
     * Map prisma enum to number
     */

    private mapEnumToDifficulty(difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT' | 'MASTER'): number  {
        if (difficulty === 'EASY') return 1;
        if (difficulty === 'MEDIUM') return 2;
        if (difficulty === 'HARD') return 3;
        if (difficulty === 'EXPERT') return 4;
        return 5
    }


    /**
     * Join a room (public or private)
     */
    async joinRoom(
        userId: string,
        roomId: string,
        inviteCode?: string
    ): Promise<number> {
        // For private rooms, validate the invite code
        if (inviteCode) {
            const storedCode = await this.validatePrivateCode(inviteCode);
            if (!storedCode || storedCode !== roomId) {
                throw new Error("Invalid invite code");
            }
        }

        const result = await Redis.client.getInstance().eval(
            JOIN_ROOM_SCRIPT,
            1,
            roomId,
            userId
        );

        if (result === -1) throw new Error("Room full");
        if (result === -2) throw new Error("Room not found");
        if (result === -3) throw new Error("User already in room");

        return result as number;
    }

    /**
     * Leave a room
     */
    async leaveRoom(
        userId: string,
        roomId: string
    ): Promise<number> {
        return (await Redis.client.getInstance().eval(
            LEAVE_ROOM_SCRIPT,
            1,
            roomId,
            userId
        )) as number;
    }

    /**
     * Validate private room code
     */
    async validatePrivateCode(code: string): Promise<string | null> {
        return Redis.client.getInstance().get(`private_room:codes:${code}`);
    }

    /**
     * Find an available public room (auto-balanced)
     */
    async getPublicRoom(userId?: string): Promise<string> {
        roomLogger.info(`Entering [getPublicRoom] userId: ${userId}`)
        const roomId = await Redis.client.getInstance().eval(
            GET_PUBLIC_ROOM_SCRIPT,
            0
        ) as string | undefined;

        if (roomId && typeof roomId === "string") {
            return roomId;
        }

        // Create a new public room if none available
        if (userId) {
            const { roomId: newRoomId } = await this.createRoom(
                RoomType.PUBLIC,
                GameMode.BATTLE_ROYALE,
                userId,
            );
            return newRoomId;
        }
        return "";
    }

    /**
     * Get room mode
     */
    async getRoomMode(roomId: string): Promise<GameMode> {
        const mode = await redis.hget(`room:${roomId}:meta`, 'mode');
        return mode as GameMode || GameMode.CLASSIC;
    }

    /**
     * Set player ready status
     */
    async setPlayerReady(
        roomId: string,
        userId: string,
        isReady: boolean
    ): Promise<void> {
        await Redis.client.getInstance().hset(
            `room:${roomId}:status`,
            userId,
            isReady ? 'ready' : 'waiting'
        );
    }

    /**
     * Check if all players are ready
     */
    async areAllPlayersReady(roomId: string): Promise<boolean> {
        const status = await Redis.client.getInstance().hgetall(`room:${roomId}:status`);
        return Object.values(status).every(s => s === 'ready');
    }

    /**
     * Get room settings
     */
    async getRoomSettings(roomId: string): Promise<RoomSettings> {
        const meta = await Redis.client.getInstance().hgetall(`room:${roomId}:meta`);
        return {
            gameMode: (meta.mode as GameMode) || GameMode.CLASSIC,
            questionLimit: meta.questionLimit ? parseInt(meta.questionLimit) : 20,
            timePerQuestion: meta.timePerQuestion ? parseInt(meta.timePerQuestion) : 10,
            difficultyProgression: meta.difficultyProgression === "true",
            initialDifficulty: meta.initialDifficulty ? parseInt(meta.initialDifficulty) : 1,
            eliminationCount: meta.eliminationCount ? parseInt(meta.eliminationCount) : 2,
            difficultyIncrement: meta.difficultyIncrement ? parseInt(meta.difficultyIncrement) : 1,
        };
}

    /**
     * Update room status
     */
    async updateRoomStatus(
    roomId: string,
    status: 'WAITING' | 'ACTIVE' | 'ENDED'
): Promise < void> {
    await Redis.client.getInstance().hset(
        `room:${roomId}:meta`,
        'status',
        status.toLowerCase()
    );
}

    /**
     * Remove player from room
     */
    async removePlayer(
    roomId: string,
    userId: string
): Promise < void> {
    await Redis.client.getInstance().srem(
        `room:${roomId}:members`,
        userId
    );

    await Redis.client.getInstance().hdel(
        `room:${roomId}:status`,
        userId
    );
}

    /**
     * Generate random invite code
     */
    private generateInviteCode(): string {
    return Math.random()
        .toString(36).slice(2, 2 + RoomManager.INVITE_CODE_LENGTH)
        .toUpperCase();
}
}