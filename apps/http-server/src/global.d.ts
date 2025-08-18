import "express";

declare module "express-serve-static-core" {
    interface Request {
        auth?:{
            userInfo?: {
                id: string,
                email: string,
                fullName: string,
                profileImage: string,
            }
        };
    }
}