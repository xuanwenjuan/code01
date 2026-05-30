
import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models';
import { success, error } from '../utils/response';
import { UserRole } from '../types';

export const authValidationRules = {
  login: [
    body('username').notEmpty().withMessage('用户名不能为空'),
    body('password').notEmpty().withMessage('密码不能为空')
  ],
  register: [
    body('username').notEmpty().withMessage('用户名不能为空'),
    body('password').notEmpty().withMessage('密码不能为空'),
    body('realName').notEmpty().withMessage('真实姓名不能为空')
  ]
};

export const login = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return error(res, errors.array()[0].msg);
    }

    const { username, password } = req.body;

    const user = await User.findOne({ where: { username } });
    if (!user) {
      return error(res, '用户名或密码错误');
    }

    if (!user.isActive) {
      return error(res, '账户已被禁用');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return error(res, '用户名或密码错误');
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    success(res, {
      token,
      user: {
        id: user.id,
        username: user.username,
        realName: user.realName,
        phone: user.phone,
        email: user.email,
        department: user.department,
        role: user.role
      }
    }, '登录成功');
  } catch (err) {
    error(res, '登录失败');
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return error(res, errors.array()[0].msg);
    }

    const { username, password, realName, phone, email, department } = req.body;

    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return error(res, '用户名已存在');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      password: hashedPassword,
      realName,
      phone,
      email,
      department,
      role: UserRole.GENERAL_USER,
      isActive: true
    });

    success(res, {
      id: user.id,
      username: user.username,
      realName: user.realName
    }, '注册成功', 201);
  } catch (err) {
    error(res, '注册失败');
  }
};

export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return error(res, '未认证', 401);
    }

    const user = await User.findByPk(req.user.userId);
    if (!user) {
      return error(res, '用户不存在', 404);
    }

    success(res, {
      id: user.id,
      username: user.username,
      realName: user.realName,
      phone: user.phone,
      email: user.email,
      department: user.department,
      role: user.role
    }, '获取成功');
  } catch (err) {
    error(res, '获取用户信息失败');
  }
};
