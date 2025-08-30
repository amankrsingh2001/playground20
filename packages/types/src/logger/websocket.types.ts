export interface WebSocketEvent {
    event: string;
    payload: any;
    timestamp: string;
}

export interface WebSocketConnection {
    userId: string;
    roomId: string;
    ipAddress: string;
    userAgent: string;
}