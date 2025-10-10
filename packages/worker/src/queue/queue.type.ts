import { GameMode, RoomType, PlayerStatus } from '@repo/types';

export type TaskType =
    | 'ANSWER'
    | 'ROOM_JOIN'
    | 'ROOM_LEAVE'
    | 'PLAYER_READY'
    | 'PLAYER_ELIMINATED'
    | 'ROOM_COMPLETION'
    | 'ROOM_METRICS';

export interface BaseTask {
    id: string;
    type: TaskType;
    data: any;
    createdAt: number;
    retryCount: number;
    priority?: number;
}

export interface AnswerTask extends BaseTask {
    type: 'ANSWER';
    data: {
        roomId: string;
        userId: string;
        selectedOption: string;
        timestamp: number;
    };
}

export interface RoomJoinTask extends BaseTask {
    type: 'ROOM_JOIN';
    data: {
        roomId: string;
        userId: string;
        timestamp: number;
    };
}

export interface RoomLeaveTask extends BaseTask {
    type: 'ROOM_LEAVE';
    data: {
        roomId: string;
        userId: string;
        timestamp: number;
    };
}

export interface PlayerReadyTask extends BaseTask {
    type: 'PLAYER_READY';
    data: {
        roomId: string;
        userId: string;
        isReady: boolean;
        timestamp: number;
    };
}

export interface PlayerEliminatedTask extends BaseTask {
    type: 'PLAYER_ELIMINATED';
    data: {
        roomId: string;
        userId: string;
        eliminatedRound: number;
        timestamp: number;
    };
}

export interface RoomCompletionTask extends BaseTask {
    type: 'ROOM_COMPLETION';
    data: {
        roomId: string;
        winnerId: string;
        finalScores: Record<string, number>;
        endTime: number;
    };
}

export type WorkerTask =
    | AnswerTask
    | RoomJoinTask
    | RoomLeaveTask
    | PlayerReadyTask
    | PlayerEliminatedTask
    | RoomCompletionTask;