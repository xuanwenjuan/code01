import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { User } from '../models';
import { UserRole } from '../types';
import { PasswordUtil } from '../utils/password';
import { JwtUtil } from '../utils/jwt';
import { ResponseUtil } from '../utils/response';
import { BadRequestException, UnauthorizedException, NotFoundException } from '../exceptions/HttpException';

export const registerSchema = Joi.object({
  body: Joi.object({
    username: Joi.string().min(3).max(50).required().messages({
      'string.min': '用户名长度不能少于3个字符',
      'string.max': '用户名长度不能超过50个字符',
      'any.required': '用户名不能为空',
    }),
    password: Joi.string().min(6).max(100).required().messages({
      'string.min': '密码长度不能少于6个字符',
      'string.max': '密码长度不能超过100个字符',
      'any.required': '密码不能为空',
    }),
    phone: Joi.string().pattern(/^1[3-9]\d{9}$/).required().messages({
      'string.pattern.base': '手机号格式不正确',
      'any.required': '手机号不能为空',
    }),
    email: Joi.string().email().optional().messages({
      'string.email': '邮箱格式不正确',
    }),
    role: Joi.string().valid(...Object.values(UserRole)).optional().default(UserRole.USER),
  }),
});

export const loginSchema = Joi.object({
  body: Joi.object({
    username: Joi.string().required().messages({
      'any.required': '用户名不能为空',
    }),
    password: Joi.string().required().messages({
      'any.required': '密码不能为空',
    }),
  }),
});

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password, phone, email, role } = req.body;

    const existingUser = await User.findOne({
      where: { username },
    });
    if (existingUser) {
      throw new BadRequestException('用户名已存在');
    }

    const existingPhone = await User.findOne({
      where: { phone },
    });
    if (existingPhone) {
      throw new BadRequestException('手机号已被注册');
    }

    const hashedPassword = await PasswordUtil.hashPassword(password);

    const user = await User.create({
      username,
      password: hashedPassword,
      phone,
      email,
      role,
      status: 1,
    });

    const token = JwtUtil.generateToken(user.id, user.role, user.username);

    res.json(ResponseUtil.success({
      user: {
        id: user.id,
        username: user.username,
        phone: user.phone,
        email: user.email,
        role: user.role,
      },
      token,
    }, '注册成功'));
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({
      where: { username },
    });
    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    const isPasswordValid = await PasswordUtil.comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    if (user.status !== 1) {
      throw new UnauthorizedException('账号已被禁用');
    }

    const token = JwtUtil.generateToken(user.id, user.role, user.username);

    res.json(ResponseUtil.success({
      user: {
        id: user.id,
        username: user.username,
        phone: user.phone,
        email: user.email,
        role: user.role,
      },
      token,
    }, '登录成功'));
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findByPk(req.user!.userId, {
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    res.json(ResponseUtil.success(user, '获取用户信息成功'));
  } catch (error) {
    next(error);
  }
};
