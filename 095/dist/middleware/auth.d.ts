import { Request, Response, NextFunction } from 'express';
import { JwtPayload, UserRole } from '../types';
declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
            fullUser?: any;
        }
    }
}
export declare const authenticate: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const authorize: (...roles: UserRole[]) => (req: Request, _res: Response, next: NextFunction) => void;
export declare const authorizeOwnOrAdmin: (idParam?: string) => (req: Request, _res: Response, next: NextFunction) => void;
export declare const permissionMatrix: {
    user: {
        create: UserRole[];
        read: UserRole[];
        update: UserRole[];
        delete: UserRole[];
    };
    category: {
        create: UserRole[];
        read: never[];
        update: UserRole[];
        delete: UserRole[];
    };
    product: {
        create: UserRole[];
        read: never[];
        update: UserRole[];
        delete: UserRole[];
    };
    material: {
        create: UserRole[];
        read: UserRole[];
        update: UserRole[];
        delete: UserRole[];
        stockIn: UserRole[];
        stockOut: UserRole[];
    };
    order: {
        create: UserRole[];
        read: UserRole[];
        update: UserRole[];
        delete: UserRole[];
        updateStatus: UserRole[];
        schedule: UserRole[];
        return: UserRole[];
    };
    ledger: {
        create: UserRole[];
        read: UserRole[];
        update: UserRole[];
        delete: UserRole[];
        audit: UserRole[];
        export: UserRole[];
    };
};
export declare const checkPermission: (module: keyof typeof permissionMatrix, action: string) => (req: Request, _res: Response, next: NextFunction) => void;
export declare const roleHierarchy: Record<UserRole, UserRole[]>;
export declare const hasPermission: (userRole: UserRole, requiredRole: UserRole) => boolean;
