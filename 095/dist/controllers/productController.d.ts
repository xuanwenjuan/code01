import { Request, Response, NextFunction } from 'express';
export declare const createProductValidation: import("express-validator").ValidationChain[];
export declare const updateProductValidation: import("express-validator").ValidationChain[];
export declare const createProduct: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getProductList: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getProductById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const updateProduct: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteProduct: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const batchUpdateProductStatus: (req: Request, res: Response, next: NextFunction) => Promise<void>;
