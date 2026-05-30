import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.model';
import { successResponse, errorResponse } from '../utils/response';
import { AppError } from '../middleware/error.middleware';
import { OperationType, UserRole } from '../types';
import { createOperationLog } from '../services/operationLog.service';

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ where: { username } });
    if (!user) {
      throw new AppError('用户名或密码错误', 400);
    }

    if (!user.isActive) {
      throw new AppError('账户已被禁用', 400);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new AppError('用户名或密码错误', 400);
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    createOperationLog(req, 'auth', OperationType.QUERY, '用户登录');

    return res.json(successResponse({
      token,
      user: {
        id: user.id,
        username: user.username,
        realName: user.realName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        department: user.department
      }
    }, '登录成功'));
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json(errorResponse(error.message, error.statusCode));
    }
    return res.status(500).json(errorResponse('登录失败'));
  }
};

export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findByPk(req.user?.userId, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      throw new AppError('用户不存在', 404);
    }

    return res.json(successResponse(user));
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json(errorResponse(error.message, error.statusCode));
    }
    return res.status(500).json(errorResponse('获取用户信息失败'));
  }
};

export const initAdmin = async (req: Request, res: Response) => {
  try {
    const exists = await User.findOne({ where: { username: 'admin' } });
    if (exists) {
      return res.json(successResponse(null, '管理员账户已存在'));
    }

    await User.create({
      username: 'admin',
      password: '123456',
      realName: '系统管理员',
      email: 'admin@example.com',
      role: UserRole.ADMIN,
      department: '信息部',
      isActive: true
    });

    return res.json(successResponse(null, '管理员账户初始化成功，默认密码 123456'));
  } catch (error) {
    return res.status(500).json(errorResponse('初始化失败'));
  }
};
