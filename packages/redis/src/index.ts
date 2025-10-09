import { SessionManager } from "./session";
import { GetSetUtils, HashUtils, ListUtils, ZSetUtils, SetUtils } from "./utils";
import { RedisClient } from "./client/redis.client";

// Export everything from submodules
// export * from "./session";
// export * from "./utils";
// export * from "./types";
// export * from "./client/redis.client";

// Named exports for convenience
export const session = SessionManager;
export { RedisKeys } from "./keys";
export const redis = {
    get: GetSetUtils.get,
    set: GetSetUtils.set,
    getJson: GetSetUtils.getJson,
    setJson: GetSetUtils.setJson,
    delete: GetSetUtils.delete,
    exists: GetSetUtils.exists,
    ttl: GetSetUtils.ttl,
    hget: HashUtils.hget,
    hset: HashUtils.hset,
    hsetAll: HashUtils.hsetAll,
    hgetall: HashUtils.hgetall,
    hdel: HashUtils.hdel,
    hincrby: HashUtils.hincrby,
    hkeys: HashUtils.hkeys,
    hvals: HashUtils.hvals,
    lpush: ListUtils.lpush,
    rpush: ListUtils.rpush,
    lrange: ListUtils.lrange,
    llen: ListUtils.llen,
    lpop: ListUtils.lpop,
    rpop: ListUtils.rpop,
    ltrim: ListUtils.ltrim,
    zadd: ZSetUtils.zadd,
    zincrby: ZSetUtils.zincrby,
    sadd: SetUtils.sadd,
    scard: SetUtils.scard,
    smembers: SetUtils.smembers,
    trackConnection: RedisClient.trackConnection,
    removeConnection: RedisClient.removeConnection,
    getConnectionCount: RedisClient.getConnectionCount,
    hasMaxConnections: RedisClient.hasMaxConnections,
};

// Default export
export default {
    session: SessionManager,
    utils: {
        getSet: GetSetUtils,
        hash: HashUtils,
        list: ListUtils,
        zset: ZSetUtils,
        set: SetUtils,
    },
    client: RedisClient
};