import { prismaClient } from '@repo/db';
import { workerLogger } from '@repo/logger';

/**
 * Process answer submission
 */
export async function processAnswer(data: {
    roomId: string;
    userId: string;
    selectedOption: string;
    timestamp: number;
    questionId: string;
}) {
    try {
        const { roomId, userId, questionId, selectedOption, timestamp } = data;

        // Get current round
        const activeRound = prismaClient.round.findFirst({
            where: {
                roomId,
                active: true,
            },
            include: {
                questions: {
                    where: { questionId },
                    include: { question: true }
                }
            }
        })

        if(!activeRound) {
            workerLogger.warn('No active round found', { roomId });
            return;
        }

        

    } catch (error) {
        workerLogger.error('Answer processing failed', {
            error: (error as Error).message,
            data
        });
        throw error;
    }
}

/**
 * Calculate speed rank for a user's answer
 */
async function calculateSpeedRank(roomId: string, userId: string, timeTakenMs: number): Promise<number> {
    const answers = await prismaClient.answer.findMany({
        where: {
            round: {
                roomId,
                number: {
                    equals: await getCurrentRound(roomId)
                }
            }
        },
        select: {
            timeTakenMs: true
        }
    });

    const sortedTimes = answers
        .map(a => a.timeTakenMs)
        .sort((a, b) => a - b);

    return sortedTimes.indexOf(timeTakenMs) + 1;
}

/**
 * Get current round number
 */
// async function getCurrentRound(roomId: string): Promise<number> {
//     const room = await prismaClient.room.findUnique({
//         where: { id: roomId },
//         select: { number: true }
//     });

//     return room?.currentRound || 1;
// }