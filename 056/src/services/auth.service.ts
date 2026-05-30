import { User } from '../models';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { UserRole } from '../types';
import PasswordUtil from '../utils/password';
import JwtUtil from '../utils/jwt';

export class AuthService {
  async register(data: {
    username: string;
    password: string;
    realName: string;
    phone?: string;
    email?: string;
    role?: UserRole;
    departmentId?: number;
  }) {
    const exists = await User.findOne({ where: { username: data.username } });
    if (exists) {
      throw new BadRequestError('用户名已存在');
    }

    const hashedPassword = await PasswordUtil.hash(data.password);

    const user = await User.create({
      ...data,
      password: hashedPassword,
      role: data.role || UserRole.USER,
      isActive: true,
    });

    const { password, ...userWithoutPassword } = user.toJSON();
    return userWithoutPassword;
  }

  async login(username: string, password: string) {
    const user = await User.findOne({ where: { username } });
    if (!user) {
      throw new NotFoundError('用户不存在');
    }

    if (!user.isActive) {
      throw new BadRequestError('用户已被禁用');
    }

    const isValid = await PasswordUtil.compare(password, user.password);
    if (!isValid) {
      throw new BadRequestError('密码错误');
    }

    const token = JwtUtil.generateToken(user.id, user.username, user.role);
    const { password: _, ...userWithoutPassword } = user.toJSON();

    return {
      user: userWithoutPassword,
      token,
    };
  }

  async getProfile(userId: number) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new NotFoundError('用户不存在');
    }

    const { password, ...userWithoutPassword } = user.toJSON();
    return userWithoutPassword;
  }

  async changePassword(userId: number, oldPassword: string, newPassword: string) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new NotFoundError('用户不存在');
    }

    const isValid = await PasswordUtil.compare(oldPassword, user.password);
    if (!isValid) {
      throw new BadRequestError('原密码错误');
    }

    const hashedPassword = await PasswordUtil.hash(newPassword);
    await user.update({ password: hashedPassword });

    return true;
  }
}

export default new AuthService();
