import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { Op } from 'sequelize';
import User, { UserRole } from '../models/User';
import { ApiResponse } from '../utils/response';
import { generateToken } from '../utils/jwt';
import { validateRequest } from '../middlewares/validateRequest';
import { AppError, NotFoundError } from '../exceptions/AppError';
import bcrypt from 'bcryptjs';

const loginSchema = Joi.object({
  username: Joi.string().required().messages({
    'string.empty': '用户名不能为空',
  }),
  password: Joi.string().required().messages({
    'string.empty': '密码不能为空',
  }),
});

const registerSchema = Joi.object({
  username: Joi.string().min(3).max(50).required(),
  password: Joi.string().min(6).max(50).required(),
  phone: Joi.string().pattern(/^1[3-9]\d{9}$/).required(),
  email: Joi.string().email().optional(),
  realName: Joi.string().optional(),
  role: Joi.string().valid(UserRole.BUYER, UserRole.SELLER).default(UserRole.BUYER),
});

export const login = [
  validateRequest(loginSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { username, password } = req.body;
      
      const user = await User.findOne({ where: { username } });
      if (!user) {
        throw new NotFoundError('用户不存在');
      }
      
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        throw new AppError('密码错误', 400);
      }
      
      if (user.status !== 'active') {
        throw new AppError('账户已被禁用', 403);
      }
      
      const token = generateToken({
        userId: user.id,
        username: user.username,
        role: user.role,
      });
      
      await user.update({ lastLoginAt: new Date() });
      
      ApiResponse.success(res, {
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          phone: user.phone,
          email: user.email,
          realName: user.realName,
        },
      }, '登录成功');
    } catch (error) {
      next(error);
    }
  },
];

export const register = [
  validateRequest(registerSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { username, password, phone, email, realName, role } = req.body;
      
      const existingUser = await User.findOne({
        where: {
          [Op.or]: [{ username }, { phone }],
        },
      });
      
      if (existingUser) {
        throw new AppError('用户名或手机号已存在', 400);
      }
      
      const user = await User.create({
        username,
        password,
        phone,
        email,
        realName,
        role,
        balance: 0,
        status: 'active',
      });
      
      const token = generateToken({
        userId: user.id,
        username: user.username,
        role: user.role,
      });
      
      ApiResponse.success(res, {
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          phone: user.phone,
          email: user.email,
          realName: user.realName,
        },
      }, '注册成功', 201);
    } catch (error) {
      next(error);
    }
  },
];

export const getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findByPk(req.user!.userId, {
      attributes: ['id', 'username', 'role', 'phone', 'email', 'realName', 'avatar', 'balance', 'createdAt'],
    });
    
    if (!user) {
      throw new NotFoundError('用户不存在');
    }
    
    ApiResponse.success(res, user);
  } catch (error) {
    next(error);
  }
};
