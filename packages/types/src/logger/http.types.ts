export interface HttpRequest {
    method: string;
    url: string;
    status: number;
    responseTime: number;
    remoteIp: string;
    userAgent: string;
    userId?: string;
}

export interface HttpResponse {
    statusCode: number;
    headers: Record<string, string>;
    body: any;
}