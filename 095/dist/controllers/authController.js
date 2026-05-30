"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentUser = exports.login = exports.loginValidation = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_validator_1 = require("express-validator");
const User_1 = __importDefault(require("../models/User"));
const response_1 = require("../utils/response");
const errorHandler_1 = require("../middleware/errorHandler");
const logger_1 = __importDefault(require("../config/logger"));
exports.loginValidation = [
    (0, express_validator_1.body)('username').notEmpty().withMessage('用户名不能为空'),
    (0, express_validator_1.body)('password').notEmpty().withMessage('密码不能为空'),
];
const login = async (req, res, next) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return next(new errorHandler_1.AppError(errors.array()[0].msg, 400));
        }
        const { username, password } = req.body;
        const user = await User_1.default.findOne({ where: { username } });
        if (!user) {
            return next(new errorHandler_1.AppError('用户名或密码错误', 401));
        }
        if (!user.isActive) {
            return next(new errorHandler_1.AppError('账户已被禁用', 403));
        }
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return next(new errorHandler_1.AppError('用户名或密码错误', 401));
        }
        const token = jsonwebtoken_1.default.sign({
            userId: user.id,
            username: user.username,
            role: user.role,
        }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '24h' });
        logger_1.default.info(`用户 ${username} 登录成功`);
        res.json((0, response_1.successResponse)({
            token,
            user: {
                id: user.id,
                username: user.username,
                realName: user.realName,
                role: user.role,
                phone: user.phone,
                email: user.email,
            },
        }, '登录成功'));
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
const getCurrentUser = async (req, res, next) => {
    try {
        const user = await User_1.default.findByPk(req.user.userId, {
            attributes: ['id', 'username', 'realName', 'role', 'phone', 'email'],
        });
        if (!user) {
            return next(new errorHandler_1.AppError('用户不存在', 404));
        }
        res.json((0, response_1.successResponse)(user));
    }
    catch (error) {
        next(error);
    }
};
exports.getCurrentUser = getCurrentUser;
//# sourceMappingURL=authController.js.map