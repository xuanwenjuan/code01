"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = exports.errorHandler = exports.ConflictError = exports.NotFoundError = exports.ForbiddenError = exports.UnauthorizedError = exports.ValidationError = exports.AppError = void 0;
const response_1 = require("../utils/response");
const logger_1 = __importDefault(require("../config/logger"));
class AppError extends Error {
    constructor(message, statusCode = 400, details) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        this.details = details;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
class ValidationError extends AppError {
    constructor(message, details) {
        super(message, 400, details);
    }
}
exports.ValidationError = ValidationError;
class UnauthorizedError extends AppError {
    constructor(message = '未授权访问') {
        super(message, 401);
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends AppError {
    constructor(message = '权限不足') {
        super(message, 403);
    }
}
exports.ForbiddenError = ForbiddenError;
class NotFoundError extends AppError {
    constructor(message = '资源不存在') {
        super(message, 404);
    }
}
exports.NotFoundError = NotFoundError;
class ConflictError extends AppError {
    constructor(message = '资源冲突') {
        super(message, 409);
    }
}
exports.ConflictError = ConflictError;
const errorHandler = (error, req, res, _next) => {
    logger_1.default.error(`[${req.method}] ${req.path} - ${error.message}`, {
        error: error.stack,
        body: req.body,
        params: req.params,
        query: req.query,
        user: req.user,
    });
    if (error instanceof AppError) {
        return res.status(error.statusCode).json((0, response_1.errorResponse)(error.message, error.statusCode, error.details));
    }
    if (error.name === 'ValidationError') {
        return res.status(400).json((0, response_1.validationErrorResponse)([error], error.message));
    }
    if (error.name === 'JsonWebTokenError') {
        return res.status(401).json((0, response_1.unauthorizedResponse)('无效的令牌'));
    }
    if (error.name === 'TokenExpiredError') {
        return res.status(401).json((0, response_1.unauthorizedResponse)('令牌已过期'));
    }
    if (error.name === 'UnauthorizedError') {
        return res.status(401).json((0, response_1.unauthorizedResponse)('未授权访问'));
    }
    if (error.name === 'ForbiddenError') {
        return res.status(403).json((0, response_1.forbiddenResponse)('权限不足'));
    }
    if (error.name === 'NotFoundError') {
        return res.status(404).json((0, response_1.notFoundResponse)('资源不存在'));
    }
    if (error.name === 'SequelizeValidationError') {
        const errors = error.errors.map((e) => ({
            field: e.path,
            message: e.message,
        }));
        return res.status(400).json((0, response_1.validationErrorResponse)(errors, '数据验证失败'));
    }
    if (error.name === 'SequelizeUniqueConstraintError') {
        const errors = error.errors.map((e) => ({
            field: e.path,
            message: `${e.path} 已存在`,
        }));
        return res.status(409).json((0, response_1.validationErrorResponse)(errors, '数据唯一性约束失败'));
    }
    if (error.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(400).json((0, response_1.errorResponse)('关联数据不存在或关联关系错误', 400));
    }
    const isProduction = process.env.NODE_ENV === 'production';
    return res.status(500).json((0, response_1.serverErrorResponse)(isProduction ? '服务器内部错误' : error.message, isProduction ? undefined : error.stack));
};
exports.errorHandler = errorHandler;
const notFoundHandler = (req, res) => {
    logger_1.default.warn(`404 Not Found: [${req.method}] ${req.path}`);
    res.status(404).json((0, response_1.notFoundResponse)('请求的资源不存在'));
};
exports.notFoundHandler = notFoundHandler;
//# sourceMappingURL=errorHandler.js.map