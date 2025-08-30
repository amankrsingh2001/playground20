import TransportStream from 'winston-transport';
import { TransformableInfo } from 'logform';

interface ConsoleTransportOptions extends TransportStream.TransportStreamOptions {
    colorize?: boolean;
}

export class ConsoleTransport extends TransportStream {
    private colorize: boolean;

    constructor(options: ConsoleTransportOptions = {}) {
        super(options);
        this.colorize = options.colorize !== false;

        // Bind the log method (important!)
        this.log = this.log.bind(this);
    }

    public log(info: TransformableInfo, next: () => void): void {
        setImmediate(() => {
            const message = this.formatMessage(info);
            console.log(message);
            this.emit('logged', info); // Optional: emit logged event
        });

        // Call the callback (next)
        next();
    }

    // You can keep _write if you want, but `log` is what Winston calls
    // _write is part of the stream interface, but Winston uses `log`
    public _write(info: TransformableInfo, encoding: string, callback: () => void): void {
        this.log(info, callback);
    }

    private formatMessage(info: TransformableInfo): string {
        const timestamp = info.timestamp || new Date().toISOString();
        const level = this.colorize ? this.colorizeLevel(info.level) : info.level.toUpperCase();
        const message = typeof info.message === 'object'
            ? JSON.stringify(info.message)
            : info.message;

        // Extract metadata (all keys except level, message, timestamp)
        const { level: _l, message: _m, timestamp: _t, ...metadata } = info;
        let metaStr = '';
        if (Object.keys(metadata).length > 0) {
            metaStr = `\n${JSON.stringify(metadata, null, 2)}`;
        }
        return `${timestamp} [${level}] ${message}${metaStr}`;
    }

    private colorizeLevel(level: string): string {
        const colors: Record<string, string> = {
            'error': '\x1b[31m',    // Red
            'warn': '\x1b[33m',     // Yellow
            'info': '\x1b[36m',     // Cyan
            'debug': '\x1b[35m',    // Magenta
            'http': '\x1b[32m'      // Green
        };

        const reset = '\x1b[0m';
        const color = colors[level] || '';

        return `${color}${level.toUpperCase()}${reset}`;
    }
}