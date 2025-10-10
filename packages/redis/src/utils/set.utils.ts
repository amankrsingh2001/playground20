// set.utils.ts
import { RedisClient } from "../client/redis.client";

export class SetUtils {
    static async sadd(key: string, ...members: string[]): Promise<number> {
        return RedisClient.getInstance().sadd(key, ...members);
    }

    static async srem(key: string, ...members: string[]): Promise<number> {
        return RedisClient.getInstance().srem(key, ...members);
    }

    static async scard(key: string): Promise<number> {
        return RedisClient.getInstance().scard(key);
    }

    static async smembers(key: string): Promise<string[]> {
        return RedisClient.getInstance().smembers(key);
    }

    static async sismember(key: string, member: string): Promise<boolean> {
        return (await RedisClient.getInstance().sismember(key, member)) === 1;
    }

    static async sremOne(key: string, member: string): Promise<boolean> {
        return (await RedisClient.getInstance().srem(key, member)) > 0;
    }

    static async del(key: string): Promise<void> {
        await RedisClient.getInstance().del(key);
    }
}