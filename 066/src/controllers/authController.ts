import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import { ResponseUtil } from '../utils/response';
import { AppError } from '../middleware/errorHandler';
import { config } from '../config';
import { UserRole } from '../types';

export const authController = {
  async login(req: Request, res: Response) {
    const { username, password } = req.body;

    const user = await User.findOne({ where: { username } });
    if (!user) {
      throw new AppError('用户名或密码错误', 400);
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new AppError('用户名或密码错误', 400);
    }

    if (!user.status) {
      throw new AppError('账号已被禁用', 400);
    }

    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        role: user.role
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    return ResponseUtil.success(res, {
      token,
      user: {
        id: user.id,
        username: user.username,
        realName: user.realName,
        phone: user.phone,
        email: user.email,
        role: user.role
      }
    }, '登录成功');
  },

  async register(req: Request, res: Response) {
    const { username, password, realName, phone, email, role } = req.body;

    const exists = await User.findOne({ where: { username } });
    if (exists) {
      throw new AppError('用户名已存在', 400);
    }

    const user = await User.create({
      username,
      password,
      realName,
      phone,
      email,
      role: role || UserRole.SALES,
      status: true
    });

    return ResponseUtil.success(res, {
      id: user.id,
      username: user.username
    }, '注册成功');
  },

  async getProfile(req: Request, res: Response) {
    const userId = req.user!.userId;
    
    const user = await User.findByPk(userId, {
      attributes: ['id', 'username', 'realName', 'phone', 'email', 'role', 'status']
    });

    if (!user) {
      throw new AppError('用户不存在', 404);
    }

    return ResponseUtil.success(res, user);
  },

  async changePassword(req: Request, res: Response) {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user!.userId;

    const user = await User.findByPk(userId);
    if (!user) {
      throw new AppError('用户不存在', 404);
    }

    const isValid = await bcrypt.compare(oldPassword, user.password);
    if (!isValid) {
      throw new AppError('原密码错误', 400);
    }

    user.password = newPassword;
    await user.save();

    return ResponseUtil.success(res, null, '密码修改成功');
  }
};
