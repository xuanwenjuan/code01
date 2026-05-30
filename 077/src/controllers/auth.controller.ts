import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ApiResponse } from '../utils/response';
import { config } from '../config';
import User from '../database/models/User.model';
import { BadRequestException, UnauthorizedException, NotFoundException } from '../exceptions/http.exception';
import { UserRole } from '../types';

export const register = async (req: Request, res: Response) => {
  const { username, password, realName, phone, email, role } = req.body;

  if (!username || !password || !realName || !phone) {
    throw new BadRequestException('缺少必要参数');
  }

  const existingUser = await User.findOne({
    where: { username }
  });

  if (existingUser) {
    throw new BadRequestException('用户名已存在');
  }

  const existingPhone = await User.findOne({
    where: { phone }
  });

  if (existingPhone) {
    throw new BadRequestException('手机号已存在');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    username,
    password: hashedPassword,
    realName,
    phone,
    email,
    role: role || UserRole.OPERATOR,
    status: 1
  });

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );

  res.json(ApiResponse.success({
    token,
    user: {
      id: user.id,
      username: user.username,
      realName: user.realName,
      phone: user.phone,
      email: user.email,
      role: user.role,
      status: user.status
    }
  }, '注册成功'));
};

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    throw new BadRequestException('用户名和密码不能为空');
  }

  const user = await User.findOne({
    where: { username }
  });

  if (!user) {
    throw new UnauthorizedException('用户名或密码错误');
  }

  if (user.status !== 1) {
    throw new UnauthorizedException('账号已被禁用');
  }

  const isValidPassword = await bcrypt.compare(password, user.password);

  if (!isValidPassword) {
    throw new UnauthorizedException('用户名或密码错误');
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );

  await user.update({ lastLoginAt: new Date() });

  res.json(ApiResponse.success({
    token,
    user: {
      id: user.id,
      username: user.username,
      realName: user.realName,
      phone: user.phone,
      email: user.email,
      role: user.role,
      status: user.status
    }
  }, '登录成功'));
};

export const getCurrentUser = async (req: any, res: Response) => {
  const user = await User.findByPk(req.user.id, {
    attributes: { exclude: ['password'] }
  });

  if (!user) {
    throw new NotFoundException('用户不存在');
  }

  res.json(ApiResponse.success(user));
};

export const changePassword = async (req: any, res: Response) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    throw new BadRequestException('缺少必要参数');
  }

  const user = await User.findByPk(req.user.id);

  if (!user) {
    throw new NotFoundException('用户不存在');
  }

  const isValidPassword = await bcrypt.compare(oldPassword, user.password);

  if (!isValidPassword) {
    throw new BadRequestException('原密码错误');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await user.update({ password: hashedPassword });

  res.json(ApiResponse.success(null, '密码修改成功'));
};
