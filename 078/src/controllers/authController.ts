import { Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User, { UserRole } from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { ResponseUtil } from '../utils/response';
import { AppError } from '../middleware/errorHandler';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

export const login = async (req: AuthRequest, res: Response) => {
  const { username, password } = req.body;

  const user = await User.findOne({
    where: { username },
    include: [{ association: 'department', attributes: ['id', 'name'] }]
  });

  if (!user) {
    throw new AppError('用户名或密码错误', 400);
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    throw new AppError('用户名或密码错误', 400);
  }

  if (user.status !== 1) {
    throw new AppError('账号已被禁用', 400);
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET as string,
    { expiresIn: JWT_EXPIRES_IN as string }
  );

  await user.update({ lastLoginTime: new Date() });

  const userData = user as any;
  res.json(ResponseUtil.success({
    token,
    user: {
      id: user.id,
      username: user.username,
      realName: user.realName,
      phone: user.phone,
      email: user.email,
      role: user.role,
      department: userData.department,
      avatar: user.avatar
    }
  }, '登录成功'));
};

export const register = async (req: AuthRequest, res: Response) => {
  const { username, password, realName, phone, email, departmentId } = req.body;

  const existingUser = await User.findOne({ where: { username } });
  if (existingUser) {
    throw new AppError('用户名已存在', 400);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    username,
    password: hashedPassword,
    realName,
    phone,
    email,
    departmentId,
    role: UserRole.EMPLOYEE,
    status: 1
  });

  res.json(ResponseUtil.success({
    id: user.id,
    username: user.username,
    realName: user.realName
  }, '注册成功'));
};

export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  const user = await User.findByPk(req.user!.id, {
    attributes: ['id', 'username', 'realName', 'phone', 'email', 'role', 'avatar', 'departmentId'],
    include: [{ association: 'department', attributes: ['id', 'name'] }]
  });

  res.json(ResponseUtil.success(user));
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findByPk(req.user!.id);
  if (!user) {
    throw new AppError('用户不存在', 404);
  }

  const isValidPassword = await bcrypt.compare(oldPassword, user.password);
  if (!isValidPassword) {
    throw new AppError('原密码错误', 400);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await user.update({ password: hashedPassword });

  res.json(ResponseUtil.success(null, '密码修改成功'));
};
