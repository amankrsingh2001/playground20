import Redis from '@repo/redis';
import { prismaClient } from '@repo/db';
import { v4 as uuidv4 } from 'uuid';
import {
    JOIN_ROOM_SCRIPT,
    LEAVE_ROOM_SCRIPT,
    GET_PUBLIC_ROOM_SCRIPT
} from "./lua"
import {
    RoomType,
    GameMode,
    RoomSettings,
    PlayerStatus,
    Difficulty
} from '@repo/types';

export class RoomManager {
    private static readonly DEFAULT_CAPACITY = 20;
    private static readonly INVITE_CODE_LENGTH = 8;

    /**
     * Create a new room (public or private)
     */
    async createRoom(
        type: RoomType,
        mode: GameMode = GameMode.CLASSIC,
        hostId: string,
        settings?: Partial<RoomSettings>
    ): Promise<{ roomId: string; inviteCode?: string }> {
        const roomId = `room_${Date.now()}_${Math.random().toString(36).slice(2, 2 + RoomManager.INVITE_CODE_LENGTH) }`;
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
                initialDifficulty: Difficulty.EASY,
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

        await client.multi()
            .hset(`room:${roomId}:meta`, {
                type,
                mode: settings.gameMode,
                hostId,
                status: 'waiting',
                capacity: RoomManager.DEFAULT_CAPACITY,
                ...settings
            })
            .sadd(`room:${roomId}:members`)
            .hset(`room:${roomId}:status`)
            .exec();
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
                initialDifficulty: settings.initialDifficulty,
                // maxDifficulty: settings.maxDifficulty,
                eliminationCount: settings.eliminationCount,
                difficultyIncrement: settings.difficultyIncrement,
            }
    });
}

  /**
   * Join a room (public or private)
   */
  async joinRoom(
    userId: string,
    roomId: string,
    inviteCode ?: string
): Promise < number > {
    // For private rooms, validate the invite code
    if(inviteCode) {
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

    if(result === -1) throw new Error("Room full");
if (result === -2) throw new Error("Room not found");

return result as number;
  }

  /**
   * Leave a room
   */
  async leaveRoom(
    userId: string,
    roomId: string
): Promise < number > {
    return(await Redis.client.getInstance().eval(
        LEAVE_ROOM_SCRIPT,
        1,
        roomId,
        userId
    )) as number;
}

  /**
   * Validate private room code
   */
  async validatePrivateCode(code: string): Promise < string | null > {
    return Redis.client.getInstance().get(`private_room:codes:${code}`);
}

  /**
   * Find an available public room (auto-balanced)
   */
  async getPublicRoom(userId?: string): Promise < string > {
    const roomId = await Redis.client.getInstance().eval(
        GET_PUBLIC_ROOM_SCRIPT,
        0
    ) as string | undefined;

      if (roomId && typeof roomId === "string") {
          return roomId;
      }

    // Create a new public room if none available
    if(userId) {
        const { roomId: newRoomId } = await this.createRoom(
            RoomType.PUBLIC,
            GameMode.CLASSIC,
            userId,
        );
        return newRoomId;
    }
    return "";
}

  /**
   * Get room mode
   */
  async getRoomMode(roomId: string): Promise < GameMode > {
    const mode = await Redis.client.getInstance().hget(`room:${roomId}:meta`, 'mode');
    return mode as GameMode || GameMode.CLASSIC;
}

  /**
   * Set player ready status
   */
  async setPlayerReady(
    roomId: string,
    userId: string,
    isReady: boolean
): Promise < void> {
    await Redis.client.getInstance().hset(
        `room:${roomId}:status`,
        userId,
        isReady ? 'ready' : 'waiting'
    );
}

  /**
   * Check if all players are ready
   */
  async areAllPlayersReady(roomId: string): Promise < boolean > {
    const status = await Redis.client.getInstance().hgetall(`room:${roomId}:status`);
    return Object.values(status).every(s => s === 'ready');
}

  /**
   * Get room settings
   */
//   async getRoomSettings(roomId: string): Promise < RoomSettings > {
//     const meta = await Redis.client.getInstance().hgetall(`room:${roomId}:meta`);

//     return {
//         gameMode: meta.mode as GameMode || GameMode.CLASSIC,
//         questionLimit: parseInt(meta.questionLimit) || 20,
//         timePerQuestion: parseInt(meta.timePerQuestion) || 10,
//         difficultyProgression: meta.difficultyProgression === 'true',
//         initialDifficulty: parseInt(meta.initialDifficulty) || 1,
//         maxDifficulty: parseInt(meta.maxDifficulty) || 5,
//         eliminationCount: parseInt(meta.eliminationCount) || 2,
//         difficultyIncrement: parseInt(meta.difficultyIncrement) || 1
//     };
// }

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