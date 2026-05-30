import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/response';
import { authService } from '../services/auth.service';

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return ApiResponse.badRequest(res, '用户名和密码不能为空');
      }

      const result = await authService.login(username, password);
      return ApiResponse.success(res, result, '登录成功');
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      return ApiResponse.success(res, req.user, '获取成功');
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
