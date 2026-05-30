import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import User, { UserRole } from '../models/User';
import { JwtUtil } from '../utils/jwt';
import { ResponseUtil } from '../utils/response';
import { AppError } from '../middlewares/errorHandler';
import bcrypt from 'bcryptjs';

const registerSchema = Joi.object({
  username: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(50).required(),
  phone: Joi.string().optional(),
});

const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      throw new AppError(error.details[0].message, 400);
    }

    const { username, email, password, phone } = value;

    const existingUser = await User.findOne({
      where: {
        username,
      },
    });

    if (existingUser) {
      throw new AppError('用户名已存在', 400);
    }

    const existingEmail = await User.findOne({
      where: {
        email,
      },
    });

    if (existingEmail) {
      throw new AppError('邮箱已被注册', 400);
    }

    const user = await User.create({
      username,
      email,
      password,
      phone,
      role: UserRole.USER,
      status: 1,
    });

    const token = JwtUtil.generateToken({
      id: user.id,
      username: user.username,
      role: user.role,
    });

    return ResponseUtil.success(
      res,
      {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      },
      '注册成功'
    );
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      throw new AppError(error.details[0].message, 400);
    }

    const { username, password } = value;

    const user = await User.scope('withPassword').findOne({
      where: {
        username,
      },
    });

    if (!user) {
      throw new AppError('用户名或密码错误', 400);
    }

    if (user.status !== 1) {
      throw new AppError('账号已被禁用', 400);
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AppError('用户名或密码错误', 400);
    }

    await user.update({ lastLoginTime: new Date() });

    const token = JwtUtil.generateToken({
      id: user.id,
      username: user.username,
      role: user.role,
    });

    return ResponseUtil.success(
      res,
      {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      },
      '登录成功'
    );
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findByPk(req.user!.id);
    if (!user) {
      throw new AppError('用户不存在', 404);
    }

    return ResponseUtil.success(res, user, '获取用户信息成功');
  } catch (error) {
    next(error);
  }
};

export const createAdmin = async () => {
  try {
    const adminExists = await User.findOne({ where: { role: UserRole.ADMIN } });
    if (adminExists) {
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    await User.create({
      username: 'admin',
      email: 'admin@flower.com',
      password: hashedPassword,
      role: UserRole.ADMIN,
      status: 1,
    });

    console.log('管理员账号创建成功: admin / admin123');
  } catch (error) {
    console.error('创建管理员账号失败:', error);
  }
};
