import jwt from 'jsonwebtoken';
import { User } from '../models';
import { UserRole } from '../types';
import { env } from '../config/env';
import { BadRequestException, UnauthorizedException, NotFoundException } from '../exceptions/HttpException';
import bcrypt from 'bcryptjs';

export interface LoginDto {
  username: string;
  password: string;
}

export interface RegisterDto {
  username: string;
  password: string;
  phone: string;
  role?: UserRole;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    username: string;
    phone: string;
    role: UserRole;
    avatar?: string;
  };
}

class AuthService {
  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const { username, password } = loginDto;

    const user = await User.findOne({ where: { username } });
    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    if (!user.status) {
      throw new UnauthorizedException('账号已被禁用');
    }

    const token = this.generateToken(user.id, user.role, user.username);

    await user.update({ lastLoginAt: new Date() });

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar
      }
    };
  }

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const { username, password, phone, role } = registerDto;

    const existingUser = await User.findOne({ 
      where: { 
        username 
      } 
    });
    if (existingUser) {
      throw new BadRequestException('用户名已存在');
    }

    const existingPhone = await User.findOne({ where: { phone } });
    if (existingPhone) {
      throw new BadRequestException('手机号已被注册');
    }

    const user = await User.create({
      username,
      password,
      phone,
      role: role || UserRole.CUSTOMER
    });

    const token = this.generateToken(user.id, user.role, user.username);

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar
      }
    };
  }

  async getCurrentUser(userId: string) {
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    return user;
  }

  private generateToken(userId: string, role: UserRole, username: string): string {
    return jwt.sign(
      { userId, role, username },
      env.JWT.SECRET,
      { expiresIn: env.JWT.EXPIRES_IN }
    );
  }
}

export default new AuthService();
