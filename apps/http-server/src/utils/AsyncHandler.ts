import { NextFunction, Request, Response } from "express";

export const asyncHandler = (requestHandler: any) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(requestHandler(req, res, next))
            .catch((error) => {
                console.log('AsyncHandler caught error:', error);
                next(error);
            });
    };
};