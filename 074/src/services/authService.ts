import { User } from '../models';
import { AppError } from '../middleware/errorHandler';
import { comparePassword, hashPassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { UserRole } from '../types';

export const login = async (username: string, password: string) => {
  const user = await User.findOne({ where: { username } });
  if (!user) {
    throw new AppError('用户名或密码错误', 401);
  }

  if (!user.isActive) {
    throw new AppError('账号已被禁用', 403);
  }

  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw new AppError('用户名或密码错误', 401);
  }

  const token = generateToken(user.id, user.username, user.role);

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      realName: user.realName,
      role: user.role,
      phone: user.phone,
      email: user.email
    }
  };
};

export const changePassword = async (
  userId: number,
  oldPassword: string,
  newPassword: string
) => {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new AppError('用户不存在', 404);
  }

  const isPasswordValid = await comparePassword(oldPassword, user.password);
  if (!isPasswordValid) {
    throw new AppError('原密码错误', 400);
  }

  user.password = await hashPassword(newPassword);
  await user.save();

  return { message: '密码修改成功' };
};

export const createInitialAdmin = async () => {
  const existingAdmin = await User.findOne({ where: { role: UserRole.SUPER_ADMIN } });
  if (existingAdmin) {
    console.log('管理员账户已存在');
    return;
  }

  const hashedPassword = await hashPassword('admin123');
  await User.create({
    username: 'admin',
    password: hashedPassword,
    realName: '超级管理员',
    role: UserRole.SUPER_ADMIN,
    phone: '13800138000',
    email: 'admin@example.com',
    isActive: true
  });

  console.log('初始管理员账户创建成功: admin / admin123');
};
