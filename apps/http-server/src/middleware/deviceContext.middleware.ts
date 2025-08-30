// middleware/deviceContext.middleware.ts
import { v4 as uuidv4 } from 'uuid';
import { Request, Response, NextFunction } from 'express';
import { getClientIp } from '../utils/getClientIp';

export const deviceContextMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // 1. Get IP Address (respects proxies)
  const ipAddress = getClientIp(req);

  // 2. Get User Agent
  const userAgent = req.headers['user-agent'] || null;

  // 3. Get or Generate Device ID
  let deviceId = req.cookies?.deviceId;
  if (!deviceId) {
    deviceId = uuidv4();
    res.cookie('deviceId', deviceId, {
      httpOnly: true,
      maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    });
  }

  // Attach context to request
  req.context = {
    deviceId,
    ipAddress,
    userAgent: userAgent ? userAgent.toString() : undefined,
  };

  next();
};
