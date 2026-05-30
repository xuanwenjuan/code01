import User from '../models/User';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { UnauthorizedException, BusinessException } from '../exceptions/BusinessException';
import { UserRole } from '../constants/role';

class AuthService {
  async login(username: string, password: string, ip?: string) {
    const user = await User.findOne({ where: { username } });
    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    if (user.status !== 1) {
      throw new BusinessException('账号已被禁用');
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    await user.update({
      lastLoginTime: new Date(),
      lastLoginIp: ip
    });

    const token = this.generateToken(user);

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        realName: user.realName,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar
      }
    };
  }

  generateToken(user: User): string {
    return jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role
      },
      process.env.JWT_SECRET || 'clock-repair-secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
  }

  async createUser(data: {
    username: string;
    password: string;
    realName: string;
    phone: string;
    role: UserRole;
    avatar?: string;
  }) {
    const existing = await User.findOne({ where: { username: data.username } });
    if (existing) {
      throw new BusinessException('用户名已存在');
    }

    return User.create(data);
  }

  async getUserInfo(userId: number) {
    const user = await User.findByPk(userId, {
      attributes: ['id', 'username', 'realName', 'phone', 'role', 'avatar', 'status']
    });
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }
    return user;
  }
}

export default new AuthService();