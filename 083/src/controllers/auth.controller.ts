import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { ResponseUtil } from '../utils/response';
import { AuthRequest } from '../middlewares/auth';

export class AuthController {
  async register(req: Request, res: Response) {
    const user = await authService.register(req.body);
    return ResponseUtil.success(res, user);
  }

  async login(req: Request, res: Response) {
    const { username, password } = req.body;
    const result = await authService.login(username, password);
    return ResponseUtil.success(res, result);
  }

  async getCurrentUser(req: AuthRequest, res: Response) {
    const user = await authService.getUserById(req.user?.id!);
    return ResponseUtil.success(res, user);
  }
}

export const authController = new AuthController();
