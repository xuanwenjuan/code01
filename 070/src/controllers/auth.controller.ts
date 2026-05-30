import { Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { env } from '../config/env';
import { ApiResponse } from '../utils/response';
import { User } from '../models';
import { AuthRequest } from '../middleware/auth';
import { UserRole } from '../utils/constants';
import Joi from 'joi';

export const registerSchema = Joi.object({
  username: Joi.string().min(3).max(50).required(),
  password: Joi.string().min(6).max(50).required(),
  email: Joi.string().email().allow(null, ''),
  role: Joi.string().valid(...Object.values(UserRole)).default(UserRole.INFLUENCER),
});

export const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

export const register = async (req: AuthRequest, res: Response) => {
  try {
    const { username, password, email, role } = req.body;

    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return ApiResponse.error(res, '用户名已存在', 409);
    }

    if (email) {
      const existingEmail = await User.findOne({ where: { email } });
      if (existingEmail) {
        return ApiResponse.error(res, '邮箱已被使用', 409);
      }
    }

    const user = await User.create({
      username,
      password,
      email,
      role: role || UserRole.INFLUENCER,
    });

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN }
    );

    return ApiResponse.created(res, {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      token,
    }, '注册成功');
  } catch (error) {
    return ApiResponse.error(res, '注册失败');
  }
};

export const login = async (req: AuthRequest, res: Response) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ where: { username } });
    if (!user) {
      return ApiResponse.error(res, '用户名或密码错误', 401);
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return ApiResponse.error(res, '用户名或密码错误', 401);
    }

    if (user.status !== 'active') {
      return ApiResponse.error(res, '账户已被禁用', 401);
    }

    await user.update({
      lastLoginAt: new Date(),
      lastLoginIp: req.ip,
    });

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN }
    );

    return ApiResponse.success(res, {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      token,
    }, '登录成功');
  } catch (error) {
    return ApiResponse.error(res, '登录失败');
  }
};

export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findByPk(req.user!.id, {
      attributes: ['id', 'username', 'email', 'phone', 'avatar', 'nickname', 'role', 'status', 'createdAt'],
    });

    return ApiResponse.success(res, user);
  } catch (error) {
    return ApiResponse.error(res, '获取用户信息失败');
  }
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findByPk(req.user!.id);
    if (!user) {
      return ApiResponse.notFound(res, '用户不存在');
    }

    const isValidPassword = await bcrypt.compare(oldPassword, user.password);
    if (!isValidPassword) {
      return ApiResponse.error(res, '原密码错误', 400);
    }

    await user.update({ password: newPassword });

    return ApiResponse.success(res, null, '密码修改成功');
  } catch (error) {
    return ApiResponse.error(res, '密码修改失败');
  }
};
