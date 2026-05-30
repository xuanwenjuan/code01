import { Request, Response, NextFunction } from 'express';
import { body, validationResult, param } from 'express-validator';
import sequelize from '../config/database';
import { User } from '../models';
import { successResponse, paginatedResponse } from '../utils/response';
import { AppError } from '../middleware/errorHandler';
import { UserRole } from '../types';
import { Op } from 'sequelize';
import bcrypt from 'bcryptjs';
import logger from '../config/logger';

export const createUserValidation = [
  body('username').notEmpty().withMessage('用户名不能为空').trim().isLength({ min: 3, max: 50 }).withMessage('用户名长度应在3-50字符之间'),
  body('email').optional().isEmail().withMessage('邮箱格式不正确'),
  body('password').notEmpty().withMessage('密码不能为空').isLength({ min: 6, max: 50 }).withMessage('密码长度应在6-50字符之间'),
  body('realName').notEmpty().withMessage('真实姓名不能为空').trim().isLength({ min: 1, max: 50 }).withMessage('真实姓名长度应在1-50字符之间'),
  body('role').isIn(Object.values(UserRole)).withMessage('角色值无效'),
  body('phone').optional().isLength({ max: 20 }).withMessage('电话长度不能超过20字符'),
  body('department').optional().isLength({ max: 100 }).withMessage('部门长度不能超过100字符'),
];

export const updateUserValidation = [
  param('id').isInt({ min: 1 }).withMessage('用户ID必须为正整数'),
  body('email').optional().isEmail().withMessage('邮箱格式不正确'),
  body('realName').optional().isLength({ min: 1, max: 50 }).withMessage('真实姓名长度应在1-50字符之间'),
  body('role').optional().isIn(Object.values(UserRole)).withMessage('角色值无效'),
  body('phone').optional().isLength({ max: 20 }).withMessage('电话长度不能超过20字符'),
  body('department').optional().isLength({ max: 100 }).withMessage('部门长度不能超过100字符'),
];

export const updatePasswordValidation = [
  param('id').isInt({ min: 1 }).withMessage('用户ID必须为正整数'),
  body('oldPassword').optional().isLength({ min: 6, max: 50 }).withMessage('旧密码长度应在6-50字符之间'),
  body('newPassword').notEmpty().withMessage('新密码不能为空').isLength({ min: 6, max: 50 }).withMessage('新密码长度应在6-50字符之间'),
];

const excludePasswordFields = (user: User) => {
  const { password, ...userWithoutPassword } = user.toJSON();
  return userWithoutPassword;
};

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  const transaction = await sequelize.transaction();

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      await transaction.rollback();
      return next(new AppError(errors.array()[0].msg, 400));
    }

    const { username, email, password, realName, role, phone, department } = req.body;

    const existingUser = await User.findOne({
      where: { [Op.or]: [{ username }, { email }] },
      transaction,
    });

    if (existingUser) {
      await transaction.rollback();
      if (existingUser.username === username) {
        return next(new AppError('用户名已存在', 400));
      }
      return next(new AppError('邮箱已被使用', 400));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create(
      {
        username,
        email,
        password: hashedPassword,
        realName,
        role,
        phone,
        department,
        isActive: true,
      },
      { transaction }
    );

    await transaction.commit();

    logger.info(`用户创建成功: ${username} (${realName})，角色: ${role}，创建人: ${req.user?.username}`);
    res.json(successResponse(excludePasswordFields(user), '用户创建成功'));
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

export const getUserList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, pageSize = 10, username, realName, role, isActive, department } = req.query;

    const where: any = {};
    if (username) where.username = { [Op.like]: `%${username}%` };
    if (realName) where.realName = { [Op.like]: `%${realName}%` };
    if (role) where.role = role;
    if (isActive !== undefined) where.isActive = isActive === 'true';
    if (department) where.department = { [Op.like]: `%${department}%` };

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      offset: (Number(page) - 1) * Number(pageSize),
      limit: Number(pageSize),
      order: [['createdAt', 'DESC']],
    });

    res.json(paginatedResponse(rows, count, Number(page), Number(pageSize)));
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      return next(new AppError('用户不存在', 404));
    }

    res.json(successResponse(user));
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  const transaction = await sequelize.transaction();

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      await transaction.rollback();
      return next(new AppError(errors.array()[0].msg, 400));
    }

    const { id } = req.params;
    const { email, realName, role, phone, department, isActive } = req.body;

    const user = await User.findByPk(id, { transaction });
    if (!user) {
      await transaction.rollback();
      return next(new AppError('用户不存在', 404));
    }

    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email }, transaction });
      if (existingUser) {
        await transaction.rollback();
        return next(new AppError('邮箱已被使用', 400));
      }
    }

    await user.update(
      {
        email: email !== undefined ? email : user.email,
        realName: realName !== undefined ? realName : user.realName,
        role: role !== undefined ? role : user.role,
        phone: phone !== undefined ? phone : user.phone,
        department: department !== undefined ? department : user.department,
        isActive: isActive !== undefined ? isActive : user.isActive,
      },
      { transaction }
    );

    await transaction.commit();

    logger.info(`用户更新成功: ${user.username}，操作人: ${req.user?.username}`);
    res.json(successResponse(excludePasswordFields(user), '用户更新成功'));
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

