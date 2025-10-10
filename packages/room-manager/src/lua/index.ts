/**
 * Atomic room join Lua script
 * 
 * Ensures:
 * - Room exists
 * - Room isn't full
 * - Player isn't already in room
 * - Public room count is updated
 * 
 * Returns:
 * - >0: New player count (success)
 * - -1: Room is full
 * - -2: Room not found
 */
export const JOIN_ROOM_SCRIPT = `
local roomId = KEYS[1]
local userId = ARGV[1]
local capacity = tonumber(redis.call('hget', 'room:' .. roomId .. ':meta', 'capacity'))
local memberCount = redis.call('scard', 'room:' .. roomId .. ':members')

-- Check if user is already in the room
if redis.call('sismember', 'room:' .. roomId .. ':members', userId) == 1 then
  return -3  -- Already joined
end

-- Check if room exists
if not capacity then
  return -2
end

-- Check room capacity
if memberCount >= capacity then
  return -1
end

-- Add user to room
redis.call('sadd', 'room:' .. roomId .. ':members', userId)
redis.call('hset', 'room:' .. roomId .. ':status', userId, 'waiting')
-- Log for debugging
redis.log(redis.LOG_WARNING, "Joining room: " .. roomId .. ", user: " .. userId)

-- Update public room count if applicable
local roomType = redis.call('hget', 'room:' .. roomId .. ':meta', 'type')
redis.log(redis.LOG_WARNING, "Room type: " .. (roomType or "nil"))
if roomType == 'PUBLIC' then
  redis.call('zincrby', 'public_rooms', 1, roomId)
  redis.log(redis.LOG_WARNING, "Room type inside the public room: " .. (roomType or "nil"))
end
return memberCount + 1
`;

/**
 * Atomic room leave Lua script
 * 
 * Ensures:
 * - Player is removed from room
 * - Public room count is updated
 * - Empty rooms are cleaned up
 */
export const LEAVE_ROOM_SCRIPT = `
local roomId = KEYS[1]
local userId = ARGV[1]

-- Remove user from room
redis.call('srem', 'room:' .. roomId .. ':members', userId)
redis.call('hdel', 'room:' .. roomId .. ':status', userId)

-- Update public room count
local roomType = redis.call('hget', 'room:' .. roomId .. ':meta', 'type')
if roomType == 'public' then
  local playerCount = redis.call('scard', 'room:' .. roomId .. ':members')
  
  if playerCount == 0 then
    redis.call('zrem', 'public_rooms', roomId)
    -- Cleanup empty room after 5min
    redis.call('expire', 'room:' .. roomId .. ':members', 300)
  else
    redis.call('zincrby', 'public_rooms', -1, roomId)
  end
end

return redis.call('scard', 'room:' .. roomId .. ':members')
`;

/**
 * Public room selection script
 * 
 * Finds the first public room with <20 players
 * Returns:
 * - Room ID if available
 * - null if no room available
 */
export const GET_PUBLIC_ROOM_SCRIPT = `
return redis.call('zrangebyscore', 'public_rooms', '-inf', '19', 'limit', 0, 1)[1]
`;