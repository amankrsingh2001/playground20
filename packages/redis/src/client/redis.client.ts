import Redis, { RedisOptions, Cluster, ClusterNode } from "ioredis";
import { URL } from "url";

export interface RedisConnectionOptions {
    host?: string;
    port?: number;
    username?: string;
    password?: string;
    db?: number;
    tls?: boolean;
    retryStrategy?: (times: number) => number | null;
    maxRetriesPerRequest?: number;
    connectTimeout?: number;
    commandTimeout?: number;

    // Sentinel support
    sentinels?: { host: string; port: number }[];
    sentinelName?: string;
    sentinelPassword?: string;
    sentinelUsername?: string;

    // Cluster support
    clusterNodes?: ClusterNode[];
    isCluster?: boolean;

    // Performance
    enableAutoPipelining?: boolean;
    maxLoadingRetryTime?: number;
    disconnectTimeout?: number;

    connectionTtl?: number;
}

interface RedisEnv {
    REDIS_URL?: string;
    REDIS_HOST?: string;
    REDIS_PORT?: string;
    REDIS_PASSWORD?: string;
    REDIS_USERNAME?: string;
    REDIS_DB?: string;
    REDIS_TLS?: string;
    REDIS_SENTINELS?: string;
    REDIS_SENTINEL_NAME?: string;
    REDIS_SENTINEL_PASSWORD?: string;
    REDIS_SENTINEL_USERNAME?: string;
    REDIS_CLUSTER_NODES?: string;
    REDIS_CONNECT_TIMEOUT?: string;
    REDIS_COMMAND_TIMEOUT?: string;
    REDIS_MAX_RETRIES?: string;
    REDIS_ENABLE_AUTO_PIPELINING?: string;
}

export class RedisClient {
    private static instance: Redis | Cluster;
    private static options: RedisConnectionOptions;
    private static healthCheckInterval: NodeJS.Timeout;
    private static healthy = false;
    private static reconnectAttempts = 0;
    private static maxReconnectAttempts = 10;
    private static reconnectDelay = 1000;
    private static readonly DEFAULT_CONNECTION_TTL = 3600;

    private static getConnectionOptions(): RedisConnectionOptions {
        const env = process.env as RedisEnv;

        // 1. Cluster setup
        if (env.REDIS_CLUSTER_NODES) {
            const nodes = env.REDIS_CLUSTER_NODES.split(",").map((n) => {
                const [host, port] = n.split(":");
                if (!host || !port) {
                    throw new Error(`Invalid cluster node address: "${n}"`);
                }
                return { host, port: parseInt(port) };
            });

            return {
                clusterNodes: nodes,
                isCluster: true,
                password: env.REDIS_PASSWORD,
                username: env.REDIS_USERNAME,
                tls: env.REDIS_TLS?.toLowerCase() === "true",
            };
        }

        // 2. Sentinel setup
        if (env.REDIS_SENTINELS) {
            // const sentinels = env.REDIS_SENTINELS.split(",").map((s) => {
            //     const [host, port] = s.split(":");
            //     return { host, port: parseInt(port) };
            // });
            const sentinels = env.REDIS_SENTINELS.split(",").map((s) => {
                const [host, port] = s.split(":");
                if (!host || !port) {
                    throw new Error(`Invalid sentinel address: "${s}"`);
                }
                return { host, port: parseInt(port) };
            });

            return {
                sentinels,
                sentinelName: env.REDIS_SENTINEL_NAME || "mymaster",
                password: env.REDIS_PASSWORD,
                username: env.REDIS_USERNAME,
                sentinelPassword: env.REDIS_SENTINEL_PASSWORD,
                sentinelUsername: env.REDIS_SENTINEL_USERNAME,
                db: parseInt(env.REDIS_DB || "0"),
                tls: env.REDIS_TLS?.toLowerCase() === "true",
            };
        }

        // 3. Standalone (default)
        if (env.REDIS_URL) {
            try {
                const redisUrl = new URL(env.REDIS_URL);
                return {
                    host: redisUrl.hostname,
                    port: parseInt(redisUrl.port) || 6379,
                    username: redisUrl.username || undefined,
                    password: redisUrl.password || undefined,
                    db: redisUrl.pathname ? parseInt(redisUrl.pathname.slice(1)) : 0,
                    tls: redisUrl.protocol === "rediss:",
                };
            } catch (error) {
                console.error(`Invalid REDIS_URL: ${env.REDIS_URL}`, error);
                throw new Error("Invalid Redis URL format");
            }
        }

        // 4. Individual parameters
        const host = env.REDIS_HOST || "localhost";
        const port = parseInt(env.REDIS_PORT || "6379");

        if (!host) {
            throw new Error("REDIS_HOST is required");
        }

        if (isNaN(port) || port < 1 || port > 65535) {
            throw new Error("REDIS_PORT must be a valid port number");
        }

        return {
            host,
            port,
            username: env.REDIS_USERNAME,
            password: env.REDIS_PASSWORD,
            db: parseInt(env.REDIS_DB || "0"),
            tls: env.REDIS_TLS?.toLowerCase() === "true",
            connectTimeout: parseInt(env.REDIS_CONNECT_TIMEOUT || "10000"),
            commandTimeout: parseInt(env.REDIS_COMMAND_TIMEOUT || "5000"),
            maxRetriesPerRequest: parseInt(env.REDIS_MAX_RETRIES || "3"),
            enableAutoPipelining: env.REDIS_ENABLE_AUTO_PIPELINING?.toLowerCase() === "true",
        };
    }

