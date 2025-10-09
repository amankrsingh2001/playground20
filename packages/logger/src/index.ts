import winston from 'winston';
import { ConsoleTransport } from './transports/console';
import { FileTransport } from './transports/file';
import { HttpTransport } from './transports/http';
import { developmentFormat } from './formats/development';
import dotenv from "dotenv";
dotenv.config({ path: "../../.env" }); // load root env

interface LoggerOption {
    serviceName: string;
    level?: string;
    enableConsole?: boolean;
    enableFile?: boolean;
    enableHttp?: boolean;
}

export class AppLogger {
    private logger: winston.Logger;
    private serviceName: string;

    constructor(options: LoggerOption) {
        this.serviceName = options.serviceName;

        const transports: winston.transport[] = [];

        // Console transport (development)
        
        if (options.enableConsole ?? true) {
            console.log("development format", process.env.NODE_ENV);
            transports.push(new ConsoleTransport({
                format: process.env.NODE_ENV === 'production' ?
                    winston.format.json() :
                    developmentFormat
            }));
        }

        // File transport (production)
        if (options.enableFile ?? (process.env.NODE_ENV === 'production')) {
            transports.push(new FileTransport({
                filename: `logs/${this.serviceName}-%DATE%.log`
            }));
        }

        // HTTP transport (monitoring)
        if (options.enableHttp && process.env.LOGGING_API_URL) {
            transports.push(new HttpTransport({
                url: process.env.LOGGING_API_URL,
                serviceName: this.serviceName,
                headers: {
                    'Authorization': `Bearer ${process.env.LOGGING_API_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            }));
        }
 

        this.logger = winston.createLogger({
            level: options.level || process.env.LOG_LEVEL || 'info',
            transports,
            defaultMeta: {
                service: this.serviceName,
                env: process.env.NODE_ENV || 'development'
            }
        });

        // Add uncaught exception handling
        this.setupExceptionHandlers();
    }

    private setupExceptionHandlers() {
        // Handle uncaught exceptions
        process.on('uncaughtException', (error) => {
            this.logger.error('Uncaught Exception', {
                error: error.message,
                stack: error.stack,
                service: this.serviceName
            });
            process.exit(1);
        });

        // Handle unhandled rejections
        process.on('unhandledRejection', (reason: any) => {
            this.logger.error('Unhandled Rejection', {
                reason: reason.message || reason,
                service: this.serviceName
            });
        });
    }

    // HTTP Server specific logging methods
    public httpLog(
        method: string,
        url: string,
        statusCode: number,
        responseTime: number,
        meta?: Record<string, any>
    ) {
        this.logger.info('HTTP Request', {
            method,
            url,
            statusCode,
            responseTime,
            ...meta
        });
    }

    public wsLog(
        event: string,
        userId?: string,
        roomId?: string,
        meta?: Record<string, any>
    ) {
        console.log("🚀 ~ AppLogger ~ wsLog ~ meta:", meta)
        console.log("🚀 ~ AppLogger ~ wsLog ~ userId:", userId)
        console.log("🚀 ~ AppLogger ~ wsLog ~ event:", event)
        this.logger.info('WebSocket Event', {
            event,
            userId,
            roomId,
            ...meta
        });
    }

    public error(message: string, meta?: Record<string, any>) {
        this.logger.error(message, meta);
    }

    public warn(message: string, meta?: Record<string, any>) {
        this.logger.warn(message, meta);
    }

    public info(message: string, meta?: Record<string, any>) {
        console.log("🚀 ~ AppLogger ~ info ~ meta:", meta)
        this.logger.info(message, meta);
    }

    public debug(message: string, meta?: Record<string, any>) {
        this.logger.debug(message, meta);
    }

    public audit(action: string, userId: string, meta?: Record<string, any>) {
        this.logger.info('AUDIT', {
            action,
            userId,
            ...meta
        });
    }

    // Get logger instance
    public getLogger() {
        return this.logger;
    }
}

// Create logger instances for different services
export const apiLogger = new AppLogger({
    serviceName: 'api-server',
    level: process.env.API_LOG_LEVEL || 'info',
    // enableHttp: true
    enableConsole: true
});

export const wsLogger = new AppLogger({
    serviceName: 'ws-server',
    level: process.env.WS_LOG_LEVEL || 'info',
    // enableHttp: true
    enableConsole: true
});

// Create child loggers for specific contexts
export const battleLogger = new AppLogger({
    serviceName: 'battle-manager',
    level: process.env.BATTLE_LOG_LEVEL || 'debug',
    // enableHttp: true
    enableConsole: true
});

export const roomLogger = new AppLogger({
    serviceName: 'room-manager',
    level: process.env.ROOM_LOG_LEVEL || 'info',
    enableConsole: true
    // enableHttp: true
});

export const workerLogger = new AppLogger({
    serviceName: 'worker',
    level: process.env.ROOM_LOG_LEVEL || 'info',
    enableConsole: true
})

// Default export
export default apiLogger;