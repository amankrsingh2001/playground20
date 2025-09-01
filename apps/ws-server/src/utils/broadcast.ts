import { WebSocket, WebSocketServer } from "ws";
import { wsLogger } from "@repo/logger";

/**
 * Broadcast a message to all clients in a room
 */
export const broadcastToRoom = (
    wss: WebSocketServer,
    roomId: string,
    message: any
): void => {
    wsLogger.debug('Broadcasting to room', {
        roomId,
        type: message.type,
        clients: wss.clients.size
    });
    const payload = JSON.stringify(message);
    let count = 0;

    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN &&
            (client as any).roomId === roomId) {
            client.send(payload);
            count++;
        }
    });

    wsLogger.debug('Broadcast to room', {
        roomId,
        message: message.type,
        count
    });
};

/**
 * Broadcast a message to a specific user
 */
export const broadcastToUser = (
    wss: WebSocketServer,
    userId: string,
    message: any
): void => {
    const payload = JSON.stringify(message);
    let count = 0;

    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN &&
            (client as any).userId === userId) {
            client.send(payload);
            count++;
        }
    });

    wsLogger.debug('Broadcast to user', {
        userId,
        message: message.type,
        count
    });
};

/**
 * Get number of active connections
 */
export const getActiveConnections = (wss: WebSocketServer): number => {
    return wss.clients.size;
};

/**
 * Get connections by room
 */
export const getConnectionsByRoom = (wss: WebSocketServer): Record<string, number> => {
    const roomCounts: Record<string, number> = {};

    wss.clients.forEach(client => {
        const roomId = (client as any).roomId;
        if (roomId) {
            roomCounts[roomId] = (roomCounts[roomId] || 0) + 1;
        }
    });

    return roomCounts;
};