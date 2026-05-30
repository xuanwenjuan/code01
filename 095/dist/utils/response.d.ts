import { ApiResponse, PaginatedResponse } from '../types';
export declare const successResponse: <T>(data?: T, message?: string) => ApiResponse<T>;
export declare const createdResponse: <T>(data?: T, message?: string) => ApiResponse<T>;
export declare const paginatedResponse: <T>(list: T[], total: number, page: number, pageSize: number, message?: string) => ApiResponse<PaginatedResponse<T>>;
export declare const errorResponse: (message: string, code?: number, details?: any) => ApiResponse<null>;
export declare const validationErrorResponse: (errors: any[], message?: string) => ApiResponse<{
    errors: any[];
}>;
export declare const unauthorizedResponse: (message?: string) => ApiResponse<null>;
export declare const forbiddenResponse: (message?: string) => ApiResponse<null>;
export declare const notFoundResponse: (message?: string) => ApiResponse<null>;
export declare const serverErrorResponse: (message?: string, details?: any) => ApiResponse<null>;
export declare const conflictResponse: (message?: string) => ApiResponse<null>;
