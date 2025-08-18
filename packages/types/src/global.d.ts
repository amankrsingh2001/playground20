// /packages/types/src/global.d.ts
import "express";

declare module "express-serve-static-core" {
    interface Request {
        auth?: {
            id: string,
            email: string,
            fullName: string,
            profileImage: string,
        };
    }
}

// Example: adding NodeJS.ProcessEnv typings
declare namespace NodeJS {
    interface ProcessEnv {
        DATABASE_URL: string;
        NODE_ENV: "development" | "production" | "test";
    }
}
