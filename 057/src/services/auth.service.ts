import User, { UserRole } from '../models/User';
import { generateLoginTokens, LoginTokens, revokeToken, refreshAccessToken } from '../utils/jwt';
import { BadRequestException, UnauthorizedException, ConflictException, NotFoundException } from '../exceptions/HttpException';
import bcrypt from 'bcryptjs';

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: number;
    username: string;
    email?: string;
    role: UserRole;
    employeeId?: number;
  };
}

export interface CreateUserData {
  username: string;
  password: string;
  email?: string;
  phone?: string;
  role: UserRole;
  employeeId?: number;
}

export const login = async (username: string, password: string): Promise<LoginResponse> => {
  const user = await User.findOne({ where: { username } });
  
  if (!user) {
    throw new UnauthorizedException('用户名或密码错误');
  }
  
  const isPasswordValid = await user.comparePassword(password);
  
  if (!isPasswordValid) {
    throw new UnauthorizedException('用户名或密码错误');
  }
  
  if (!user.isActive) {
    throw new UnauthorizedException('账户已被禁用，请联系管理员');
  }
  
  await user.update({ lastLoginAt: new Date() });
  
  const tokens = generateLoginTokens({
    userId: user.id,
    username: user.username,
    role: user.role,
    employeeId: user.employeeId,
  });
  
  return {
    ...tokens,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      employeeId: user.employeeId,
    },
  };
};

export const refreshToken = async (refreshTokenStr: string): Promise<LoginTokens> => {
  try {
    return refreshAccessToken(refreshTokenStr);
  } catch (error) {
    throw new UnauthorizedException('Refresh Token无效或已过期');
  }
};

export const logout = async (token: string): Promise<void> => {
  revokeToken(token);
};

export const changePassword = async (
  userId: number,
  oldPassword: string,
  newPassword: string
): Promise<void> => {
  const user = await User.findByPk(userId);
  
  if (!user) {
    throw new UnauthorizedException('用户不存在');
  }
  
  const isOldPasswordValid = await user.comparePassword(oldPassword);
  
  if (!isOldPasswordValid) {
    throw new BadRequestException('旧密码错误');
  }
  
  if (newPassword.length < 6) {
    throw new BadRequestException('新密码长度不能少于6位');
  }
  
  await user.update({ password: newPassword });
};

export const createUser = async (data: CreateUserData): Promise<User> => {
  const existingUser = await User.findOne({ where: { username: data.username } });
  
  if (existingUser) {
    throw new ConflictException('用户名已存在');
  }
  
  return User.create({
    ...data,
    isActive: true,
  });
};

export const updateUserStatus = async (userId: number, isActive: boolean): Promise<User> => {
  const user = await User.findByPk(userId);
  
  if (!user) {
    throw new NotFoundException('用户不存在');
  }
  
  await user.update({ isActive });
  
  return user;
};

export const getUserList = async (): Promise<User[]> => {
  return User.findAll({
    attributes: { exclude: ['password'] },
    order: [['createdAt', 'DESC']],
  });
};

export const getCurrentUser = async (userId: number) => {
  const user = await User.findByPk(userId, {
    attributes: { exclude: ['password'] },
  });
  
  if (!user) {
    throw new NotFoundException('用户不存在');
  }
  
  return user;
};

export const createInitialAdmin = async (): Promise<void> => {
  const adminExists = await User.findOne({ where: { role: UserRole.ADMIN } });
  
  if (!adminExists) {
    await User.create({
      username: 'admin',
      password: '123456',
      email: 'admin@example.com',
      role: UserRole.ADMIN,
      isActive: true,
    });
    console.log('初始管理员账户已创建: admin / 123456');
  }
};
