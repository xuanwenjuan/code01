import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/authService';

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password } = req.body;
    const result = await authService.login(username, password);
    res.success(result, '登录成功');
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { oldPassword, newPassword } = req.body;
    const result = await authService.changePassword(userId, oldPassword, newPassword);
    res.success(result);
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.success(req.user);
  } catch (error) {
    next(error);
  }
};
