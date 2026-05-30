"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.toggleUserStatus = exports.updatePassword = exports.updateUser = exports.getUserById = exports.getUserList = exports.createUser = exports.updatePasswordValidation = exports.updateUserValidation = exports.createUserValidation = void 0;
const express_validator_1 = require("express-validator");
const database_1 = __importDefault(require("../config/database"));
const models_1 = require("../models");
const response_1 = require("../utils/response");
const errorHandler_1 = require("../middleware/errorHandler");
const types_1 = require("../types");
const sequelize_1 = require("sequelize");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const logger_1 = __importDefault(require("../config/logger"));
exports.createUserValidation = [
    (0, express_validator_1.body)('username').notEmpty().withMessage('用户名不能为空').trim().isLength({ min: 3, max: 50 }).withMessage('用户名长度应在3-50字符之间'),
    (0, express_validator_1.body)('email').optional().isEmail().withMessage('邮箱格式不正确'),
    (0, express_validator_1.body)('password').notEmpty().withMessage('密码不能为空').isLength({ min: 6, max: 50 }).withMessage('密码长度应在6-50字符之间'),
    (0, express_validator_1.body)('realName').notEmpty().withMessage('真实姓名不能为空').trim().isLength({ min: 1, max: 50 }).withMessage('真实姓名长度应在1-50字符之间'),
    (0, express_validator_1.body)('role').isIn(Object.values(types_1.UserRole)).withMessage('角色值无效'),
    (0, express_validator_1.body)('phone').optional().isLength({ max: 20 }).withMessage('电话长度不能超过20字符'),
    (0, express_validator_1.body)('department').optional().isLength({ max: 100 }).withMessage('部门长度不能超过100字符'),
];
exports.updateUserValidation = [
    (0, express_validator_1.param)('id').isInt({ min: 1 }).withMessage('用户ID必须为正整数'),
    (0, express_validator_1.body)('email').optional().isEmail().withMessage('邮箱格式不正确'),
    (0, express_validator_1.body)('realName').optional().isLength({ min: 1, max: 50 }).withMessage('真实姓名长度应在1-50字符之间'),
    (0, express_validator_1.body)('role').optional().isIn(Object.values(types_1.UserRole)).withMessage('角色值无效'),
    (0, express_validator_1.body)('phone').optional().isLength({ max: 20 }).withMessage('电话长度不能超过20字符'),
    (0, express_validator_1.body)('department').optional().isLength({ max: 100 }).withMessage('部门长度不能超过100字符'),
];
exports.updatePasswordValidation = [
    (0, express_validator_1.param)('id').isInt({ min: 1 }).withMessage('用户ID必须为正整数'),
    (0, express_validator_1.body)('oldPassword').optional().isLength({ min: 6, max: 50 }).withMessage('旧密码长度应在6-50字符之间'),
    (0, express_validator_1.body)('newPassword').notEmpty().withMessage('新密码不能为空').isLength({ min: 6, max: 50 }).withMessage('新密码长度应在6-50字符之间'),
];
const excludePasswordFields = (user) => {
    const { password, ...userWithoutPassword } = user.toJSON();
    return userWithoutPassword;
};
const createUser = async (req, res, next) => {
    const transaction = await database_1.default.transaction();
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            await transaction.rollback();
            return next(new errorHandler_1.AppError(errors.array()[0].msg, 400));
        }
        const { username, email, password, realName, role, phone, department } = req.body;
        const existingUser = await models_1.User.findOne({
            where: { [sequelize_1.Op.or]: [{ username }, { email }] },
            transaction,
        });
        if (existingUser) {
            await transaction.rollback();
            if (existingUser.username === username) {
                return next(new errorHandler_1.AppError('用户名已存在', 400));
            }
            return next(new errorHandler_1.AppError('邮箱已被使用', 400));
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const user = await models_1.User.create({
            username,
            email,
            password: hashedPassword,
            realName,
            role,
            phone,
            department,
            isActive: true,
        }, { transaction });
        await transaction.commit();
        logger_1.default.info(`用户创建成功: ${username} (${realName})，角色: ${role}，创建人: ${req.user?.username}`);
        res.json((0, response_1.successResponse)(excludePasswordFields(user), '用户创建成功'));
    }
    catch (error) {
        await transaction.rollback();
        next(error);
    }
};
exports.createUser = createUser;
const getUserList = async (req, res, next) => {
    try {
        const { page = 1, pageSize = 10, username, realName, role, isActive, department } = req.query;
        const where = {};
        if (username)
            where.username = { [sequelize_1.Op.like]: `%${username}%` };
        if (realName)
            where.realName = { [sequelize_1.Op.like]: `%${realName}%` };
        if (role)
            where.role = role;
        if (isActive !== undefined)
            where.isActive = isActive === 'true';
        if (department)
            where.department = { [sequelize_1.Op.like]: `%${department}%` };
        const { count, rows } = await models_1.User.findAndCountAll({
            where,
            attributes: { exclude: ['password'] },
            offset: (Number(page) - 1) * Number(pageSize),
            limit: Number(pageSize),
            order: [['createdAt', 'DESC']],
        });
        res.json((0, response_1.paginatedResponse)(rows, count, Number(page), Number(pageSize)));
    }
    catch (error) {
        next(error);
    }
};
exports.getUserList = getUserList;
const getUserById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await models_1.User.findByPk(id, {
            attributes: { exclude: ['password'] },
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
exports.getUserById = getUserById;
const updateUser = async (req, res, next) => {
    const transaction = await database_1.default.transaction();
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            await transaction.rollback();
            return next(new errorHandler_1.AppError(errors.array()[0].msg, 400));
        }
        const { id } = req.params;
        const { email, realName, role, phone, department, isActive } = req.body;
        const user = await models_1.User.findByPk(id, { transaction });
        if (!user) {
            await transaction.rollback();
            return next(new errorHandler_1.AppError('用户不存在', 404));
        }
        if (email && email !== user.email) {
            const existingUser = await models_1.User.findOne({ where: { email }, transaction });
            if (existingUser) {
                await transaction.rollback();
                return next(new errorHandler_1.AppError('邮箱已被使用', 400));
            }
        }
        await user.update({
            email: email !== undefined ? email : user.email,
            realName: realName !== undefined ? realName : user.realName,
            role: role !== undefined ? role : user.role,
            phone: phone !== undefined ? phone : user.phone,
            department: department !== undefined ? department : user.department,
            isActive: isActive !== undefined ? isActive : user.isActive,
        }, { transaction });
        await transaction.commit();
        logger_1.default.info(`用户更新成功: ${user.username}，操作人: ${req.user?.username}`);
        res.json((0, response_1.successResponse)(excludePasswordFields(user), '用户更新成功'));
    }
    catch (error) {
        await transaction.rollback();
        next(error);
    }
};
exports.updateUser = updateUser;
const updatePassword = async (req, res, next) => {
    const transaction = await database_1.default.transaction();
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            await transaction.rollback();
            return next(new errorHandler_1.AppError(errors.array()[0].msg, 400));
        }
        const { id } = req.params;
        const { oldPassword, newPassword } = req.body;
        const user = await models_1.User.findByPk(id, { transaction });
        if (!user) {
            await transaction.rollback();
            return next(new errorHandler_1.AppError('用户不存在', 404));
        }
        if (req.user.userId !== parseInt(id) && req.user.role !== types_1.UserRole.ADMIN) {
            await transaction.rollback();
            return next(new errorHandler_1.AppError('只能修改自己的密码', 403));
        }
        if (req.user.role !== types_1.UserRole.ADMIN) {
            if (!oldPassword) {
                await transaction.rollback();
                return next(new errorHandler_1.AppError('请提供旧密码', 400));
            }
            const isPasswordValid = await bcryptjs_1.default.compare(oldPassword, user.password);
            if (!isPasswordValid) {
                await transaction.rollback();
                return next(new errorHandler_1.AppError('旧密码不正确', 400));
            }
        }
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
        await user.update({ password: hashedPassword }, { transaction });
        await transaction.commit();
        logger_1.default.info(`用户密码更新成功: ${user.username}，操作人: ${req.user?.username}`);
        res.json((0, response_1.successResponse)(null, '密码更新成功'));
    }
    catch (error) {
        await transaction.rollback();
        next(error);
    }
};
exports.updatePassword = updatePassword;
const toggleUserStatus = async (req, res, next) => {
    const transaction = await database_1.default.transaction();
    try {
        const { id } = req.params;
        const user = await models_1.User.findByPk(id, { transaction });
        if (!user) {
            await transaction.rollback();
            return next(new errorHandler_1.AppError('用户不存在', 404));
        }
        if (user.id === req.user.userId) {
            await transaction.rollback();
            return next(new errorHandler_1.AppError('不能禁用自己的账号', 400));
        }
        const newStatus = !user.isActive;
        await user.update({ isActive: newStatus }, { transaction });
        await transaction.commit();
        logger_1.default.info(`用户状态变更: ${user.username}，状态: ${newStatus ? '启用' : '禁用'}，操作人: ${req.user?.username}`);
        res.json((0, response_1.successResponse)(null, `用户已${newStatus ? '启用' : '禁用'}`));
    }
    catch (error) {
        await transaction.rollback();
        next(error);
    }
};
exports.toggleUserStatus = toggleUserStatus;
const deleteUser = async (req, res, next) => {
    const transaction = await database_1.default.transaction();
    try {
        const { id } = req.params;
        const user = await models_1.User.findByPk(id, { transaction });
        if (!user) {
            await transaction.rollback();
            return next(new errorHandler_1.AppError('用户不存在', 404));
        }
        if (user.id === req.user.userId) {
            await transaction.rollback();
            return next(new errorHandler_1.AppError('不能删除自己的账号', 400));
        }
        if (user.role === types_1.UserRole.ADMIN) {
            const adminCount = await models_1.User.count({ where: { role: types_1.UserRole.ADMIN, isActive: true }, transaction });
            if (adminCount <= 1) {
                await transaction.rollback();
                return next(new errorHandler_1.AppError('至少需要保留一个活跃的管理员账号', 400));
            }
        }
        await user.destroy({ transaction });
        await transaction.commit();
        logger_1.default.info(`用户删除成功: ${user.username}，操作人: ${req.user?.username}`);
        res.json((0, response_1.successResponse)(null, '用户删除成功'));
    }
    catch (error) {
        await transaction.rollback();
        next(error);
    }
};
exports.deleteUser = deleteUser;
//# sourceMappingURL=userController.js.map