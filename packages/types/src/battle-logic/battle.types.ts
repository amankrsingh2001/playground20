export enum GameState {
    WAITING = "waiting",
    QUESTION = "question",
    RESULTS = "results",
    ENDED = "ended"
}

export enum GameMode {
    CLASSIC = "CLASSIC",
    BATTLE_ROYALE = "BATTLE_ROYALE"
}

export enum MessageType {
    JOIN = "join",
    READY = "ready",
    START = "start",
    QUESTION = "question",
    ANSWER = "answer",
    RESULTS = "results",
    ELIMINATED = "eliminated",
    END = "end",
    ERROR = "error"
}

export enum RoomStatus {
    WAITING = "waiting",
    ACTIVE = "active",
    ENDED = "ended",
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

export interface Question {
    id: string;
    text: string;
    options: string[];
    correctOption: string;
    difficulty: number;
}

export interface Answer {
    userId: string;
    selectedOption: string;
    timeTakenMs: number;
    isCorrect: boolean;
    questionNo: number;
}

export interface RoomSettings {
    gameMode: GameMode;
    questionLimit: number;
    timePerQuestion: number;
    difficultyProgression?: boolean;
    initialDifficulty?: Difficulty;
    // maxDifficulty?: number;
    eliminationCount?: number;
    difficultyIncrement?: number;
}