import { Response, NextFunction } from 'express';
import User from '../models/User';
import { generateToken } from '../utils/jwt';
import ResponseUtil from '../utils/response';
import { BadRequestError, UnauthorizedError, NotFoundError } from '../utils/errors';
import { AuthRequest } from '../middleware/auth';
import bcrypt from 'bcryptjs';

export const login = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ where: { username } });
    if (!user) {
      throw new UnauthorizedError('用户名或密码错误');
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('用户名或密码错误');
    }

    if (!user.status) {
      throw new UnauthorizedError('用户已被禁用');
    }

    await user.update({ lastLoginAt: new Date() });

    const token = generateToken({
      id: user.id,
      username: user.username,
      role: user.role,
    });

    ResponseUtil.success(res, {
      token,
      user: {
        id: user.id,
        username: user.username,
        realName: user.realName,
        phone: user.phone,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    }, '登录成功');
  } catch (error) {
    next(error);
  }
};

export const register = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username, password, realName, phone, email, role } = req.body;

    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      throw new BadRequestError('用户名已存在');
    }

    const user = await User.create({
      username,
      password,
      realName,
      phone,
      email,
      role,
      status: true,
    });

    ResponseUtil.success(
      res,
      {
        id: user.id,
        username: user.username,
        realName: user.realName,
        phone: user.phone,
        email: user.email,
        role: user.role,
      },
      '注册成功'
    );
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findByPk(req.user!.id);
    if (!user) {
      throw new NotFoundError('用户不存在');
    }

    ResponseUtil.success(res, {
      id: user.id,
      username: user.username,
      realName: user.realName,
      phone: user.phone,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      status: user.status,
      lastLoginAt: user.lastLoginAt,
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findByPk(req.user!.id);
    
    if (!user) {
      throw new NotFoundError('用户不存在');
    }

    const isPasswordValid = await user.comparePassword(oldPassword);
    if (!isPasswordValid) {
      throw new BadRequestError('旧密码错误');
    }

    await user.update({ password: newPassword });

    ResponseUtil.success(res, null, '密码修改成功');
  } catch (error) {
    next(error);
  }
};
