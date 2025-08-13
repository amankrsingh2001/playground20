export class ApiError extends Error {
    public statusCode: number;
    public data: any;
    public success: boolean;
    public errors: Record<string, string>;

    constructor(
        statusCode: number,
        message = "Something went wrong",
        errors: Record<string, string> = {},
        stack = ""
    ) {
        super(message);
        this.statusCode = statusCode;
        this.data = null;
        this.message = message;
        this.success = false;
        this.errors = errors;

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}