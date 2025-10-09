import { GameMode, Difficulty } from "../enums";
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
    initialDifficulty?: number;
    maxDifficulty?: number;
    eliminationCount?: number;
    difficultyIncrement?: number;
}