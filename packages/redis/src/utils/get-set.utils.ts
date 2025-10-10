import { RedisClient } from "../client/redis.client";

export class GetSetUtils {
    static async get(key: string): Promise<string | null> {
        return RedisClient.getInstance().get(key);
    }

    static async set(key: string, value: string, ttl?: number): Promise<void> {
        const client = RedisClient.getInstance();
        if (ttl) {
            await client.setex(key, ttl, value);
        } else {
            await client.set(key, value);
        }
    }

    static async setJson(key: string, value: any, ttl?: number): Promise<void> {
        await this.set(key, JSON.stringify(value), ttl);
    }

    static async getJson<T>(key: string): Promise<T | null> {
        const value = await this.get(key);
        
        return value ? JSON.parse(value) : null;
    }

    static async delete(key: string): Promise<void> {
        await RedisClient.getInstance().del(key);
    }

    static async exists(key: string): Promise<boolean> {
        return (await RedisClient.getInstance().exists(key)) === 1;
    }

    static async ttl(key: string): Promise<number> {
        return RedisClient.getInstance().ttl(key);
    }

    static async scard(key: string): Promise<number> {
        return RedisClient.getInstance().scard(key);
    }
}