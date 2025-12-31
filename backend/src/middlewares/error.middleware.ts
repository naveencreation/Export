import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error(err.stack);

    if (err instanceof ZodError) {
        res.status(400).json({
            message: 'Validation Error',
            errors: (err as any).errors,
        });
        return;
    }

    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
            res.status(409).json({
                message: 'Unique constraint violation',
            });
            return;
        }
        if (err.code === 'P2025') {
            res.status(404).json({
                message: 'Record not found',
            });
            return;
        }
    }

    res.status(500).json({
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
};
