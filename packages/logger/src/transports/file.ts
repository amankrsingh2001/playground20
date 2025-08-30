import DailyRotateFile from 'winston-daily-rotate-file';
import { TransformableInfo } from 'logform';

interface FileTransportOptions {
    filename: string;
    datePattern?: string;
    zippedArchive?: boolean;
    maxSize?: string;
    maxFiles?: string;
}

export class FileTransport extends DailyRotateFile {
    constructor(options: FileTransportOptions) {
        super({
            filename: options.filename,
            datePattern: options.datePattern || 'YYYY-MM-DD',
            zippedArchive: options.zippedArchive !== false,
            maxSize: options.maxSize || '20m',
            maxFiles: options.maxFiles || '14d',
            format: require('winston').format.json()
        });
    }
}