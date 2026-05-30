import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models';
import { config } from '../config';
import { ResponseUtil } from '../utils/response';
import { AppError } from '../middleware/errorHandler';
import { Role, JwtPayload } from '../types';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, email, password, phone } = req.body;

    const existingUser = await User.findOne({
      where: {
        $or: [{ username }, { email }]
      } as any
    });

    if (existingUser) {
      throw new AppError('用户名或邮箱已存在', 400, 400);
    }

    const user = await User.create({
      username,
      email,
      password,
      phone,
      role: Role.USER,
      isActive: true
    });

    const token = generateToken(user);

    res.status(201).json(ResponseUtil.success({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      token
    }, '注册成功'));
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({
      where: { username }
    });

    if (!user) {
      throw new AppError('用户名或密码错误', 401, 401);
    }

    if (!user.isActive) {
      throw new AppError('账户已被禁用', 403, 403);
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      throw new AppError('用户名或密码错误', 401, 401);
    }

    await user.update({ lastLoginAt: new Date() });

    const token = generateToken(user);

    res.json(ResponseUtil.success({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      token
    }, '登录成功'));
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findByPk(req.user!.userId, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      throw new AppError('用户不存在', 404, 404);
    }

    res.json(ResponseUtil.success(user));
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findByPk(req.user!.userId);

    if (!user) {
      throw new AppError('用户不存在', 404, 404);
    }

    const isPasswordValid = await user.comparePassword(oldPassword);

    if (!isPasswordValid) {
      throw new AppError('原密码错误', 400, 400);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await user.update({ password: hashedPassword });

    res.json(ResponseUtil.success(null, '密码修改成功'));
  } catch (error) {
    next(error);
  }
};

function generateToken(user: User): string {
  const payload: JwtPayload = {
    userId: user.id,
    username: user.username,
    role: user.role as Role
  };

  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn
  });
}
