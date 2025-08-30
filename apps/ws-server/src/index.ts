import { WebSocketServer, WebSocket } from "ws";
import { applyAuthToWSS } from "./middleware/auth.middleware";
// import { BattleManager } from "./battle/manager/battle.manager";
// import { redis } from "@repo/redis";
import { wsLogger } from "@repo/logger";
import { wsConnectionLogger, wsErrorLogger, wsMessageLogger } from "./middleware/logging.middleware";
import dotenv from "dotenv";
dotenv.config({ path: "../../.env" }); // load root env


const PORT = Number(process.env.WS_PORT) || 8080;

// Create WebSocket server
const wss = new WebSocketServer({ port: PORT });

// Apply authentication middleware
applyAuthToWSS(wss);


// Initialize battle manager
// const battleManager = new BattleManager(wss);

// Handle connections
wss.on('connection', (ws: WebSocket & {
    userId?: string;
    roomId?: string;
    // battleManager?: BattleManager
}) => {
    wsConnectionLogger(ws);
    // Set up event handlers directly

    ws.on("message", (data, isBinary) => {
        console.log("🚀 ~ message:", data.toString());
        wsMessageLogger(ws, data.toString());
        // try {
        //     battleManager.handleMessage(ws, data);
        // } catch (error) {
        //     wsLogger.error('Error handling message', {
        //         error: (error as Error).message,
        //         userId: ws.userId
        //     });
        // }
    });

//     /fix Conversion of type 'ErrorEvent' to type 'Error' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
// Property 'name' is missing in type 'ErrorEvent' but required in type 'Error'.

// You should first cast the error to unknown, then to Error, to satisfy TypeScript's type safety.

    ws.onerror = (error) => {
        wsErrorLogger(ws, error);
    };

    ws.onclose = () => {
        // battleManager.handleDisconnect(ws);
    };

    // Store battle manager reference
    // ws.battleManager = battleManager;

    wsLogger.info(`Connected user: ${ws.userId}`);
});

wsLogger.info(`WebSocket server running on port ${PORT}`, {name: "Nitish Kumar"});

// Setup graceful shutdown
process.on('SIGTERM', () => {
    wsLogger.info('Shutting down WebSocket server...');

    // Close all connections
    wss.clients.forEach(client => {
        client.close(1000, "Server is restarting");
    });

    // Close server
    wss.close(() => {
        wsLogger.info('WebSocket server closed');
        process.exit(0);
    });
});