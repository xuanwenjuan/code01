import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models';
import { ResponseUtil } from '../utils/response';
import { UserRole } from '../constants';

export const register = async (req: Request, res: Response) => {
  const { username, password, realName, phone, email, role } = req.body;
  const existingUser = await User.findOne({ where: { username } });
  if (existingUser) {
    return res.status(400).json(ResponseUtil.badRequest('用户名已存在'));
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    username,
    password: hashedPassword,
    realName,
    phone,
    email,
    role: role || UserRole.CUSTOMER,
    status: true
  });
  const userData = user.toJSON();
  delete (userData as any).password;
  res.status(201).json(ResponseUtil.success(userData, '注册成功'));
};

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  const user = await User.findOne({ where: { username } });
  if (!user) {
    return res.status(401).json(ResponseUtil.unauthorized('用户名或密码错误'));
  }
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json(ResponseUtil.unauthorized('用户名或密码错误'));
  }
  if (!user.status) {
    return res.status(403).json(ResponseUtil.forbidden('账号已被禁用'));
  }
  const token = jwt.sign(
    {
      userId: user.id,
      username: user.username,
      role: user.role
    },
    process.env.JWT_SECRET || 'homestay-booking-jwt-secret-key-2024',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
  const userData = user.toJSON();
  delete (userData as any).password;
  res.json(ResponseUtil.success({ user: userData, token }, '登录成功'));
};

export const getProfile = async (req: Request, res: Response) => {
  const user = await User.findByPk(req.user!.userId, {
    attributes: { exclude: ['password'] }
  });
  if (!user) {
    return res.status(404).json(ResponseUtil.notFound('用户不存在'));
  }
  res.json(ResponseUtil.success(user));
};
