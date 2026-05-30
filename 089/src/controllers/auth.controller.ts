import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { ResponseUtil } from '../utils/response';
import { UnauthorizedError, BadRequestError } from '../utils/error';
import { UserRole } from '../types';

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({
      where: { username, isActive: true }
    });

    if (!user) {
      throw new UnauthorizedError('用户名或密码错误');
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('用户名或密码错误');
    }

    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        role: user.role
      },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    await user.update({ lastLoginAt: new Date() });

    res.json(ResponseUtil.success({
      token,
      user: {
        id: user.id,
        username: user.username,
        realName: user.realName,
        role: user.role,
        email: user.email,
        phone: user.phone
      }
    }, '登录成功'));
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findByPk(req.user!.userId, {
      attributes: ['id', 'username', 'realName', 'role', 'email', 'phone', 'lastLoginAt', 'createdAt']
    });

    if (!user) {
      throw new UnauthorizedError('用户不存在');
    }

    res.json(ResponseUtil.success(user));
  } catch (error) {
    next(error);
  }
};

export const initAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const existingAdmin = await User.findOne({ where: { role: UserRole.ADMIN } });
    
    if (existingAdmin) {
      throw new BadRequestError('管理员已存在');
    }

    const admin = await User.create({
      username: 'admin',
      password: 'admin123',
      realName: '系统管理员',
      role: UserRole.ADMIN,
      email: 'admin@example.com',
      phone: '13800138000',
      isActive: true
    });

    res.json(ResponseUtil.success({
      id: admin.id,
      username: admin.username,
      realName: admin.realName,
      role: admin.role
    }, '管理员初始化成功'));
  } catch (error) {
    next(error);
  }
};