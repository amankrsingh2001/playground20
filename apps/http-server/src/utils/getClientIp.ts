import { Request } from 'express';

export function getClientIp(req: Request): string {
    const forwarded = req.headers['x-forwarded-for'];

    if (typeof forwarded === 'string' && forwarded && forwarded.length > 0) {
        const firstIp = forwarded.split(',')[0];
        return firstIp ? firstIp.trim() : 'unknown';
    }

    // if (Array.isArray(forwarded) && forwarded.length > 0) {
    //     const firstForwarded = forwarded[0];
    //     return firstForwarded ? firstForwarded.split(',')[0].trim() : 'unknown';
    // }
    // Handle case where forwarded is undefined or not set

    return (
        req.socket?.remoteAddress ||
        (req as any).connection?.remoteAddress ||
        'unknown'
    );
}
