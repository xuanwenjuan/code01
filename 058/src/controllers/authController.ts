import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { Result } from '../utils/response';
import { UserRole } from '../types';

export const register = async (req: Request, res: Response) => {
  const { username, password, phone, role } = req.body;
  const user = await AuthService.register(username, password, phone, role);
  return Result.sendSuccess(res, user, '注册成功');
};

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  const result = await AuthService.login(username, password);
  return Result.sendSuccess(res, result, '登录成功');
};

export const getCurrentUser = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const user = await AuthService.getCurrentUser(userId);
  return Result.sendSuccess(res, user, '获取成功');
};
