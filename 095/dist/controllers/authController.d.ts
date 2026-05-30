import { Request, Response, NextFunction } from 'express';
export declare const loginValidation: import("express-validator").ValidationChain[];
export declare const login: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getCurrentUser: (req: Request, res: Response, next: NextFunction) => Promise<void>;
