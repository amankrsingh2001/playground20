/**
 * Game-related Redis key patterns
 * All game keys follow the pattern: game:{roomId}:{type}
 */
export const GameKeys = {
    /**
     * Current game state (waiting, question, results, ended)
     */
    state: (roomId: string) => `game:${roomId}:state`,

    /**
     * Current round number
     */
    round: (roomId: string) => `game:${roomId}:round`,

    /**
     * Current question ID
     */
    currentQuestionId: (roomId: string) => `game:${roomId}:currentQuestion:id`,

    /**
     * Timestamp when current question was sent
     */
    questionSentAt: (roomId: string) => `game:${roomId}:currentQuestion:sentAt`,

    /**
     * Hash of user answers (userId → timeTakenMs)
     */
    answers: (roomId: string) => `game:${roomId}:answers`,

    /**
     * Sorted set of user scores (userId → points)
     */
    scores: (roomId: string) => `game:${roomId}:scores`,

    /**
     * Room winner (set after game ends)
     */
    winner: (roomId: string) => `game:${roomId}:winner`
} as const;