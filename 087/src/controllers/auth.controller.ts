import { Request, Response, NextFunction } from 'express';
import authService from '../services/auth.service';
import { ResponseUtil } from '../utils/response';

class AuthController {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { username, password } = req.body;
      const result = await authService.login(username, password);
      res.json(ResponseUtil.success(result, '登录成功'));
    } catch (error) {
      next(error);
    }
  }

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body);
      res.json(ResponseUtil.success(result, '注册成功'));
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId as number;
      const { oldPassword, newPassword } = req.body;
      await authService.changePassword(userId, oldPassword, newPassword);
      res.json(ResponseUtil.success(null, '密码修改成功'));
    } catch (error) {
      next(error);
    }
  }

  async getUserInfo(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId as number;
      const user = await authService.getUserInfo(userId);
      res.json(ResponseUtil.success(user));
    } catch (error) {
      next(error);
    }
  }

  async getUserList(req: Request, res: Response, next: NextFunction) {
    try {
      const params = {
        ...req.query,
        page: req.query.page ? Number(req.query.page) : undefined,
        pageSize: req.query.pageSize ? Number(req.query.pageSize) : undefined
      };
      const result = await authService.getUserList(params);
      res.json(ResponseUtil.success(result));
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await authService.updateUser(Number(id), req.body);
      res.json(ResponseUtil.success(result, '更新成功'));
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await authService.deleteUser(Number(id));
      res.json(ResponseUtil.success(null, '删除成功'));
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
