// zset.utils.ts
import { RedisClient } from "../client/redis.client";

export class ZSetUtils {
    static async zadd(key: string, score: number, member: string): Promise<number>;
    static async zadd(key: string, members: { score: number; value: string }[]): Promise<number>;
    static async zadd(key: string, scoreOrMembers: number | { score: number; value: string }[], member?: string): Promise<number> {
        const client = RedisClient.getInstance();
        if (typeof scoreOrMembers === 'number' && typeof member === 'string') {
            return client.zadd(key, scoreOrMembers, member);
        } else if (Array.isArray(scoreOrMembers)) {
            const args: (string | number)[] = [key];
            for (const { score, value } of scoreOrMembers) {
                args.push(score, value);
            }
            return (client as any).zadd(...args);
        }
        throw new Error('Invalid arguments');
    }

    static async zincrby(key: string, increment: number, member: string): Promise<number> {
        const result = await RedisClient.getInstance().zincrby(key, increment, member);
        return parseFloat(result);
    }

    static async zrange(key: string, start = 0, stop = -1): Promise<string[]> {
        return RedisClient.getInstance().zrange(key, start, stop);
    }

    static async zrevrange(key: string, start = 0, stop = -1, withScores = false): Promise<string[] | [string, string][]> {
        if (withScores) {
            return RedisClient.getInstance().zrevrange(key, start, stop, 'WITHSCORES');
        }
        return RedisClient.getInstance().zrevrange(key, start, stop);
    }

    static async zscore(key: string, member: string): Promise<number | null> {
        const score = await RedisClient.getInstance().zscore(key, member);
        return score ? parseFloat(score) : null;
    }

    static async zrem(key: string, member: string): Promise<boolean> {
        return (await RedisClient.getInstance().zrem(key, member)) === 1;
    }

    static async del(key: string): Promise<void> {
        await RedisClient.getInstance().del(key);
    }
}