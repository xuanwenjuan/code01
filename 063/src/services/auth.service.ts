import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '../models/User';
import { BusinessError } from '../middlewares/errorHandler';

dotenv.config();

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthUser {
  id: number;
  username: string;
  roleId: number;
  departmentId: number;
}

class AuthService {
  async login(loginRequest: LoginRequest) {
    const user = await User.findOne({
      where: { username: loginRequest.username }
    });

    if (!user) {
      throw new BusinessError('用户名或密码错误', 400);
    }

    if (user.status !== 1) {
      throw new BusinessError('账号已被禁用', 400);
    }

    const isValidPassword = await bcrypt.compare(
      loginRequest.password,
      user.password
    );

    if (!isValidPassword) {
      throw new BusinessError('用户名或密码错误', 400);
    }

    const token = this.generateToken({
      id: user.id,
      username: user.username,
      roleId: user.roleId,
      departmentId: user.departmentId
    });

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        realName: user.realName,
        email: user.email,
        phone: user.phone,
        roleId: user.roleId,
        departmentId: user.departmentId
      }
    };
  }

  generateToken(user: AuthUser): string {
    return jwt.sign(
      user,
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }
}

export default new AuthService();