    private static createInstance(): Redis | Cluster {
        this.options = this.getConnectionOptions();

        let client: Redis | Cluster;

        // Common Redis options
        const commonOptions: RedisOptions = {
            password: this.options.password,
            username: this.options.username,
            db: this.options.db,
            retryStrategy: (times) => {
                // Exponential backoff with jitter
                const delay = Math.min(times * 100 + Math.random() * 100, 2000);
                return delay;
            },
            connectTimeout: this.options.connectTimeout || 10000,
            commandTimeout: this.options.commandTimeout || 5000,
            maxRetriesPerRequest: this.options.maxRetriesPerRequest || 3,
            enableAutoPipelining: this.options.enableAutoPipelining !== false,
            disconnectTimeout: this.options.disconnectTimeout || 3000,
            // TLS configuration
            ...(this.options.tls && {
                tls: {
                    servername: this.options.host || 'localhost',
                    rejectUnauthorized: true
                }
            })
        };

        // TLS configuration
        if (this.options.tls) {
            commonOptions.tls = {
                servername: this.options.host || 'localhost',
                rejectUnauthorized: true,
                // Add certificate validation in production
                // ca: fs.readFileSync('/path/to/ca.crt'),
            };
        }

        try {
            // Cluster mode
            if (this.options.isCluster && this.options.clusterNodes) {
                client = new Cluster(this.options.clusterNodes, {
                    redisOptions: commonOptions,
                    // Cluster-specific options
                    scaleReads: "slave", // Read from slaves
                });
            }
            // Sentinel mode
            else if (this.options.sentinels) {
                client = new Redis({
                    ...commonOptions,
                    sentinels: this.options.sentinels,
                    name: this.options.sentinelName,
                    sentinelPassword: this.options.sentinelPassword,
                    sentinelUsername: this.options.sentinelUsername,
                });
            }
            // Standalone
            else {
                client = new Redis({
                    ...commonOptions,
                    host: this.options.host,
                    port: this.options.port,
                });
            }

            this.attachEventListeners(client);
            this.startHealthChecks(client);

            return client;
        } catch (error) {
            console.error("Failed to create Redis client:", error);
            throw error;
        }
    }

