"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasPermission = exports.roleHierarchy = exports.checkPermission = exports.permissionMatrix = exports.authorizeOwnOrAdmin = exports.authorize = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const types_1 = require("../types");
const errorHandler_1 = require("./errorHandler");
const models_1 = require("../models");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new errorHandler_1.UnauthorizedError('未提供访问令牌'));
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const user = await models_1.User.findByPk(decoded.userId);
        if (!user) {
            return next(new errorHandler_1.UnauthorizedError('用户不存在'));
        }
        if (!user.isActive) {
            return next(new errorHandler_1.ForbiddenError('用户账号已被禁用'));
        }
        req.user = decoded;
        req.fullUser = user;
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            return next(new errorHandler_1.UnauthorizedError('令牌已过期'));
        }
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            return next(new errorHandler_1.UnauthorizedError('无效的令牌'));
        }
        return next(new errorHandler_1.UnauthorizedError('令牌验证失败'));
    }
};
exports.authenticate = authenticate;
const authorize = (...roles) => {
    return (req, _res, next) => {
        if (!req.user) {
            return next(new errorHandler_1.UnauthorizedError('未授权访问'));
        }
        const userRole = req.user.role;
        if (userRole === types_1.UserRole.SUPER_ADMIN) {
            return next();
        }
        if (userRole === types_1.UserRole.ADMIN) {
            const adminAllowedRoles = [
                types_1.UserRole.ADMIN,
                types_1.UserRole.CUSTOMER_SERVICE,
                types_1.UserRole.WAREHOUSE_ADMIN,
                types_1.UserRole.WAREHOUSE,
                types_1.UserRole.FINANCE,
            ];
            if (roles.some(role => adminAllowedRoles.includes(role))) {
                return next();
            }
        }
        if (userRole === types_1.UserRole.WAREHOUSE_ADMIN) {
            const warehouseAdminAllowedRoles = [
                types_1.UserRole.WAREHOUSE_ADMIN,
                types_1.UserRole.WAREHOUSE,
            ];
            if (roles.some(role => warehouseAdminAllowedRoles.includes(role))) {
                return next();
            }
        }
        if (!roles.includes(userRole)) {
            return next(new errorHandler_1.ForbiddenError('权限不足'));
        }
        next();
    };
};
exports.authorize = authorize;
const authorizeOwnOrAdmin = (idParam = 'id') => {
    return (req, _res, next) => {
        if (!req.user) {
            return next(new errorHandler_1.UnauthorizedError('未授权访问'));
        }
        if (req.user.role === types_1.UserRole.SUPER_ADMIN || req.user.role === types_1.UserRole.ADMIN) {
            return next();
        }
        const resourceId = parseInt(req.params[idParam]);
        if (resourceId === req.user.userId) {
            return next();
        }
        return next(new errorHandler_1.ForbiddenError('权限不足'));
    };
};
exports.authorizeOwnOrAdmin = authorizeOwnOrAdmin;
exports.permissionMatrix = {
    user: {
        create: [types_1.UserRole.SUPER_ADMIN, types_1.UserRole.ADMIN],
        read: [types_1.UserRole.SUPER_ADMIN, types_1.UserRole.ADMIN],
        update: [types_1.UserRole.SUPER_ADMIN, types_1.UserRole.ADMIN],
        delete: [types_1.UserRole.SUPER_ADMIN],
    },
    category: {
        create: [types_1.UserRole.SUPER_ADMIN, types_1.UserRole.ADMIN, types_1.UserRole.WAREHOUSE_ADMIN],
        read: [],
        update: [types_1.UserRole.SUPER_ADMIN, types_1.UserRole.ADMIN, types_1.UserRole.WAREHOUSE_ADMIN],
        delete: [types_1.UserRole.SUPER_ADMIN, types_1.UserRole.ADMIN],
    },
    product: {
        create: [types_1.UserRole.SUPER_ADMIN, types_1.UserRole.ADMIN, types_1.UserRole.WAREHOUSE_ADMIN],
        read: [],
        update: [types_1.UserRole.SUPER_ADMIN, types_1.UserRole.ADMIN, types_1.UserRole.WAREHOUSE_ADMIN],
        delete: [types_1.UserRole.SUPER_ADMIN, types_1.UserRole.ADMIN],
    },
    material: {
        create: [types_1.UserRole.SUPER_ADMIN, types_1.UserRole.ADMIN, types_1.UserRole.WAREHOUSE_ADMIN],
        read: [types_1.UserRole.SUPER_ADMIN, types_1.UserRole.ADMIN, types_1.UserRole.WAREHOUSE_ADMIN, types_1.UserRole.WAREHOUSE],
        update: [types_1.UserRole.SUPER_ADMIN, types_1.UserRole.ADMIN, types_1.UserRole.WAREHOUSE_ADMIN],
        delete: [types_1.UserRole.SUPER_ADMIN, types_1.UserRole.ADMIN],
        stockIn: [types_1.UserRole.SUPER_ADMIN, types_1.UserRole.ADMIN, types_1.UserRole.WAREHOUSE_ADMIN, types_1.UserRole.WAREHOUSE],
        stockOut: [types_1.UserRole.SUPER_ADMIN, types_1.UserRole.ADMIN, types_1.UserRole.WAREHOUSE_ADMIN, types_1.UserRole.WAREHOUSE],
    },
    order: {
        create: [types_1.UserRole.SUPER_ADMIN, types_1.UserRole.ADMIN, types_1.UserRole.CUSTOMER_SERVICE],
        read: [types_1.UserRole.SUPER_ADMIN, types_1.UserRole.ADMIN, types_1.UserRole.CUSTOMER_SERVICE, types_1.UserRole.WAREHOUSE_ADMIN, types_1.UserRole.WAREHOUSE, types_1.UserRole.FINANCE],
        update: [types_1.UserRole.SUPER_ADMIN, types_1.UserRole.ADMIN, types_1.UserRole.CUSTOMER_SERVICE],
        delete: [types_1.UserRole.SUPER_ADMIN, types_1.UserRole.ADMIN],
        updateStatus: [types_1.UserRole.SUPER_ADMIN, types_1.UserRole.ADMIN, types_1.UserRole.CUSTOMER_SERVICE, types_1.UserRole.WAREHOUSE_ADMIN],
        schedule: [types_1.UserRole.SUPER_ADMIN, types_1.UserRole.ADMIN, types_1.UserRole.WAREHOUSE_ADMIN],
        return: [types_1.UserRole.SUPER_ADMIN, types_1.UserRole.ADMIN, types_1.UserRole.CUSTOMER_SERVICE],
    },
    ledger: {
        create: [types_1.UserRole.SUPER_ADMIN, types_1.UserRole.ADMIN, types_1.UserRole.FINANCE],
        read: [types_1.UserRole.SUPER_ADMIN, types_1.UserRole.ADMIN, types_1.UserRole.FINANCE],
        update: [types_1.UserRole.SUPER_ADMIN, types_1.UserRole.ADMIN, types_1.UserRole.FINANCE],
        delete: [types_1.UserRole.SUPER_ADMIN, types_1.UserRole.ADMIN],
        audit: [types_1.UserRole.SUPER_ADMIN, types_1.UserRole.ADMIN, types_1.UserRole.FINANCE],
        export: [types_1.UserRole.SUPER_ADMIN, types_1.UserRole.ADMIN, types_1.UserRole.FINANCE],
    },
};
const checkPermission = (module, action) => {
    return (req, _res, next) => {
        if (!req.user) {
            return next(new errorHandler_1.UnauthorizedError('未授权访问'));
        }
        const modulePermissions = exports.permissionMatrix[module];
        if (!modulePermissions) {
            return next(new errorHandler_1.ForbiddenError('权限模块不存在'));
        }
        const allowedRoles = modulePermissions[action];
        if (!allowedRoles) {
            return next(new errorHandler_1.ForbiddenError('权限动作不存在'));
        }
        if (allowedRoles.length === 0) {
            return next();
        }
        if (req.user.role === types_1.UserRole.SUPER_ADMIN) {
            return next();
        }
        if (!allowedRoles.includes(req.user.role)) {
            return next(new errorHandler_1.ForbiddenError('权限不足'));
        }
        next();
    };
};
exports.checkPermission = checkPermission;
exports.roleHierarchy = {
    [types_1.UserRole.SUPER_ADMIN]: [types_1.UserRole.ADMIN, types_1.UserRole.CUSTOMER_SERVICE, types_1.UserRole.WAREHOUSE_ADMIN, types_1.UserRole.WAREHOUSE, types_1.UserRole.FINANCE],
    [types_1.UserRole.ADMIN]: [types_1.UserRole.CUSTOMER_SERVICE, types_1.UserRole.WAREHOUSE_ADMIN, types_1.UserRole.WAREHOUSE, types_1.UserRole.FINANCE],
    [types_1.UserRole.WAREHOUSE_ADMIN]: [types_1.UserRole.WAREHOUSE],
    [types_1.UserRole.CUSTOMER_SERVICE]: [],
    [types_1.UserRole.WAREHOUSE]: [],
    [types_1.UserRole.FINANCE]: [],
};
const hasPermission = (userRole, requiredRole) => {
    if (userRole === requiredRole)
        return true;
    const subordinates = exports.roleHierarchy[userRole];
    if (subordinates && subordinates.includes(requiredRole)) {
        return true;
    }
    for (const subordinate of subordinates || []) {
        if ((0, exports.hasPermission)(subordinate, requiredRole)) {
            return true;
        }
    }
    return false;
};
exports.hasPermission = hasPermission;
//# sourceMappingURL=auth.js.map