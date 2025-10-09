/**
 * Room-related Redis key patterns
 * All room keys follow the pattern: room:{roomId}:{type}
 */
export const RoomKeys = {
    /**
     * Room metadata (host, capacity, game mode, etc.)
     */
    meta: (roomId: string) => `room:${roomId}:meta`,

    /**
     * Set of user IDs in the room
     */
    members: (roomId: string) => `room:${roomId}:members`,

    /**
     * Hash of user statuses (waiting, ready, eliminated)
     */
    status: (roomId: string) => `room:${roomId}:status`,

    /**
     * Public room tracking (sorted set of rooms by player count)
     */
    publicRooms: () => 'public_rooms',

    /**
     * Private room invite codes
     */
    privateRoomCode: (code: string) => `private_room:codes:${code}`,

    /**
     * Room capacity limit
     */
    capacity: (roomId: string) => `room:${roomId}:capacity`,

    /**
     * Room metrics (questions asked, etc.)
     */
    metrics: (roomId: string) => `room:${roomId}:metrics`
} as const;