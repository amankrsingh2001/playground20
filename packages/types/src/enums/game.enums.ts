export enum GameState {
    WAITING = "WAITING",
    QUESTION = "QUESTION",
    RESULTS = "RESULTS",
    ENDED = "ENDED"
}

export enum GameMode {
    CLASSIC = "CLASSIC",
    BATTLE_ROYALE = "BATTLE_ROYALE"
}

export enum RoomStatus {
    WAITING = "WAITING",
    ACTIVE = "ACTIVE",
    ENDED = "ENDED",
}

export enum RoomType {
    PRIVATE = "PRIVATE",
    PUBLIC = "PUBLIC"
}

export enum PlayerStatus {
    WAITING = "WAITING",    // Joined but not ready
    READY = "READY",     // Ready to play
    ACTIVE = "ACTIVE",   // Playing
    ELIMINATED = "ELIMINATED", // Eliminated (Battle Royale)
    LEFT = "LEFT",   // Left room
    AFK = "AFK",    // Inactive
}

export enum Difficulty {
    EASY = "EASY",     // 1
    MEDIUM = "MEDIUM",   // 2
    HARD = "HARD",     // 3
    EXPERT = "EXPERT",   // 4
    MASTER = "MASTER",   // 5
}