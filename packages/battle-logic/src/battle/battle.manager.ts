import { redis, RedisKeys } from "@repo/redis"
import { WebSocketServer, WebSocket } from "ws";
import { RoomManager } from "@repo/room-manager";
import { GameMode, GameState, MessageType, Question } from "@repo/types";
import { PrismaClient } from "@repo/db";
const prisma = new PrismaClient();

export class BattleManager {
    private timers = new Map<string, ReturnType<typeof setTimeout>>();
    private questionStartTime = new Map<string, number>();
    constructor(private wss: WebSocketServer,
        private roomManager: RoomManager
    ) { }

    /**
 * Start the battle in a room
 */
    async startBattle(roomId: string): Promise<void> {
        await redis.hset(`room:${roomId}:meta`, "status", "playing");
        await redis.set(`game:${roomId}:state`, GameState.WAITING);
        await redis.set(`game:${roomId}:round`, "1");

        // Update in database
        await prisma.room.update({
            where: { id: roomId },
            data: {
                status: "ACTIVE"
            }
        });

        this.broadcast(roomId, {
            type: MessageType.START,
            payload: { message: "Battle starting!" }
        });

        // Wait for players to get ready
        this.timers.set(roomId, setTimeout(() => this.startRound(roomId, 1), 5000));
    }

    /**
     * Stat the Round
     */

    async startRound(roomId: string, round: number): Promise<void> {
        const roomSettings = await this.roomManager.getRoomSettings(roomId);
        const questionCount = roomSettings.questionsPerRound || 3;

        this.broadcast(roomId, {
            type: MessageType.ROUND_START,
            payload: { round, message: `Round ${round} begins!` }
        });

        await redis.set(`game:${roomId}:questionIndex`, "1");
        await redis.set(`game:${roomId}:questionsPerRound`, questionCount.toString());

        // Start first question of this round
        this.startQuestion(roomId, round, 1);
    }

    /**
     * Start the question
     */

    async startQuestion(roomId: string, round: number, questionIndex: number): Promise<void> {
        // const round = parseInt((await redis.get(`game:${roomId}:round`)) || "1");
        const roomSettings = await this.roomManager.getRoomSettings(roomId);
        const totalQuestionsInRound = roomSettings.questionsPerRound || 3;
        //   questionsPerRound
        //   initialDifficulty
        //   difficultyProgression

        if(questionIndex > totalQuestionsInRound) {
            return;
        }

        // Check if game should end
        if (round > roomSettings.questionLimit) {
            //   await this.endGame(roomId);
            return;
        }

        const difficulty = await this.getTargetDifficulty(roomId, round, roomSettings.gameMode);
        const question = await this.getQuestion(difficulty);

        if (!question) {
            // await this.endGame(roomId, 'No more questions available');
            return;
        }

        // // Store question and start timer
        // await this.setGameState(roomId, GameState.QUESTION);
        // await this.setCurrentQuestionId(roomId, question.id);
        // await this.setQuestionStartTime(roomId, Date.now());

        // this.currentQuestionId.set(roomId, question.id);
        // this.questionStartTime.set(roomId, Date.now());

        this.broadcast(roomId, {
            type: MessageType.QUESTION,
            payload: {
                question,
                startTime: Date.now(),
                round,
                totalRounds: roomSettings.questionLimit
            }
        });

        // Set timeout for question
        // this.timers.set(
        //     roomId,
        //     setTimeout(() => this.endQuestion(roomId), settings.timePerQuestion * 1000)
        // );
    }

    async endQuestion(roomId: string, round: number, questionIndex: number): Promise<void> {
        const roomSettings = await this.roomManager.getRoomSettings(roomId);
        const totalQuestionsInRound = roomSettings.questionsPerRound || 3;

        this.broadcast(roomId, {
            type: MessageType.END_QUESTION,
            payload: {
                round,
                questionIndex,
                message: `Question ${questionIndex} ended.`,
            },
        })

        if (questionIndex < totalQuestionsInRound) {
            const nextIndex = questionIndex + 1;
            this.timers.set(
                roomId,
                setTimeout(() => this.startQuestion(roomId, round, nextIndex), 3000)
            ); // 3s gap
        } else {
            // Round finished
            this.endRound(roomId, round, questionIndex);
        }
    }

