import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models';
import { ResponseUtil } from '../utils/response';
import { BadRequestException, UnauthorizedException, NotFoundException } from '../exceptions/HttpException';
import { UserRole } from '../types';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'bakery_jwt_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export const register = async (req: Request, res: Response) => {
  const { username, password, realName, phone, email, role, storeId } = req.body;

  if (!username || !password) {
    throw new BadRequestException('用户名和密码不能为空');
  }

  const existingUser = await User.findOne({ where: { username } });
  if (existingUser) {
    throw new BadRequestException('用户名已存在');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    username,
    password: hashedPassword,
    realName,
    phone,
    email,
    role: role || UserRole.CUSTOMER,
    storeId,
    status: 'active'
  });

  const userData = user.toJSON();
  delete (userData as any).password;

  res.status(201).json(ResponseUtil.created(userData, '注册成功'));
};

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    throw new BadRequestException('用户名和密码不能为空');
  }

  const user = await User.findOne({ where: { username } });
  if (!user) {
    throw new UnauthorizedException('用户名或密码错误');
  }

  if (user.status !== 'active') {
    throw new UnauthorizedException('账号已被禁用');
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    throw new UnauthorizedException('用户名或密码错误');
  }

  const token = jwt.sign(
    {
      userId: user.id,
      username: user.username,
      role: user.role,
      storeId: user.storeId
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  await user.update({ lastLoginAt: new Date() });

  const userData = user.toJSON();
  delete (userData as any).password;

  res.json(ResponseUtil.success({
    token,
    user: userData
  }, '登录成功'));
};

export const getCurrentUser = async (req: Request, res: Response) => {
  const user = await User.findByPk(req.user?.userId);
  if (!user) {
    throw new NotFoundException('用户不存在');
  }

  const userData = user.toJSON();
  delete (userData as any).password;

  res.json(ResponseUtil.success(userData));
};

export const changePassword = async (req: Request, res: Response) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    throw new BadRequestException('原密码和新密码不能为空');
  }

  const user = await User.findByPk(req.user?.userId);
  if (!user) {
    throw new NotFoundException('用户不存在');
  }

  const isValidPassword = await bcrypt.compare(oldPassword, user.password);
  if (!isValidPassword) {
    throw new BadRequestException('原密码错误');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await user.update({ password: hashedPassword });

  res.json(ResponseUtil.success(null, '密码修改成功'));
};
