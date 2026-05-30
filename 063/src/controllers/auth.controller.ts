import { Request, Response } from 'express';
import { ResponseUtil } from '../utils/response';
import authService from '../services/auth.service';

class AuthController {
  async login(req: Request, res: Response) {
    const result = await authService.login(req.body);
    return ResponseUtil.success(res, result, '登录成功');
  }
}

export default new AuthController();