/**
 * Session-related Redis key patterns
 */
export const SessionKeys = {
    /**
     * Session token mapping (session:{token} → userId)
     */
    token: (token: string) => `session:${token}`,

    /**
     * Connection tracking (user:{userId}:connections)
     */
    connectionCount: (userId: string) => `user:${userId}:connections`,

    /**
     * Login attempt tracking
     */
    loginAttempts: (identifier: string) => `login_attempts:${identifier}`
} as const;