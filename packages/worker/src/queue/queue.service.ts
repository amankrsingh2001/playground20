import { BaseTask, TaskType, WorkerTask } from "./queue.type";
import { v4 as uuidv4 } from 'uuid';


export class QueueServie {
    /**
     * Queue a task for background processing
     */
    static queueTask<T extends TaskType>(
        type: T,
        data: WorkerTask extends { type: T } ? WorkerTask['data'] : never,
        priority: number = 0
    ): string {
        const task: BaseTask = {
            id: `task_${uuidv4()}`,
            type, 
            data,
            createdAt: Date.now(),
            retryCount: 0,
            priority,
        };
        return task.id;
    }
}