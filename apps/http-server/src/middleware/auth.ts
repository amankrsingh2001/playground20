import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";
import { getValue } from "@repo/redis";

interface UserInfo {
    id: string,
    email: string,
    fullName: string,
    profileImage: string,
}

interface AuthRequest extends Request {
    auth?: {
        userInfo: UserInfo;
    };
}

const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const sessionToken = req.headers["session-token"] as string | undefined;
    console.log("[AUTH] checking header session token - [path: %s, token: %s]", req.path, sessionToken)
    const nonSecurePath = [
        "api/v1/auth/register",
        "api/v1/auth/login",
    ]
    if (nonSecurePath.includes(req.path)) return next();
    if (!sessionToken) {
        throw new ApiError(401, "UNAUTHORIZED_ACCESS");
    }

    const userDetails: string = await getValue(sessionToken);

    const parsedUserInfo: UserInfo = JSON.parse(userDetails);
    //Session not exist in the redis
    if (!parsedUserInfo?.id) {
        throw new ApiError(401, "UNAUTHORIZED_ACCESS");
    }
    req.auth = {
        userInfo: { ...parsedUserInfo }
    }
    next();
}

export default authMiddleware;