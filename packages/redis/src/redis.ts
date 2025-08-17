import Redis from "ioredis";

export const redisClient = new Redis({
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: Number(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
});

redisClient.on("connect", () => {
    console.log("✅ Redis connected");
});

redisClient.on("error", (err) => {
    console.error("❌ Redis error:", err.message);
});

/* ---------------------------
   Redis Helper Functions
---------------------------- */

export const setValue = async (key: string, value: any, ttl?: number) => {
    const val = typeof value === "object" ? JSON.stringify(value) : value;
    if (ttl) return redisClient.set(key, val, "EX", ttl);
    return redisClient.set(key, val);
};

export const getValue = async (key: string) => {
    console.log("[Redis] getRedisField() - [field: %s]", key)
    const val = await redisClient.get(key);
    try {
        return val ? JSON.parse(val) : null;
    } catch {
        return val;
    }
};

export const deleteValue = async (key: string) => redisClient.del(key);

export const exists = async (key: string) =>
    (await redisClient.exists(key)) === 1;

export const increment = async (key: string) => redisClient.incr(key);

export const decrement = async (key: string) => redisClient.decr(key);

export const pushToList = async (key: string, value: any) => {
    const val = typeof value === "object" ? JSON.stringify(value) : value;
    return redisClient.rpush(key, val);
};

export const getList = async (key: string, start = 0, stop = -1) => {
    const items = await redisClient.lrange(key, start, stop);
    return items.map((item) => {
        try {
            return JSON.parse(item);
        } catch {
            return item;
        }
    });
};

export const popFromList = async (key: string) => {
    const val = await redisClient.lpop(key);
    try {
        return val ? JSON.parse(val) : null;
    } catch {
        return val;
    }
};

export const setHash = async (key: string, obj: Record<string, any>) =>
    redisClient.hmset(
        key,
        Object.entries(obj).reduce(
            (acc, [k, v]) => ({
                ...acc,
                [k]: typeof v === "object" ? JSON.stringify(v) : v,
            }),
            {}
        )
    );

export const getHash = async (key: string) => {
    const data = await redisClient.hgetall(key);
    return Object.entries(data).reduce((acc, [k, v]) => {
        try {
            acc[k] = JSON.parse(v);
        } catch {
            acc[k] = v;
        }
        return acc;
    }, {} as Record<string, any>);
};

export const flushAll = async () => redisClient.flushall();
