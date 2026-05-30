import jwt from 'jsonwebtoken';
import { User } from '../models';
import { AppError } from '../middleware/errorHandler';
import { UserRole } from '../types';

export const login = async (username: string, password: string): Promise<{ token: string; user: any }> => {
  const user = await User.findOne({ where: { username } });

  if (!user) {
    throw new AppError('用户名或密码错误', 401);
  }

  if (!user.isActive) {
    throw new AppError('账号已被禁用', 403);
  }

  const isPasswordValid = await (user as any).comparePassword(password);

  if (!isPasswordValid) {
    throw new AppError('用户名或密码错误', 401);
  }

  const token = jwt.sign(
    {
      userId: user.id,
      username: user.username,
      role: user.role
    },
    process.env.JWT_SECRET || 'default_secret',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    }
  );

  const userData = user.toJSON();
  delete (userData as any).password;

  return { token, user: userData };
};

export const createUser = async (userData: {
  username: string;
  password: string;
  realName: string;
  role: UserRole;
  phone?: string;
  email?: string;
}): Promise<User> => {
  const existingUser = await User.findOne({ where: { username: userData.username } });

  if (existingUser) {
    throw new AppError('用户名已存在', 400);
  }

  return User.create(userData);
};

export const getAllUsers = async (): Promise<User[]> => {
  const users = await User.findAll({
    attributes: { exclude: ['password'] }
  });
  return users;
};

export const updateUser = async (id: number, userData: Partial<User>): Promise<User> => {
  const user = await User.findByPk(id);

  if (!user) {
    throw new AppError('用户不存在', 404);
  }

  await user.update(userData);
  return user;
};

export const deleteUser = async (id: number): Promise<void> => {
  const user = await User.findByPk(id);

  if (!user) {
    throw new AppError('用户不存在', 404);
  }

  await user.destroy();
};
