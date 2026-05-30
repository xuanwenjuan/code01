import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';
import { ResponseUtil } from '../utils/response';

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username, password } = req.body;
      const result = await AuthService.login({ username, password });
      res.json(ResponseUtil.success(result, '登录成功'));
    } catch (error) {
      next(error);
    }
  }

  static async getCurrentUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.json(ResponseUtil.success(req.user, '获取用户信息成功'));
    } catch (error) {
      next(error);
    }
  }
}
