import { RedisClient } from "../client/redis.client";

export class HashUtils {
    static async hget(hashKey: string, field: string): Promise<string | null> {
        return RedisClient.getInstance().hget(hashKey, field);
    }

    static async hset(hashKey: string, field: string, value: string): Promise<void> {
        await RedisClient.getInstance().hset(hashKey, field, value);
    }

    static async hsetAll(hashKey: string, values: Record<string, string>): Promise<void> {
        await RedisClient.getInstance().hset(hashKey, values);
    }


    static async hgetall<T>(hashKey: string): Promise<T> {
        return RedisClient.getInstance().hgetall(hashKey) as unknown as T;
    }

    static async hdel(hashKey: string, field: string): Promise<void> {
        await RedisClient.getInstance().hdel(hashKey, field);
    }

    static async hincrby(hashKey: string, field: string, increment: number): Promise<void> {
        await RedisClient.getInstance().hincrby(hashKey, field, increment);
    }

    static async hkeys(hashKey: string): Promise<string[]> {
        return RedisClient.getInstance().hkeys(hashKey);
    }

    static async hvals<T>(hashKey: string): Promise<T[]> {
        const values = await RedisClient.getInstance().hvals(hashKey);
        return values.map(v => JSON.parse(v));
    }
}