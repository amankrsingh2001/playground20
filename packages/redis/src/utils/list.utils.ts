import { RedisClient } from "../client/redis.client";

export class ListUtils {
    static async lpush(listKey: string, ...values: string[]): Promise<void> {
        await RedisClient.getInstance().lpush(listKey, ...values);
    }

    static async rpush(listKey: string, ...values: string[]): Promise<void> {
        await RedisClient.getInstance().rpush(listKey, ...values);
    }

    static async lrange<T>(listKey: string, start = 0, end = -1): Promise<T[]> {
        const values = await RedisClient.getInstance().lrange(listKey, start, end);
        return values.map(v => JSON.parse(v));
    }

    static async llen(listKey: string): Promise<number> {
        return RedisClient.getInstance().llen(listKey);
    }

    static async lpop<T>(listKey: string): Promise<T | null> {
        const value = await RedisClient.getInstance().lpop(listKey);
        return value ? JSON.parse(value) : null;
    }

    static async rpop<T>(listKey: string): Promise<T | null> {
        const value = await RedisClient.getInstance().rpop(listKey);
        return value ? JSON.parse(value) : null;
    }

    static async ltrim(listKey: string, start: number, end: number): Promise<void> {
        await RedisClient.getInstance().ltrim(listKey, start, end);
    }
}