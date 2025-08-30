import { RedisClient } from "../client/redis.client";
import { randomBytes } from "crypto";

export interface SessionData {
    userId: string;
    createdAt: number;
    deviceId?: string;
    ipAddress?: string;
    userAgent?: string;
    fullName?: string;
    email?: string;
    profileImage?: string,
}

export interface SessionValidationResult {
    valid: boolean;
    userId?: string;
    data?: SessionData;
}

export class SessionManager {
    private static readonly SESSION_PREFIX = "session:";
    private static readonly TTL = 86400; // 24 hours

    static async validate(token: string): Promise<SessionValidationResult> {
        const client = RedisClient.getInstance();
        const key = `${this.SESSION_PREFIX}${token}`;
        const session = await client.get(key);

        return session
            ? { valid: true, userId: JSON.parse(session).userId, data: JSON.parse(session) }
            : { valid: false };
    }

    static async create(userId: string, metadata?: Omit<SessionData, 'userId' | 'createdAt'>): Promise<string> {
        const client = RedisClient.getInstance();
        const token = randomBytes(32).toString("hex");
        const key = `${this.SESSION_PREFIX}${token}`;
        const sessionData: SessionData = {
            userId,
            createdAt: Date.now(),
            ...metadata
        };

        await client.setex(key, this.TTL, JSON.stringify(sessionData));

        // Clear login attempts on successful login
        await this.clearLoginAttempts(userId);

        return token;
    }

    static async destroy(token: string): Promise<void> {
        const client = RedisClient.getInstance();
        const key = `${this.SESSION_PREFIX}${token}`;
        await client.del(key);
    }

    static async destroyAll(userId: string): Promise<void> {
        const client = RedisClient.getInstance();
        const pattern = `${this.SESSION_PREFIX}*`;
        
        let stream: NodeJS.ReadableStream;
        if (typeof (client as any).scanStream === "function") {
            stream = (client as any).scanStream({ match: pattern });
        } else if (typeof (client as any).sscanStream === "function") {
            // For cluster, use sscanStream on each master node
            // This is a simplified example; for production, iterate all masters
            stream = (client as any).sscanStream(0, { match: pattern });
        } else {
            throw new Error("No scanStream or sscanStream available on Redis client");
        }

        stream.on("data", async (tokens: string[]) => {
            for (const token of tokens) {
                try {
                    const sessionData = await client.get(token);
                    if (sessionData) {
                        const parsed = JSON.parse(sessionData) as SessionData;
                        if (parsed.userId === userId) {
                            await client.del(token);
                        }
                    }
                } catch (error) {
                    console.error(`Error processing session ${token}:`, error);
                }
            }
        });
    }

    static async extendTTL(token: string): Promise<void> {
        const client = RedisClient.getInstance();
        const key = `${this.SESSION_PREFIX}${token}`;
        await client.expire(key, this.TTL);
    }

    static async checkLoginAttempt(identifier: string): Promise<boolean> {
        const client = RedisClient.getInstance();
        const attemptsKey = `login_attempts:${identifier}`;
        const attempts = await client.get(attemptsKey);

        if (attempts && parseInt(attempts) >= 5) {
            return false;
        }

        await client.incr(attemptsKey);
        await client.expire(attemptsKey, 3600); // 1 hour

        return true;
    }

    static async clearLoginAttempts(identifier: string): Promise<void> {
        const client = RedisClient.getInstance();
        const attemptsKey = `login_attempts:${identifier}`;
        await client.del(attemptsKey);
    }
}