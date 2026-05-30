import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { User } from '../models';
import { BusinessError } from '../utils/businessError';
import { UserRole } from '../types';

dotenv.config();

export class AuthService {
  static async register(username: string, password: string, phone: string, role: UserRole = UserRole.USER) {
    const existingUser = await User.findOne({
      where: { username }
    });

    if (existingUser) {
      throw new BusinessError('用户名已存在', 400);
    }

    const existingPhone = await User.findOne({
      where: { phone }
    });

    if (existingPhone) {
      throw new BusinessError('手机号已被注册', 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      password: hashedPassword,
      phone,
      role,
      status: 1
    });

    return {
      id: user.id,
      username: user.username,
      phone: user.phone,
      role: user.role
    };
  }

  static async login(username: string, password: string) {
    const user = await User.findOne({
      where: { username }
    });

    if (!user) {
      throw new BusinessError('用户名或密码错误', 400);
    }

    if (user.status !== 1) {
      throw new BusinessError('账号已被禁用', 400);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new BusinessError('用户名或密码错误', 400);
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role
      },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        phone: user.phone,
        role: user.role
      }
    };
  }

  static async getCurrentUser(userId: number) {
    const user = await User.findByPk(userId, {
      attributes: ['id', 'username', 'phone', 'avatar', 'role', 'status', 'createdAt']
    });

    if (!user) {
      throw new BusinessError('用户不存在', 404);
    }

    return user;
  }
}
