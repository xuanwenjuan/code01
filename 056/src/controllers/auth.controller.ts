import { Request, Response } from 'express';
import authService from '../services/auth.service';
import ResponseUtil from '../utils/response';
import asyncHandler from '../middleware/asyncHandler.middleware';

export class AuthController {
  register = asyncHandler(async (req: Request, res: Response) => {
    const user = await authService.register(req.body);
    ResponseUtil.success(res, user, '注册成功');
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const { username, password } = req.body;
    const result = await authService.login(username, password);
    ResponseUtil.success(res, result, '登录成功');
  });

  getProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const user = await authService.getProfile(userId);
    ResponseUtil.success(res, user, '查询成功');
  });

  changePassword = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { oldPassword, newPassword } = req.body;
    await authService.changePassword(userId, oldPassword, newPassword);
    ResponseUtil.success(res, null, '密码修改成功');
  });
}

export default new AuthController();
