import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { ResponseUtil } from '../utils/response';
import { AuthRequest } from '../middlewares/auth';

export const authController = {
  async login(req: Request, res: Response) {
    const result = await authService.login(req.body);
    res.json(ResponseUtil.success(result, '登录成功'));
  },

  async register(req: AuthRequest, res: Response) {
    const result = await authService.register(req.body);
    res.json(ResponseUtil.success(result, '注册成功'));
  },

  async getProfile(req: AuthRequest, res: Response) {
    const user = await authService.getUserById(req.user!.id);
    res.json(ResponseUtil.success(user));
  },

  async getUsers(req: AuthRequest, res: Response) {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const role = req.query.role as any;
    
    const result = await authService.getUsers(page, pageSize, role);
    res.json(ResponseUtil.success(result));
  },

  async getUser(req: AuthRequest, res: Response) {
    const id = parseInt(req.params.id);
    const user = await authService.getUserById(id);
    res.json(ResponseUtil.success(user));
  },

  async updateUser(req: AuthRequest, res: Response) {
    const id = parseInt(req.params.id);
    const user = await authService.updateUser(id, req.body);
    res.json(ResponseUtil.success(user, '更新成功'));
  },

  async deleteUser(req: AuthRequest, res: Response) {
    const id = parseInt(req.params.id);
    await authService.deleteUser(id);
    res.json(ResponseUtil.success(null, '删除成功'));
  }
};