    private static attachEventListeners(client: Redis | Cluster) {
        client.on("connect", () => {
            console.log(`✅ Redis connected to ${this.getConnectionInfo()}`);
            this.reconnectAttempts = 0; // Reset on successful connect
        });

        client.on("ready", () => {
            this.healthy = true;
            console.log("🚀 Redis ready and operational");
        });

        client.on("error", (err) => {
            this.healthy = false;

            // Categorize errors
            if (err.message.includes("ECONNREFUSED")) {
                console.error(`❌ Redis connection refused: ${this.getConnectionInfo()}`);
            } else if (err.message.includes("AUTH")) {
                console.error("❌ Redis authentication failed - check credentials");
            } else if (err.message.includes("ECONNRESET")) {
                console.error("❌ Redis connection reset");
            } else {
                console.error("❌ Redis error:", err.message);
            }
        });

        client.on("close", () => {
            this.healthy = false;
            console.warn("🔌 Redis connection closed");
        });

        client.on("reconnecting", (delay) => {
            console.log(`🔄 Redis reconnecting in ${delay}ms...`);
        });

        // Memory warning
        client.on("warning", (warning) => {
            console.warn("⚠️ Redis warning:", warning);
        });
    }

    private static startHealthChecks(client: Redis | Cluster) {
        if (this.healthCheckInterval) clearInterval(this.healthCheckInterval);

        this.healthCheckInterval = setInterval(async () => {
            try {
                // Use a lightweight command
                await Promise.race([
                    client.ping(),
                    new Promise((_, reject) =>
                        setTimeout(() => reject(new Error('timeout')), 3000)
                    )
                ]);

                if (!this.healthy) {
                    this.healthy = true;
                    console.log("💚 Redis health restored");
                }
            } catch (error) {
                if (this.healthy) {
                    this.healthy = false;
                    const message =
                        typeof error === "object" && error && "message" in error
                            ? (error as any).message
                            : String(error);
                    console.error("💔 Redis health check failed:", message);

                    // Limit reconnect attempts to prevent thundering herd
                    if (this.reconnectAttempts < this.maxReconnectAttempts) {
                        this.reconnectAttempts++;
                        this.reconnect();
                    } else {
                        console.error(`🛑 Too many reconnect attempts (${this.reconnectAttempts}). Giving up.`);
                    }
                }
            }
        }, 10000); // every 10s
    }

