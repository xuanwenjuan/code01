import User from '../models/User';
import { UserRole } from '../types';
import { NotFoundError, UnauthorizedError, BadRequestError } from '../utils/errors';
import { JwtUtil } from '../utils/jwt';

interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: {
    id: number;
    username: string;
    email: string;
    role: UserRole;
    realName?: string;
  };
}

interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  phone?: string;
  realName?: string;
  role?: UserRole;
}

export class AuthService {
  static async login(data: LoginRequest): Promise<LoginResponse> {
    const user = await User.findOne({ where: { username: data.username } });

    if (!user) {
      throw new UnauthorizedError('用户名或密码错误');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('账户已被禁用');
    }

    const isPasswordValid = await user.comparePassword(data.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('用户名或密码错误');
    }

    await user.update({ lastLoginAt: new Date() });

    const token = JwtUtil.generateToken(user.id, user.username, user.role);

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        realName: user.realName,
      },
    };
  }

  static async register(data: RegisterRequest): Promise<User> {
    const existingUser = await User.findOne({
      where: {
        username: data.username,
      },
    });

    if (existingUser) {
      throw new BadRequestError('用户名已存在');
    }

    const existingEmail = await User.findOne({
      where: {
        email: data.email,
      },
    });

    if (existingEmail) {
      throw new BadRequestError('邮箱已被使用');
    }

    const user = await User.create({
      username: data.username,
      password: data.password,
      email: data.email,
      phone: data.phone,
      realName: data.realName,
      role: data.role || UserRole.WAREHOUSE,
    });

    return user;
  }

  static async getCurrentUser(userId: number): Promise<User> {
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password', 'deletedAt'] },
    });

    if (!user) {
      throw new NotFoundError('用户不存在');
    }

    return user;
  }
}
