import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";

export const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.log('Error caught by middleware:', err);

    if (err instanceof ApiError) {
        res.status(err.statusCode).json({
            success: err.success,
            message: err.message,
            errors: err.errors,
            data: err.data
        });
        return;
    }

    res.status(500).json({
        success: false,
        message: "Internal Server Error",
        errors: {},
        data: null
    })
    return; 
};