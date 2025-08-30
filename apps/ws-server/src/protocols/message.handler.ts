// import { WebSocket } from "ws";
// import { WebSocketMessage, MessageType } from "./messages";
// import { battleLogger } from "@repo/logger";

// export class MessageHandler {
//     constructor(private battleManager: any) { }

//     handleMessage(
//         ws: WebSocket & { userId?: string; roomId?: string },
//         data: WebSocket.Data
//     ) {
//         try {
//             const message = JSON.parse(data.toString()) as WebSocketMessage;

//             switch (message.type) {
//                 case MessageType.ANSWER:
//                     this.handleAnswer(ws, message);
//                     break;

//                 case MessageType.READY:
//                     this.handleReady(ws, message);
//                     break;

//                 case MessageType.LEAVE:
//                     this.handleLeave(ws, message);
//                     break;

//                 default:
//                     battleLogger.warn('Unknown message type', {
//                         type: message.type,
//                         userId: ws.userId
//                     });
//                     this.sendError(ws, 400, 'UNKNOWN_MESSAGE_TYPE');
//             }
//         } catch (error) {
//             battleLogger.error('Failed to parse message', {
//                 userId: ws.userId,
//                 error: (error as Error).message
//             });
//             this.sendError(ws, 400, 'INVALID_MESSAGE_FORMAT');
//         }
//     }

//     private handleAnswer(
//         ws: WebSocket & { userId?: string; roomId?: string },
//         message: any
//     ) {
//         if (!ws.userId || !ws.roomId) {
//             this.sendError(ws, 400, 'NOT_AUTHENTICATED');
//             return;
//         }

//         if (!message.payload?.selectedOption) {
//             this.sendError(ws, 400, 'MISSING_SELECTED_OPTION');
//             return;
//         }

//         this.battleManager.handleAnswer(
//             ws.roomId,
//             ws.userId,
//             message.payload.selectedOption
//         );
//     }

//     private handleReady(
//         ws: WebSocket & { userId?: string; roomId?: string },
//         message: any
//     ) {
//         if (!ws.userId || !ws.roomId) {
//             this.sendError(ws, 400, 'NOT_AUTHENTICATED');
//             return;
//         }

//         this.battleManager.handleReady(ws.roomId, ws.userId);
//     }

//     private handleLeave(
//         ws: WebSocket & { userId?: string; roomId?: string },
//         message: any
//     ) {
//         if (!ws.userId || !ws.roomId) {
//             this.sendError(ws, 400, 'NOT_AUTHENTICATED');
//             return;
//         }

//         this.battleManager.handleLeave(ws.roomId, ws.userId);
//     }

//     private sendError(ws: WebSocket, code: number, message: string) {
//         if (ws.readyState === WebSocket.OPEN) {
//             ws.send(JSON.stringify({
//                 type: MessageType.ERROR,
//                 payload: {
//                     code,
//                     message
//                 }
//             }));
//         }
//     }
// }