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