import { WebSocket } from "ws";
import { wsLogger } from "@repo/logger";

export const wsConnectionLogger = (ws: WebSocket & { userId?: string; roomId?: string }) => {
    console.log("🚀 ~ wsConnection ~ userId:", ws?.userId)
    wsLogger.wsLog('connection', ws.userId, ws.roomId, {
        remoteAddress: (ws as any).upgradeReq?.socket?.remoteAddress,
        userAgent: (ws as any).upgradeReq?.headers['user-agent']
    });
};

export const wsMessageLogger = (
    ws: WebSocket & { userId?: string; roomId?: string },
    message: string
) => {
    try {
        console.log("🚀 ~ wsMessageLogger ~ userId:", message)
        console.log("🚀 ~ wsMessageLogger ~ userId:", typeof message)
        const parsed = JSON.parse(message);
        console.log("🚀 ~ wsMessageLogger ~ parsed:", parsed)
        wsLogger.wsLog('message', ws.userId, ws.roomId, {
            type: parsed.type,
            payloadSize: message.length
        });
    } catch (e) {
        console.error(e);
        wsLogger.wsLog('raw_message', ws.userId, ws.roomId, {
            messageLength: message.length
        });
    }
};

export const wsErrorLogger = (
    ws: WebSocket & { userId?: string; roomId?: string },
    error: unknown
) => {
    let message = "Unknown error";
    let stack = undefined;

    if (error && typeof error === "object") {
        if ("message" in error && typeof (error as any).message === "string") {
            message = (error as any).message;
        }
        if ("stack" in error && typeof (error as any).stack === "string") {
            stack = (error as any).stack;
        }
    }

    wsLogger.error('WebSocket Error', {
        error: message,
        stack,
        userId: ws.userId,
        roomId: ws.roomId
    });
};