export const updatePassword = async (req: Request, res: Response, next: NextFunction) => {
  const transaction = await sequelize.transaction();

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      await transaction.rollback();
      return next(new AppError(errors.array()[0].msg, 400));
    }

    const { id } = req.params;
    const { oldPassword, newPassword } = req.body;

    const user = await User.findByPk(id, { transaction });
    if (!user) {
      await transaction.rollback();
      return next(new AppError('用户不存在', 404));
    }

    if (req.user!.userId !== parseInt(id) && req.user!.role !== UserRole.ADMIN) {
      await transaction.rollback();
      return next(new AppError('只能修改自己的密码', 403));
    }

    if (req.user!.role !== UserRole.ADMIN) {
      if (!oldPassword) {
        await transaction.rollback();
        return next(new AppError('请提供旧密码', 400));
      }

      const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
      if (!isPasswordValid) {
        await transaction.rollback();
        return next(new AppError('旧密码不正确', 400));
      }
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await user.update({ password: hashedPassword }, { transaction });

    await transaction.commit();

    logger.info(`用户密码更新成功: ${user.username}，操作人: ${req.user?.username}`);
    res.json(successResponse(null, '密码更新成功'));
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

export const toggleUserStatus = async (req: Request, res: Response, next: NextFunction) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;

    const user = await User.findByPk(id, { transaction });
    if (!user) {
      await transaction.rollback();
      return next(new AppError('用户不存在', 404));
    }

    if (user.id === req.user!.userId) {
      await transaction.rollback();
      return next(new AppError('不能禁用自己的账号', 400));
    }

    const newStatus = !user.isActive;
    await user.update({ isActive: newStatus }, { transaction });

    await transaction.commit();

    logger.info(`用户状态变更: ${user.username}，状态: ${newStatus ? '启用' : '禁用'}，操作人: ${req.user?.username}`);
    res.json(successResponse(null, `用户已${newStatus ? '启用' : '禁用'}`));
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;

    const user = await User.findByPk(id, { transaction });
    if (!user) {
      await transaction.rollback();
      return next(new AppError('用户不存在', 404));
    }

    if (user.id === req.user!.userId) {
      await transaction.rollback();
      return next(new AppError('不能删除自己的账号', 400));
    }

    if (user.role === UserRole.ADMIN) {
      const adminCount = await User.count({ where: { role: UserRole.ADMIN, isActive: true }, transaction });
      if (adminCount <= 1) {
        await transaction.rollback();
        return next(new AppError('至少需要保留一个活跃的管理员账号', 400));
      }
    }

    await user.destroy({ transaction });

    await transaction.commit();

    logger.info(`用户删除成功: ${user.username}，操作人: ${req.user?.username}`);
    res.json(successResponse(null, '用户删除成功'));
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};