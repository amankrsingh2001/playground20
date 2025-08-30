export interface SessionData {
    userId: string;
    createdAt: number;
    deviceId?: string;
}

export interface SessionValidationResult {
    valid: boolean;
    userId?: string;
}