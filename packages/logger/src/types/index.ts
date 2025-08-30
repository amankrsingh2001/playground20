export interface HttpRequest {
    method: string;
    url: string;
    status: number;
    responseTime: number;
    remoteIp: string;
    userAgent: string;
    userId?: string;
    body?: any;
    query?: any;
    params?: any;
}

export interface WebSocketEvent {
    event: string;
    userId?: string;
    roomId?: string;
    payload?: any;
    timestamp: string;
}

export interface LogMeta {
    service: string;
    env: string;
    timestamp: string;
    [key: string]: any;
}