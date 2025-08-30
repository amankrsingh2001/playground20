// export enum MessageType {
//     STATE = "state",
//     QUESTION = "question",
//     RESULTS = "results",
//     ANSWER = "answer",
//     READY = "ready",
//     LEAVE = "leave",
//     ELIMINATED = "eliminated",
//     END = "end",
//     ERROR = "error"
// }

// export interface Message {
//     type: MessageType;
//     payload: any;
// }

// // State messages
// export interface StateMessage {
//     type: MessageType.STATE;
//     payload: {
//         state: string;
//         playerCount: number;
//     };
// }

// // Question messages
// export interface QuestionMessage {
//     type: MessageType.QUESTION;
//     payload: {
//         question: {
//             id: string;
//             text: string;
//             options: string[];
//             difficulty: number;
//         };
//         round: number;
//         timeLimit: number;
//     };
// }

// // Results messages
// export interface ResultsMessage {
//     type: MessageType.RESULTS;
//     payload: {
//         results: Array<{
//             userId: string;
//             time: number;
//             score: number;
//         }>;
//     };
// }

// // Answer message
// export interface AnswerMessage {
//     type: MessageType.ANSWER;
//     payload: {
//         selectedOption: string;
//     };
// }

// // Eliminated message
// export interface EliminatedMessage {
//     type: MessageType.ELIMINATED;
//     payload: {
//         userIds: string[];
//     };
// }

// // End game message
// export interface EndGameMessage {
//     type: MessageType.END;
//     payload: {
//         winner: string;
//         finalScores: Record<string, number>;
//     };
// }

// // Error message
// export interface ErrorMessage {
//     type: MessageType.ERROR;
//     payload: {
//         code: number;
//         message: string;
//     };
// }

// export type WebSocketMessage =
//     | StateMessage
//     | QuestionMessage
//     | ResultsMessage
//     | AnswerMessage
//     | EliminatedMessage
//     | EndGameMessage
//     | ErrorMessage;