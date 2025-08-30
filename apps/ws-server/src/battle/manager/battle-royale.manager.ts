// import { WebSocket, WebSocketServer } from "ws";
// import { BattleManager as BaseBattleManager } from "./battle.manager";

// // Battle Royale mode extends base battle manager with specific behavior
// export class BattleManager extends BaseBattleManager {
//     // Battle Royale specific overrides
//     protected async getTargetDifficulty(
//         roomId: string,
//         round: number,
//         mode: GameMode
//     ): Promise<number> {
//         // Battle Royale always increases difficulty
//         const settings = await this.getRoomSettings(roomId);
//         return Math.min(5, 1 + Math.floor((round - 1) * (settings.difficultyIncrement || 1)));
//     }
// }