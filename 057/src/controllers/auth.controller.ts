import { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import { ResponseUtil } from '../utils/response';

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  const result = await authService.login(username, password);
  return ResponseUtil.success(res, result, '登录成功');
};

export const refreshToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  const result = await authService.refreshToken(refreshToken);
  return ResponseUtil.success(res, result, 'Token刷新成功');
};

export const logout = async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1] || '';
  await authService.logout(token);
  return ResponseUtil.success(res, null, '登出成功');
};

export const changePassword = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { oldPassword, newPassword } = req.body;
  await authService.changePassword(userId, oldPassword, newPassword);
  return ResponseUtil.success(res, null, '密码修改成功');
};

export const getCurrentUser = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const result = await authService.getCurrentUser(userId);
  return ResponseUtil.success(res, result, '获取用户信息成功');
};

export const createUser = async (req: Request, res: Response) => {
  const result = await authService.createUser(req.body);
  const { password, ...userData } = result.toJSON();
  return ResponseUtil.created(res, userData, '创建用户成功');
};

export const updateUserStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { isActive } = req.body;
  const result = await authService.updateUserStatus(parseInt(id), isActive);
  const { password, ...userData } = result.toJSON();
  return ResponseUtil.success(res, userData, '用户状态更新成功');
};

export const getUserList = async (req: Request, res: Response) => {
  const result = await authService.getUserList();
  return ResponseUtil.success(res, result, '获取用户列表成功');
};
