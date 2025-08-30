// import { WebSocket, WebSocketServer } from "ws";
// import { BattleManager as BaseBattleManager } from "./battle.manager";
// import { GameMode } from "../../types";

// // Classic mode extends base battle manager with specific behavior
// export class BattleManager extends BaseBattleManager {
//     // Classic mode can override specific methods as needed
//     // For example, different scoring or progression logic

//     protected async getTargetDifficulty(
//         roomId: string,
//         round: number,
//         mode: GameMode
//     ): Promise<number> {
//         // Classic mode specific difficulty logic
//         const settings = await this.getRoomSettings(roomId);

//         // Check individual preferences
//         const activePlayers = await this.redis.smembers(`room:${roomId}:members`);
//         const preferences = await Promise.all(
//             activePlayers.map(player =>
//                 this.redis.hget(`room:${roomId}:player:${player}`, 'difficultyPreference')
//             )
//         );

//         const wantsProgression = preferences.some(p => p === 'true');
//         if (!wantsProgression) return settings.initialDifficulty || 1;

//         return Math.min(
//             settings.maxDifficulty || 5,
//             settings.initialDifficulty + Math.floor((round - 1) / 3)
//         );
//     }
// }