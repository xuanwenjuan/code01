import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/authService';
import { successResponse } from '../middleware/responseHandler';
import { RequestWithUser } from '../types';

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { username, password } = req.body;
    const result = await authService.login(username, password);
    successResponse(res, result, '登录成功');
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await authService.createUser(req.body);
    const userData = user.toJSON();
    delete (userData as any).password;
    successResponse(res, userData, '创建用户成功', 201);
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
  try {
    successResponse(res, req.user, '获取用户信息成功');
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const users = await authService.getAllUsers();
    successResponse(res, users, '获取用户列表成功');
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await authService.updateUser(Number(id), req.body);
    const userData = user.toJSON();
    delete (userData as any).password;
    successResponse(res, userData, '更新用户成功');
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    await authService.deleteUser(Number(id));
    successResponse(res, null, '删除用户成功');
  } catch (error) {
    next(error);
  }
};
