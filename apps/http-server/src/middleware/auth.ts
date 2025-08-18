import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";
import { getValue } from "@repo/redis";
import { UserInfo } from "@repo/types";

const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    let sessionToken: string | undefined;

    // Parse cookie header to get sessionToken value
    const cookieHeader = req.headers.cookie;
    if (cookieHeader) {
        const cookies = cookieHeader.split(";").map(cookie => cookie.trim());
        for (const cookie of cookies) {
            if (cookie.startsWith("session-token=")) {
                sessionToken = cookie.replace("session-token=", "");
                break;
            }
        }
    }
    console.log("[AUTH] checking header session token - [path: %s, token: %s]", req.path, sessionToken)
    const nonSecurePath = [
        "/api/v1/user/signup",
        "/api/v1/user/signin",
    ]
    if (nonSecurePath.includes(req.path)) return next();
    if (!sessionToken) {
        throw new ApiError(401, "UNAUTHORIZED_ACCESS");
    }

    const userDetails: UserInfo = await getValue(`user:${sessionToken}`);

    //Session not exist in the redis
    if (!userDetails?.id) {
        throw new ApiError(401, "UNAUTHORIZED_ACCESS");
    }
    req.auth = {
        userInfo: userDetails,
    }
    next();
}

export default authMiddleware;