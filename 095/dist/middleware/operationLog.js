"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.operationLog = exports.createOperationLog = void 0;
const OperationLog_1 = __importDefault(require("../models/OperationLog"));
const types_1 = require("../types");
const logger_1 = __importDefault(require("../config/logger"));
const getClientIp = (req) => {
    return (req.headers['x-forwarded-for'] ||
        req.headers['x-real-ip'] ||
        req.socket.remoteAddress ||
        req.ip ||
        '');
};
const sensitiveFields = ['password', 'token', 'authorization', 'secret'];
const sanitizeData = (data) => {
    if (!data)
        return data;
    if (typeof data !== 'object')
        return data;
    const sanitized = { ...data };
    for (const field of sensitiveFields) {
        if (sanitized[field]) {
            sanitized[field] = '***';
        }
    }
    return sanitized;
};
const createOperationLog = async (req, res, module, operationType, targetId, description) => {
    try {
        await OperationLog_1.default.create({
            module,
            operationType,
            targetId,
            operatorId: req.user?.userId || 0,
            operatorName: req.user?.realName || req.user?.username || '系统',
            description,
            ipAddress: getClientIp(req),
            userAgent: req.headers['user-agent'],
            requestMethod: req.method,
            requestUrl: req.originalUrl,
            requestParams: {
                body: sanitizeData(req.body),
                query: sanitizeData(req.query),
                params: req.params,
            },
            responseStatus: res.statusCode,
        });
    }
    catch (error) {
        logger_1.default.error('创建操作日志失败:', error);
    }
};
exports.createOperationLog = createOperationLog;
const operationLog = (req, res, next) => {
    const startTime = Date.now();
    const originalSend = res.send;
    const originalJson = res.json;
    const logAfterResponse = () => {
        const duration = Date.now() - startTime;
        let module = types_1.LogModule.SYSTEM;
        let operationType = types_1.OperationType.UPDATE;
        const path = req.path;
        if (path.includes('/auth')) {
            module = types_1.LogModule.SYSTEM;
            if (req.method === 'POST')
                operationType = types_1.OperationType.CREATE;
        }
        else if (path.includes('/users')) {
            module = types_1.LogModule.USER;
            if (req.method === 'POST')
                operationType = types_1.OperationType.CREATE;
            else if (req.method === 'DELETE')
                operationType = types_1.OperationType.DELETE;
            else if (req.method === 'GET')
                operationType = types_1.OperationType.UPDATE;
        }
        else if (path.includes('/categories')) {
            module = types_1.LogModule.CATEGORY;
            if (req.method === 'POST')
                operationType = types_1.OperationType.CREATE;
            else if (req.method === 'DELETE')
                operationType = types_1.OperationType.DELETE;
            else if (req.method === 'GET')
                operationType = types_1.OperationType.UPDATE;
        }
        else if (path.includes('/products')) {
            module = types_1.LogModule.PRODUCT;
            if (req.method === 'POST')
                operationType = types_1.OperationType.CREATE;
            else if (req.method === 'DELETE')
                operationType = types_1.OperationType.DELETE;
            else if (req.method === 'GET')
                operationType = types_1.OperationType.UPDATE;
        }
        else if (path.includes('/materials')) {
            module = types_1.LogModule.MATERIAL;
            if (req.method === 'POST')
                operationType = types_1.OperationType.CREATE;
            else if (req.method === 'DELETE')
                operationType = types_1.OperationType.DELETE;
            else if (path.includes('/stock'))
                operationType = types_1.OperationType.STOCK_IN;
        }
        else if (path.includes('/orders')) {
            module = types_1.LogModule.ORDER;
            if (req.method === 'POST')
                operationType = types_1.OperationType.CREATE;
            else if (req.method === 'DELETE')
                operationType = types_1.OperationType.DELETE;
            else if (path.includes('/status'))
                operationType = types_1.OperationType.STATUS_CHANGE;
        }
        else if (path.includes('/ledgers')) {
            module = types_1.LogModule.LEDGER;
            if (req.method === 'POST')
                operationType = types_1.OperationType.CREATE;
            else if (req.method === 'DELETE')
                operationType = types_1.OperationType.DELETE;
        }
        if (req.method !== 'GET' || module !== types_1.LogModule.SYSTEM) {
            (0, exports.createOperationLog)(req, res, module, operationType);
        }
    };
    res.send = function (body) {
        logAfterResponse();
        return originalSend.call(this, body);
    };
    res.json = function (body) {
        logAfterResponse();
        return originalJson.call(this, body);
    };
    next();
};
exports.operationLog = operationLog;
//# sourceMappingURL=operationLog.js.map