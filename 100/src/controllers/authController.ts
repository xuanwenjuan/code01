import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models';
import { success, error, badRequest, unauthorized } from '../utils/response';
import { generateToken } from '../utils/jwt';
import { UserRole } from '../types';

export async function login(req: Request, res: Response) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json(badRequest('用户名和密码不能为空'));
  }

  const user = await User.findOne({ where: { username } });
  if (!user) {
    return res.status(401).json(unauthorized('用户名或密码错误'));
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return res.status(401).json(unauthorized('用户名或密码错误'));
  }

  if (!user.status) {
    return res.status(403).json({
      code: 403,
      message: '账号已被禁用',
      timestamp: Date.now()
    });
  }

  const token = generateToken({
    userId: user.id,
    username: user.username,
    role: user.role
  });

  res.json(success({
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
}

export async function register(req: Request, res: Response) {
  const { username, password, realName, role, phone, email } = req.body;

  if (!username || !password || !realName || !role) {
    return res.status(400).json(badRequest('必填项不能为空'));
  }

  if (!Object.values(UserRole).includes(role)) {
    return res.status(400).json(badRequest('无效的角色'));
  }

  const existing = await User.findOne({ where: { username } });
  if (existing) {
    return res.status(400).json(badRequest('用户名已存在'));
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    username,
    password: hashedPassword,
    realName,
    role,
    phone,
    email,
    status: true
  });

  res.json(success({
    id: user.id,
    username: user.username,
    realName: user.realName,
    role: user.role
  }, '注册成功'));
}

export async function getCurrentUser(req: Request, res: Response) {
  const user = await User.findByPk(req.user?.userId, {
    attributes: ['id', 'username', 'realName', 'role', 'phone', 'email']
  });

  if (!user) {
    return res.status(404).json({
      code: 404,
      message: '用户不存在',
      timestamp: Date.now()
    });
  }

  res.json(success(user));
}
