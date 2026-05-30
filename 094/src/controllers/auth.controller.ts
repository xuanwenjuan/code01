import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';
import { User } from '../models';
import { config, ROLES, RoleType } from '../config';
import { successResponse, unauthorizedError, conflictError, notFoundError, badRequestError } from '../utils/response';
import logger from '../utils/logger';

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ where: { username } });
    if (!user) {
      throw unauthorizedError('用户名或密码错误');
    }

    if (user.status !== 1) {
      throw unauthorizedError('账户已被禁用');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw unauthorizedError('用户名或密码错误');
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    logger.info(`用户登录成功: ${username}`);

    successResponse(res, {
      token,
      user: {
        id: user.id,
        username: user.username,
        realName: user.realName,
        phone: user.phone,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        status: user.status,
      },
    }, '登录成功');
  } catch (error) {
    next(error);
  }
};

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { username, password, realName, phone, email, role } = req.body;

    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      throw conflictError('用户名已存在');
    }

    if (phone) {
      const existingPhone = await User.findOne({ where: { phone } });
      if (existingPhone) {
        throw conflictError('手机号已被使用');
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      password: hashedPassword,
      realName,
      phone,
      email,
      role: role || ROLES.ARTISAN,
      status: 1,
    });

    logger.info(`用户注册成功: ${username}`);

    successResponse(res, {
      id: user.id,
      username: user.username,
      realName: user.realName,
      phone: user.phone,
      email: user.email,
      role: user.role,
    }, '注册成功', 201);
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;

    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      throw notFoundError('用户不存在');
    }

    successResponse(res, user, '获取成功');
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { oldPassword, newPassword } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      throw notFoundError('用户不存在');
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      throw badRequestError('原密码错误');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await user.update({ password: hashedPassword });

    logger.info(`用户密码修改成功: ${user.username}`);
    successResponse(res, null, '密码修改成功');
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page = 1, pageSize = 10, keyword, role, status } = req.query;

    const where: any = {};

    if (keyword) {
      where[Op.or] = [
        { username: { [Op.like]: `%${keyword}%` } },
        { realName: { [Op.like]: `%${keyword}%` } },
        { phone: { [Op.like]: `%${keyword}%` } },
      ];
    }

    if (role) {
      where.role = role;
    }

    if (status !== undefined) {
      where.status = Number(status);
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      order: [['id', 'DESC']],
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize),
    });

    successResponse(res, {
      list: rows,
      total: count,
      page: Number(page),
      pageSize: Number(pageSize),
    }, '获取成功');
  } catch (error) {
    next(error);
  }
};

export const updateUserStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      throw notFoundError('用户不存在');
    }

    if (user.id === req.user?.id) {
      throw badRequestError('不能修改自己的状态');
    }

    await user.update({ status });

    logger.info(`用户状态更新成功: ${user.username} -> ${status === 1 ? '启用' : '禁用'}`);
    successResponse(res, null, '状态更新成功');
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      throw notFoundError('用户不存在');
    }

    successResponse(res, user, '获取成功');
  } catch (error) {
    next(error);
  }
};

export const getArtisans = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const artisans = await User.findAll({
      where: {
        role: ROLES.ARTISAN,
        status: 1,
      },
      attributes: ['id', 'username', 'realName', 'phone', 'avatar'],
      order: [['id', 'ASC']],
    });

    successResponse(res, artisans, '获取成功');
  } catch (error) {
    next(error);
  }
};
