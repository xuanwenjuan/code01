import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Admin } from '../models';
import { AdminRole, JwtPayload } from '../types';
import { AppError } from '../middleware/errorHandler';
import { Op } from 'sequelize';

interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: {
    id: number;
    username: string;
    realName: string;
    phone: string;
    role: AdminRole;
    storeId?: number;
  };
}

export class AuthService {
  static async login({ username, password }: LoginRequest): Promise<LoginResponse> {
    const admin = await Admin.findOne({
      where: { username }
    });

    if (!admin) {
      throw new AppError('用户名或密码错误', 401);
    }

    if (admin.status !== 1) {
      throw new AppError('账号已被禁用', 403);
    }

    const isValidPassword = await bcrypt.compare(password, admin.password);
    if (!isValidPassword) {
      throw new AppError('用户名或密码错误', 401);
    }

    const payload: JwtPayload = {
      id: admin.id,
      username: admin.username,
      role: admin.role,
      storeId: admin.storeId
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    await admin.update({ lastLoginTime: new Date() });

    return {
      token,
      user: {
        id: admin.id,
        username: admin.username,
        realName: admin.realName,
        phone: admin.phone,
        role: admin.role,
        storeId: admin.storeId
      }
    };
  }

  static async createSuperAdmin(): Promise<void> {
    const exists = await Admin.findOne({
      where: { role: AdminRole.SUPER_ADMIN }
    });

    if (!exists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await Admin.create({
        username: 'admin',
        password: hashedPassword,
        realName: '超级管理员',
        phone: '13800138000',
        role: AdminRole.SUPER_ADMIN,
        status: 1
      });
      console.log('超级管理员创建成功: admin / admin123');
    }
  }
}
