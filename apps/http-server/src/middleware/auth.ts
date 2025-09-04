import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";
import { redis, session } from "@repo/redis";
import { UserInfo } from "@repo/types";

const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const sessionToken: string | undefined = req.cookies?.['session-token'];
    // Parse cookie header to get sessionToken value
    console.log("[AUTH] checking header session token - [path: %s, token: %s]", req.path, sessionToken)
    const nonSecurePath = [
        "/api/v1/user/signup",
        "/api/v1/user/signin",
    ]
    if (nonSecurePath.includes(req.path)) return next();
    if (!sessionToken) {
        throw new ApiError(401, "UNAUTHORIZED_ACCESS");
    }

    const userDetails = await session.validate(sessionToken);

    //Session not exist in the redis
    if (!userDetails?.valid) {  
        throw new ApiError(401, "UNAUTHORIZED_ACCESS");
    }

    const userInfo: UserInfo = {
        id: userDetails?.userId ?? "",
        email: userDetails?.data?.email ?? "",
        fullName: userDetails?.data?.fullName ?? "",
        profileImage: userDetails?.data?.profileImage ?? "",
    }

    req.auth = {
        userInfo
    }

    req.context = {
        deviceId: userDetails?.data?.deviceId,
        ipAddress: userDetails?.data?.ipAddress,
        userAgent: userDetails?.data?.userAgent,
    }
    next();
}

export default authMiddleware;