import { Request, Response } from 'express';
import AuthService from '../services/AuthService';
import { ResponseUtil } from '../utils/response';
import { AuthRequest } from '../middlewares/auth';

class AuthController {
  async login(req: Request, res: Response) {
    const { username, password } = req.body;
    const ip = req.ip || req.socket.remoteAddress;
    const result = await AuthService.login(username, password, ip);
    return ResponseUtil.success(res, result, '登录成功');
  }

  async register(req: Request, res: Response) {
    const user = await AuthService.createUser(req.body);
    return ResponseUtil.created(res, { id: user.id, username: user.username }, '注册成功');
  }

  async getUserInfo(req: AuthRequest, res: Response) {
    const user = await AuthService.getUserInfo(req.user!.id);
    return ResponseUtil.success(res, user);
  }
}

export default new AuthController();