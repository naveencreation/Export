import { Request, Response, NextFunction } from 'express';
import * as dashboardService from '../services/dashboard.service';

export const getDashboardStats = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const stats = await dashboardService.getDashboardStats();
        res.json(stats);
    } catch (error) {
        next(error);
    }
};
