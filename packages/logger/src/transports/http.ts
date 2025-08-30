import TransportStream from 'winston-transport';
import axios from 'axios';
import { TransformableInfo } from 'logform';

interface HttpTransportOptions extends TransportStream.TransportStreamOptions {
    url: string;
    serviceName: string;
    headers?: Record<string, string>;
    batchSize?: number;
    flushInterval?: number;
    timeout?: number;
}

export class HttpTransport extends TransportStream {
    private url: string;
    private serviceName: string;
    private headers: Record<string, string>;
    private batchSize: number;
    private flushInterval: number;
    private timeout: number;

    private queue: any[] = [];
    private flushTimer: NodeJS.Timeout | null = null;

    constructor(options: HttpTransportOptions) {
        super({
            level: options.level,
            format: options.format,
            silent: options.silent
        });

        this.url = options.url;
        this.serviceName = options.serviceName;
        this.headers = {
            'Content-Type': 'application/json',
            'User-Agent': 'BattleRoyale-Logger/1.0',
            ...options.headers
        };
        this.batchSize = options.batchSize || 10;
        this.flushInterval = options.flushInterval || 5000;
        this.timeout = options.timeout || 10000;

        this.startFlushInterval();
    }

    public _write(info: TransformableInfo, encoding: string, callback: () => void): void {
        this.queue.push({
            ...info,
            timestamp: new Date().toISOString(),
            service: this.serviceName,
            level: info.level,
            message: info.message
        });

        if (this.queue.length >= this.batchSize) {
            this.flush().catch(console.error);
        }

        callback();
    }

    private async flush(): Promise<void> {
        if (this.queue.length === 0) return;

        const logsToSend = [...this.queue];
        this.queue = [];

        try {
            await axios.post(this.url, logsToSend, {
                headers: this.headers,
                timeout: this.timeout
            });

            this.emit('logged', logsToSend);
        } catch (error: any) {
            console.error(`HTTP Transport failed: ${error.message}`);
            this.queue.unshift(...logsToSend);
            this.emit('error', error);
        }
    }

    private startFlushInterval(): void {
        this.flushTimer = setInterval(() => {
            this.flush().catch(console.error);
        }, this.flushInterval);
    }

    public close(): void {
        if (this.flushTimer) {
            clearInterval(this.flushTimer);
            this.flushTimer = null;
        }

        if (this.queue.length > 0) {
            this.flush().catch(console.error);
        }
    }
}