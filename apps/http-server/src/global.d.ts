// types/express.d.ts
import 'express';

declare global {
    namespace Express {
        interface Request {
            auth?: {
                userInfo?: {
                    id: string;
                    email: string;
                    fullName: string;
                    profileImage: string;
                };
            };
            context?: {
                deviceId?: string;
                ipAddress?: string;
                userAgent?: string;
            };
        }
    }
}