    async endRound(roomId: string, round: number, questionIndex: number): Promise<void> {
        const roomSettings = await this.roomManager.getRoomSettings(roomId);
        const totalRounds = roomSettings.roundLimit || 3;

        this.broadcast(roomId, {
            type: MessageType.ROUND_END,
            payload: { round, message: `Round ${round} completed!` },
        });

        if (round < totalRounds) {
            const nextRound = round + 1;
            await redis.set(`game:${roomId}:round`, nextRound.toString());
            this.timers.set(roomId, setTimeout(() => this.startRound(roomId, nextRound), 5000));
        } else {
            this.endGame(roomId);
        }
    }

    async endGame(roomId: string, reason?: string): Promise<void> {
        this.clearTimer(roomId);
        await redis.hset(`room:${roomId}:meta`, "status", "ended");
        await prisma.room.update({ where: { id: roomId }, data: { status: "ENDED" } });

        this.broadcast(roomId, {
            type: MessageType.END,
            payload: { message: reason || "Game Over!" },
        });
    }

    private clearTimer(roomId: string) {
        const timer = this.timers.get(roomId);
        if (timer) clearTimeout(timer);
        this.timers.delete(roomId);
    }

    async handleAnswer(
        roomId: string,
        userId: string,
        selectedOption: string
    ) {
        const startTime = this.questionStartTime.get(roomId);
        if (!startTime) return;

        const timeTakenMs = Date.now() - startTime;

        // 1. Update Redis state IMMEDIATELY (sub-millisecond)
        await this.updateRedisState(roomId, userId, selectedOption, timeTakenMs);

        // 2. Queue DB update (non-blocking)
        await redis.lpush('db-queue', JSON.stringify({
            type: 'ANSWER',
            data: {
                roomId,
                userId,
                selectedOption,
                timeTakenMs,
                timestamp: Date.now()
            }
        }));

        // 3. Respond to player immediately (no DB wait)
        this.broadcast(roomId, {
            type: MessageType.ANSWER_CONFIRMED,
            payload: { timeTakenMs }
        });
    }

    /**
   * Get target difficulty based on game mode and round
   */
    private async getTargetDifficulty(
        roomId: string,
        round: number,
        mode: GameMode
    ): Promise<number> {
        const settings = await this.roomManager.getRoomSettings(roomId);
        if (mode !== GameMode.BATTLE_ROYALE) {
            return settings.initialDifficulty || 1
        }

        const baseDifficulty = settings.initialDifficulty || 1;
        const increment = settings.difficultyIncrement || 1;

        return Math.min(
            baseDifficulty + (round - 1) * increment,
            settings.maxDifficulty || 5
        );
    }


    /**
   * Get a question of the specified difficulty
   */
    private async getQuestion(difficulty: number): Promise<Question | null> {
        // In a real implementation, this would query the database
        const question = await prisma.question.findFirst({
            where: {
                baseDifficulty: this.mapDifficultyToEnum(difficulty),
                approved: true
            },
            orderBy: {
                usedCount: 'asc'
            }
        });

        if (!question) return null;

        // Update usage count
        await prisma.question.update({
            where: { id: question.id },
            data: {
                usedCount: { increment: 1 },
                lastUsedAt: new Date()
            }
        });

        return {
            id: question.id,
            text: question.text,
            options: JSON.parse(question.options as string),
            correctOption: question.correctOption,
            difficulty
        };
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
     * Map prisma enum to numeric
     */

    private mapEnumToDifficulty(difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT' | 'MASTER'): number {
        if (difficulty === 'EASY') return 1;
        if (difficulty === 'MEDIUM') return 2;
        if (difficulty === 'HARD') return 3;
        if (difficulty === 'EXPERT') return 4;
        return 5
    }


    /**
     * Broadcasting the message to the room
     */

    public broadcast(roomId: string, data: any) {
        this.wss.clients.forEach((client: WebSocket & { roomId?: string }) => {
            if (client.readyState === WebSocket.OPEN && client.roomId === roomId) {
                client.send(JSON.stringify(data));
            }
        });
    }
}