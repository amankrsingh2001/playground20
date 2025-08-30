import type { UserInfo } from "@repo/types";

declare module "ws" {
    interface WebSocket {
        userId?: string;
        userInfo?: UserInfo;
        battleManager?: any;
        context?: {
            deviceId?: string;
            ipAddress?: string;
            userAgent?: string;
        };
        sessionId?: string;
        roomId?: string;
    }
}