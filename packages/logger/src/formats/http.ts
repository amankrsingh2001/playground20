import { format } from 'winston';

// HTTP request format
export const httpRequestFormat = format.printf((info: any) => {
    const httpRequest = info.httpRequest || {};
    return `${info.timestamp} ${info.level.toUpperCase()} ${httpRequest.method || 'N/A'} ${httpRequest.url || 'N/A'} ${httpRequest.status || 'N/A'} ${httpRequest.responseTime || 'N/A'}ms`;
});

// HTTP access log format (Apache-style)
export const accessFormat = format.printf((info: any) => {
    const httpRequest = info.httpRequest || {};
    return `${httpRequest.remoteIp || '-'} - ${httpRequest.userId || '-'} [${info.timestamp}] "${httpRequest.method || 'N/A'} ${httpRequest.url || 'N/A'} HTTP/1.1" ${httpRequest.status || 'N/A'} ${httpRequest.responseTime || 'N/A'}`;
});