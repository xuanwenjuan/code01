"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.conflictResponse = exports.serverErrorResponse = exports.notFoundResponse = exports.forbiddenResponse = exports.unauthorizedResponse = exports.validationErrorResponse = exports.errorResponse = exports.paginatedResponse = exports.createdResponse = exports.successResponse = void 0;
const crypto_1 = __importDefault(require("crypto"));
const generateRequestId = () => {
    return crypto_1.default.randomUUID();
};
const successResponse = (data, message = 'success') => {
    return {
        code: 200,
        message,
        data,
        timestamp: new Date().toISOString(),
        requestId: generateRequestId(),
    };
};
exports.successResponse = successResponse;
const createdResponse = (data, message = 'created successfully') => {
    return {
        code: 201,
        message,
        data,
        timestamp: new Date().toISOString(),
        requestId: generateRequestId(),
    };
};
exports.createdResponse = createdResponse;
const paginatedResponse = (list, total, page, pageSize, message = 'success') => {
    const totalPages = Math.ceil(total / pageSize);
    return {
        code: 200,
        message,
        data: {
            list,
            total,
            page,
            pageSize,
            totalPages,
        },
        timestamp: new Date().toISOString(),
        requestId: generateRequestId(),
    };
};
exports.paginatedResponse = paginatedResponse;
const errorResponse = (message, code = 400, details) => {
    return {
        code,
        message,
        data: null,
        timestamp: new Date().toISOString(),
        requestId: generateRequestId(),
    };
};
exports.errorResponse = errorResponse;
const validationErrorResponse = (errors, message = '参数验证失败') => {
    return {
        code: 400,
        message,
        data: { errors },
        timestamp: new Date().toISOString(),
        requestId: generateRequestId(),
    };
};
exports.validationErrorResponse = validationErrorResponse;
const unauthorizedResponse = (message = '未授权访问') => {
    return {
        code: 401,
        message,
        data: null,
        timestamp: new Date().toISOString(),
        requestId: generateRequestId(),
    };
};
exports.unauthorizedResponse = unauthorizedResponse;
const forbiddenResponse = (message = '权限不足') => {
    return {
        code: 403,
        message,
        data: null,
        timestamp: new Date().toISOString(),
        requestId: generateRequestId(),
    };
};
exports.forbiddenResponse = forbiddenResponse;
const notFoundResponse = (message = '资源不存在') => {
    return {
        code: 404,
        message,
        data: null,
        timestamp: new Date().toISOString(),
        requestId: generateRequestId(),
    };
};
exports.notFoundResponse = notFoundResponse;
const serverErrorResponse = (message = '服务器内部错误', details) => {
    return {
        code: 500,
        message,
        data: details,
        timestamp: new Date().toISOString(),
        requestId: generateRequestId(),
    };
};
exports.serverErrorResponse = serverErrorResponse;
const conflictResponse = (message = '资源冲突') => {
    return {
        code: 409,
        message,
        data: null,
        timestamp: new Date().toISOString(),
        requestId: generateRequestId(),
    };
};
exports.conflictResponse = conflictResponse;
//# sourceMappingURL=response.js.map