import { Request, Response, NextFunction } from 'express';
export declare const getRevenueStatistics: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getRevenueByCategory: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getMonthlyRevenue: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const generateDailyReport: (_req: Request, res: Response, next: NextFunction) => Promise<void>;
