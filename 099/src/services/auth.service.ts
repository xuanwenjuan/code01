import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from '../config';
import { User } from '../models';
import { BusinessException } from '../utils/response';
import { UserRole } from '../constants';

export interface LoginDto {
  username: string;
  password: string;
}

export interface RegisterDto {
  username: string;
  password: string;
  realName: string;
  phone?: string;
  role: UserRole;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    username: string;
    realName: string;
    role: UserRole;
    phone?: string;
  };
}

class AuthService {
  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = await User.findOne({ where: { username: loginDto.username } });
    
    if (!user) {
      throw new BusinessException('用户名或密码错误', 401);
    }

    if (user.status === 'inactive') {
      throw new BusinessException('账户已被禁用', 403);
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new BusinessException('用户名或密码错误', 401);
    }

    await user.update({ lastLoginAt: new Date() });

    const token = this.generateToken(user.id, user.username, user.role);

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        realName: user.realName,
        role: user.role,
        phone: user.phone
      }
    };
  }

  async register(registerDto: RegisterDto, currentUser?: any): Promise<AuthResponse> {
    const existingUser = await User.findOne({ where: { username: registerDto.username } });
    if (existingUser) {
      throw new BusinessException('用户名已存在', 400);
    }

    const user = await User.create({
      ...registerDto,
      status: 'active'
    });

    const token = this.generateToken(user.id, user.username, user.role);

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        realName: user.realName,
        role: user.role,
        phone: user.phone
      }
    };
  }

  async getUsers(page: number = 1, pageSize: number = 10, role?: UserRole) {
    const where: any = {};
    if (role) {
      where.role = role;
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      limit: pageSize,
      offset: (page - 1) * pageSize,
      order: [['createdAt', 'DESC']]
    });

    return {
      list: rows,
      total: count,
      page,
      pageSize,
      totalPages: Math.ceil(count / pageSize)
    };
  }

  async getUserById(id: number) {
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      throw new BusinessException('用户不存在', 404);
    }

    return user;
  }

  async updateUser(id: number, updateDto: Partial<RegisterDto> & { status?: string }) {
    const user = await User.findByPk(id);
    if (!user) {
      throw new BusinessException('用户不存在', 404);
    }

    await user.update(updateDto);

    const updatedUser = await User.findByPk(id, {
      attributes: { exclude: ['password'] }
    });

    return updatedUser;
  }

  async deleteUser(id: number) {
    const user = await User.findByPk(id);
    if (!user) {
      throw new BusinessException('用户不存在', 404);
    }

    await user.destroy();
    return null;
  }

  private generateToken(id: number, username: string, role: UserRole): string {
    return jwt.sign(
      { id, username, role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
  }
}

export const authService = new AuthService();