    private static reconnect() {
        if (RedisClient.instance) {
            try {
                RedisClient.instance.disconnect();
                console.log(`🔁 Redis reconnecting (attempt ${this.reconnectAttempts})...`);
            } catch (error) {
                console.error("Error disconnecting:", error);
            }
        }

        // Exponential backoff for reconnect
        const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts), 30000);
        setTimeout(() => {
            RedisClient.instance = RedisClient.createInstance();
        }, delay);
    }

    static getInstance(): Redis | Cluster {
        if (!RedisClient.instance) {
            RedisClient.instance = RedisClient.createInstance();
        }
        return RedisClient.instance;
    }

    static isHealthy(): boolean {
        return this.healthy;
    }

    static getConnectionInfo(): string {
        if (this.options.isCluster) {
            return `cluster with ${this.options.clusterNodes?.length} nodes`;
        } else if (this.options.sentinels) {
            return `sentinel "${this.options.sentinelName}" with ${this.options.sentinels.length} sentinels`;
        } else {
            return `${this.options.tls ? 'rediss' : 'redis'}://${this.options.host}:${this.options.port}`;
        }
    }

    /**
 * Track a user's connection
 * @param userId User ID
 * @param roomId Optional room ID
 * @returns Promise<boolean> - true if connection was created
 */
    static async trackConnection(userId: string, roomId?: string): Promise<boolean> {
        try {
            const client = RedisClient.getInstance();
            const connectionKey = `user:${userId}:connections`;
            const roomKey = roomId ? `room:${roomId}:members` : null;

            // Use pipeline for atomic operations
            const data = await client.get(connectionKey);
            const pipeline = client.pipeline();

            // Increment user connection count
            pipeline.incr(connectionKey);

            // Set TTL for the connection key
            pipeline.expire(connectionKey, this.options?.connectionTtl || this.DEFAULT_CONNECTION_TTL);

            // Add to room members set if roomId provided
            if (roomKey) {
                pipeline.sadd(roomKey, userId);
                // Room members TTL should match room state TTL
                pipeline.expire(roomKey, 86400); // 24 hours
            }

            // Execute pipeline
            const results = await pipeline.exec();

            if (!results) {
                console.error("Failed to execute connection tracking pipeline");
                return false;
            }

            // Check if incr command succeeded
            const incrResult = results[0];
            if (Array.isArray(incrResult) && incrResult[0] !== null) {
                console.error("Failed to increment connection count");
                return false;
            }

            return true;

        } catch (error) {
            console.error("Error tracking connection:", error);
            return false;
        }
    }


    /**
  * Remove a user's connection
  * @param userId User ID
  * @param roomId Optional room ID
  * @returns Promise<boolean> - true if connection was removed
  */
    static async removeConnection(userId: string, roomId?: string): Promise<boolean> {
        try {
            const client = RedisClient.getInstance();
            const connectionKey = `user:${userId}:connections`;
            const roomKey = roomId ? `room:${roomId}:members` : null;

            // Use pipeline for atomic operations
            const pipeline = client.pipeline();

            // Decrement user connection count
            pipeline.decr(connectionKey);

            // Remove from room members set if roomId provided
            if (roomKey) {
                pipeline.srem(roomKey, userId);
            }

            // Execute pipeline
            const results = await pipeline.exec();

            if (!results) {
                console.error("Failed to execute connection removal pipeline");
                return false;
            }

            return true;

        } catch (error) {
            console.error("Error removing connection:", error);
            return false;
        }
    }

    /**
 * Get user's active connection count
 * @param userId User ID
 * @returns Promise<number> - connection count
 */
    static async getConnectionCount(userId: string): Promise<number> {
        try {
            const client = RedisClient.getInstance();
            const connectionKey = `user:${userId}:connections`;

            const count = await client.get(connectionKey);
            return count ? parseInt(count) : 0;

        } catch (error) {
            console.error("Error getting connection count:", error);
            return 0;
        }
    }

    /**
 * Check if user has reached max connections
 * @param userId User ID
 * @param maxConnections Maximum allowed connections
 * @returns Promise<boolean> - true if max connections reached
 */
    static async hasMaxConnections(
        userId: string,
        maxConnections: number = 1
    ): Promise<boolean> {
        const count = await this.getConnectionCount(userId);
        return count >= maxConnections;
    }

    /**
     * Clean up stale connections (call periodically)
     */
    static async cleanupStaleConnections(): Promise<void> {
        try {
            const client = RedisClient.getInstance();
            // This is handled by Redis TTL automatically
            // No need for manual cleanup
        } catch (error) {
            console.error("Error cleaning up connections:", error);
        }
    }

    static async disconnect(): Promise<void> {
        if (RedisClient.instance) {
            try {
                await RedisClient.instance.quit();
                console.log("🔌 Redis disconnected gracefully");
            } catch (error) {
                console.error("Error during graceful disconnect:", error);
                RedisClient.instance.disconnect();
            } finally {
                RedisClient.instance = null as any;
                if (this.healthCheckInterval) {
                    clearInterval(this.healthCheckInterval);
                }
            }
        }
    }

    // Add health check endpoint
    static async healthCheck(): Promise<{ healthy: boolean; info: string }> {
        return {
            healthy: this.healthy,
            info: this.getConnectionInfo()
        };
    }

    // Graceful shutdown handler
    static setupGracefulShutdown(): void {
        const shutdown = async () => {
            console.log('🛑 Shutting down Redis connection...');
            await RedisClient.disconnect();
            process.exit(0);
        };

        process.on('SIGTERM', shutdown);
        process.on('SIGINT', shutdown);
        process.on('SIGUSR2', shutdown);
    }
}