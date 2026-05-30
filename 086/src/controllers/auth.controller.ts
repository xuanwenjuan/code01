import { Request, Response, NextFunction } from 'express';
import authService from '../services/auth.service';
import { ResponseUtil } from '../utils/response';

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body);
      ResponseUtil.success(res, result, '登录成功');
    } catch (error) {
      next(error);
    }
  }

  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body);
      ResponseUtil.created(res, result, '注册成功');
    } catch (error) {
      next(error);
    }
  }

  static async getCurrentUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const result = await authService.getCurrentUser(userId);
      ResponseUtil.success(res, result, '获取用户信息成功');
    } catch (error) {
      next(error);
    }
  }
}

export default AuthController;
