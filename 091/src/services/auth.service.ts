import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { BadRequestException, NotFoundException, UnauthorizedException } from '../exceptions/base.exception';
import User from '../models/user.model';
import { UserRole } from '../constants/role.constants';

export interface LoginDto {
  username: string;
  password: string;
}

export interface RegisterDto {
  username: string;
  password: string;
  realName: string;
  phone: string;
  role: UserRole;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    username: string;
    realName: string;
    phone: string;
    role: UserRole;
  };
}

class AuthService {
  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = await User.findOne({ where: { username: loginDto.username } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('密码错误');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('用户已被禁用');
    }

    await user.update({ lastLoginAt: new Date() });

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
      },
      env.JWT.SECRET,
      { expiresIn: env.JWT.EXPIRES_IN }
    );

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        realName: user.realName,
        phone: user.phone,
        role: user.role,
      },
    };
  }

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const existingUser = await User.findOne({ where: { username: registerDto.username } });
    if (existingUser) {
      throw new BadRequestException('用户名已存在');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = await User.create({
      username: registerDto.username,
      password: hashedPassword,
      realName: registerDto.realName,
      phone: registerDto.phone,
      role: registerDto.role,
      isActive: true,
    });

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
      },
      env.JWT.SECRET,
      { expiresIn: env.JWT.EXPIRES_IN }
    );

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        realName: user.realName,
        phone: user.phone,
        role: user.role,
      },
    };
  }

  async initAdminUser(): Promise<void> {
    const superAdminExists = await User.findOne({ where: { role: UserRole.SUPER_ADMIN } });
    if (!superAdminExists) {
      const hashedPassword = await bcrypt.hash('superadmin123', 10);
      await User.create({
        username: 'superadmin',
        password: hashedPassword,
        realName: '超级管理员',
        phone: '13900139000',
        role: UserRole.SUPER_ADMIN,
        isActive: true,
      });
    }

    const adminExists = await User.findOne({ where: { role: UserRole.ADMIN } });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        username: 'admin',
        password: hashedPassword,
        realName: '系统管理员',
        phone: '13800138000',
        role: UserRole.ADMIN,
        isActive: true,
      });
    }
  }
}

export default new AuthService();
