import { redis } from "@repo/redis";
import { PrismaClient } from "@repo/db";
import { processAnswer } from "./processors/answer.processor";
// import { processElimination } from "./processors/elimination.processor";

const prisma = new PrismaClient();
const WORKER_COUNT = 3; // Match your CPU cores

// Create multiple worker processes
for (let i = 0; i < WORKER_COUNT; i++) {
    startWorker(`worker-${i}`);
}

function startWorker(workerId: string) {
    console.log(`Worker ${workerId} started`);

    // Process queue at regular intervals
    setInterval(async () => {
        try {
            // Get batch of tasks
            const tasks = await redis.lrange('db-queue', 0, 9);
            if (tasks.length === 0) return;

            // Process each task type appropriately
            for (const taskStr of tasks) {
                const task = JSON.parse(taskStr);

                try {
                    switch (task.type) {
                        case 'ANSWER':
                            await processAnswer(prisma, task.data);
                            break;
                        case 'ELIMINATION':
                            await processElimination(prisma, task.data);
                            break;
                        // Other task types...
                    }

                    // Remove processed task
                    await redis.lrem('db-queue', 1, taskStr);

                } catch (error) {
                    await handleTaskFailure(task, error);
                }
            }

        } catch (error) {
            console.error(`Worker ${workerId} error:`, error);
        }
    }, 100); // Process every 100ms
}

async function handleTaskFailure(task: any, error: Error) {
    if (task.retryCount >= 3) {
        // Move to dead letter queue after 3 failures
        await redis.lpush('dlq', JSON.stringify({
            ...task,
            lastError: error.message,
            failedAt: Date.now()
        }));
        await redis.lrem('db-queue', 1, JSON.stringify(task));
    } else {
        // Increment retry count and keep in queue
        task.retryCount++;
        await redis.lset('db-queue', 0, JSON.stringify(task));
    }
}