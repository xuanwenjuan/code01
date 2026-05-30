import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import { config } from '../config';
import User from '../models/User';
import { success, ApiError } from '../utils/response';
import { UserRole } from '../types';

export const loginSchema = Joi.object({
  username: Joi.string().required().messages({
    'any.required': '用户名不能为空',
  }),
  password: Joi.string().required().messages({
    'any.required': '密码不能为空',
  }),
});

export const registerSchema = Joi.object({
  username: Joi.string().min(3).max(50).required().messages({
    'any.required': '用户名不能为空',
    'string.min': '用户名长度不能少于3个字符',
    'string.max': '用户名长度不能超过50个字符',
  }),
  password: Joi.string().min(6).max(50).required().messages({
    'any.required': '密码不能为空',
    'string.min': '密码长度不能少于6个字符',
  }),
  email: Joi.string().email().allow(null, '').messages({
    'string.email': '邮箱格式不正确',
  }),
  phone: Joi.string().allow(null, ''),
  role: Joi.string().valid(...Object.values(UserRole)).default(UserRole.RECEPTIONIST),
});

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({
      where: { username },
      attributes: ['id', 'username', 'password', 'role', 'isActive'],
    });

    if (!user) {
      throw new ApiError('用户名或密码错误', 400);
    }

    if (!user.isActive) {
      throw new ApiError('账号已被禁用', 400);
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new ApiError('用户名或密码错误', 400);
    }

    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        role: user.role,
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn } as any
    );

    await User.update(
      { lastLoginAt: new Date() },
      { where: { id: user.id } }
    );

    success(res, {
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    }, '登录成功');
  } catch (error) {
    next(error);
  }
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password, email, phone, role } = req.body;

    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      throw new ApiError('用户名已存在', 400);
    }

    const user = await User.create({
      username,
      password,
      email,
      phone,
      role: role || UserRole.RECEPTIONIST,
      isActive: true,
    });

    success(res, {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    }, '注册成功');
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findByPk(req.user.userId, {
      attributes: ['id', 'username', 'email', 'phone', 'role', 'createdAt'],
    });

    if (!user) {
      throw new ApiError('用户不存在', 404);
    }

    success(res, user);
  } catch (error) {
    next(error);
  }
};
