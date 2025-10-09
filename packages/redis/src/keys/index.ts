import { RoomKeys } from "./room.keys";
import { GameKeys } from "./game.keys";
import { SessionKeys } from "./session.keys";

/**
 * Unified Redis key manager for the entire application
 */
export const RedisKeys = {
    room: RoomKeys,
    game: GameKeys,
    session: SessionKeys,

    /**
     * Validate if a key matches expected patterns
     */
    validate: {
        isRoomKey: (key: string) => /^room:[^:]+:(meta|members|status|capacity|metrics)$/.test(key),
        isGameKey: (key: string) => /^game:[^:]+:(state|round|currentQuestion|answers|scores|winner)$/.test(key),
        isSessionKey: (key: string) => /^session:|user:[^:]+:connections|login_attempts:/.test(key)
    }
} as const;