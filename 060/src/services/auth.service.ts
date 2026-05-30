import { User } from '../database/models/user.model';
import { comparePassword, generateToken, hashPassword } from '../utils/jwt';
import { AppError } from '../middleware/errorHandler';
import { UserRole } from '../types/common';

export class AuthService {
  async login(username: string, password: string) {
    const user = await User.findOne({ where: { username } });
    if (!user) {
      throw new AppError('用户名或密码错误', 400);
    }

    if (!user.enabled) {
      throw new AppError('账户已被禁用', 400);
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new AppError('用户名或密码错误', 400);
    }

    const token = generateToken({
      id: user.id,
      username: user.username,
      role: user.role,
    });

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        realName: user.realName,
        role: user.role,
        phone: user.phone,
      },
    };
  }

  async createInitialAdmin() {
    const existingAdmin = await User.findOne({ where: { role: UserRole.SUPER_ADMIN } });
    if (existingAdmin) {
      return null;
    }

    const hashedPassword = await hashPassword('admin123');
    const admin = await User.create({
      username: 'admin',
      password: hashedPassword,
      role: UserRole.SUPER_ADMIN,
      realName: '超级管理员',
      enabled: true,
    });

    return admin;
  }
}

export const authService = new AuthService();
