import { IncomingMessage } from "http";
import { getValue } from "@repo/redis";
import { UserInfo } from "@repo/types";

export interface AuthResult {
    success: boolean;
    userInfo?: UserInfo;
    error?: string;
}

export async function authenticate(
    req: IncomingMessage
): Promise<AuthResult> {
    try {
        const url = new URL(req.url || "", `http://${req.headers.host}`);
        const sessionToken = url.searchParams.get("token");

        console.info(
            "[AUTH] checking header session token for websocket connection - [token: %s]",
            sessionToken
        );

        if (!sessionToken) {
            return { success: false, error: "Authentication error" };
        }

        const userInfo = await getValue(sessionToken);

        if (!userInfo) {
            return { success: false, error: "Authentication error" };
        }

        return { success: true, userInfo };
    } catch (error: any) {
        console.error(error);
        return { success: false, error: "Server Error" };
    }
}
