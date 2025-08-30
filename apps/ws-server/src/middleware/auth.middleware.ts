import { WebSocket, WebSocketServer } from "ws";
import { ApiError } from "../utils/ApiError";
import { redis, session } from "@repo/redis";
import { UserInfo } from "@repo/types";
import Redis from '@repo/redis';


// This ensures the WebSocket extension is recognized
// import "./../types/websocket";

const NON_SECURE_PATHS = [
    "/join-room",
    "/public-rooms",
    "/battle-royale",
    "/classic"
];

export const authenticateWebSocket = async (
    ws: WebSocket,
    request: any,
    next: (error?: ApiError) => void
): Promise<void> => {
    try {
        // Extract session token from URL query parameters
        const url = new URL(request.url, `http://${request.headers.host}`);
        const sessionToken = url.searchParams.get('token');

        console.log("[WS-AUTH] checking session token - [path: %s, token: %s]",
            request.url,
            sessionToken ? `${sessionToken.substring(0, 8)}...` : "none"
        );

        // Skip authentication for non-secure paths
        if (NON_SECURE_PATHS.some(path => request.url.includes(path))) {
            return next();
        }

        if (!sessionToken) {
            return next(new ApiError(401, "UNAUTHORIZED_ACCESS"));
        }

        // Validate Redis session
        const { valid, userId, data } = await session.validate(sessionToken);
        if (!valid || !userId) {
            return next(new ApiError(401, "UNAUTHORIZED_ACCESS"));
        }

        // Check connection limits
        const MAX_CONNECTIONS_PER_USER = 1;
        const hasMaxConnections = await Redis.client.hasMaxConnections(userId, MAX_CONNECTIONS_PER_USER);

        if (hasMaxConnections) {
            return next(new ApiError(403, "MAX_CONNECTIONS_REACHED"));
        }

        // Track connection
        const success = await Redis.client.trackConnection(userId);
        if (!success) {
            return next(new ApiError(500, "FAILED_TO_TRACK_CONNECTION"));
        }

        // Attach auth data to WebSocket
        const userInfo: UserInfo = {
            id: userId,
            email: data?.email ?? "",
            fullName: data?.fullName ?? "",
            profileImage: data?.profileImage ?? "",
        };

        ws.userId = userId;
        ws.userInfo = userInfo;
        ws.context = {
            deviceId: data?.deviceId,
            ipAddress: request.socket.remoteAddress,
            userAgent: request.headers['user-agent'],
        };
        ws.sessionId = sessionToken;

        console.log(`[WS-AUTH] Authentication successful for user ${userId}`);

        next();

    } catch (error) {
        console.error("[WS-AUTH] Authentication error:", error);
        next(new ApiError(500, "AUTHENTICATION_FAILED"));
    }
};

export const applyAuthToWSS = (wss: WebSocketServer): void => {
    wss.on('connection', async (ws: WebSocket, request) => {
        try {
            await new Promise<void>((resolve, reject) => {
                authenticateWebSocket(ws, request, (error) => {
                    if (error) reject(error);
                    else resolve();
                });
            });

            // Authentication successful
            console.log(`[WS] Connected user: ${ws?.userId ?? ""}`);

            // Handle connection cleanup
            ws.onclose = () => {
                console.log(`[WS] Connection closed for user: ${ws.userId}`);

                // Clean up connection tracking
                if (ws?.userId) {
                    Redis.client.removeConnection(ws.userId, (ws as any).roomId);
                }
            };

            ws.onerror = (error) => {
                console.error(`[WS] Connection error for user ${ws.userId}:`, error);
            };

        } catch (error: any) {
            console.error("[WS] Authentication failed:", error.message);

            // Send error message to client
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                    type: "error",
                    code: error.statusCode || 500,
                    message: error.message || "Authentication failed"
                }));
            }

            // Close connection
            ws.close(4001, error.message);
        }
    });
};