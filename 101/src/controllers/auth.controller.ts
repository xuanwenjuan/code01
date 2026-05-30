import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Joi from 'joi';
import User from '../models/User.model';
import { UserRole } from '../constants/enum';
import { ResponseUtil } from '../utils/response';
import { BadRequestException, UnauthorizedException, NotFoundException } from '../exceptions/base.exception';

export const loginSchema = Joi.object({
  username: Joi.string().required().messages({
    'string.empty': '用户名不能为空',
    'any.required': '用户名是必填项'
  }),
  password: Joi.string().min(6).required().messages({
    'string.empty': '密码不能为空',
    'string.min': '密码长度不能少于6位',
    'any.required': '密码是必填项'
  })
});

export const registerSchema = Joi.object({
  username: Joi.string().min(3).max(50).required(),
  password: Joi.string().min(6).required(),
  realName: Joi.string().required(),
  role: Joi.string().valid(...Object.values(UserRole)).default(UserRole.BREEDER),
  phone: Joi.string().optional(),
  email: Joi.string().email().optional()
});

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ where: { username } });
    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('账户已被禁用');
    }

    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
    
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role
      },
      secret,
      { expiresIn }
    );

    await user.update({ lastLoginAt: new Date() });

    res.json(ResponseUtil.success({
      token,
      user: {
        id: user.id,
        username: user.username,
        realName: user.realName,
        role: user.role,
        phone: user.phone,
        email: user.email
      }
    }, '登录成功'));
  } catch (error) {
    next(error);
  }
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password, realName, role, phone, email } = req.body;

    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      throw new BadRequestException('用户名已存在');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      password: hashedPassword,
      realName,
      role: role || UserRole.BREEDER,
      phone,
      email,
      isActive: true
    });

    res.json(ResponseUtil.success({
      id: user.id,
      username: user.username,
      realName: user.realName,
      role: user.role
    }, '注册成功'));
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findByPk(req.user!.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    res.json(ResponseUtil.success(user));
  } catch (error) {
    next(error);
  }
};
