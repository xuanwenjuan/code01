import { Response, NextFunction } from 'express';
import authService from '../services/authService';
import { ResponseUtil } from '../utils/response';
import { AuthRequest } from '../middleware/auth';

class AuthController {
  async register(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await authService.register(req.body);
      const userData = user.toJSON();
      delete (userData as any).password;
      ResponseUtil.success(res, userData, '注册成功');
    } catch (error) {
      next(error);
    }
  }

  async login(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { username, password } = req.body;
      const result = await authService.login(username, password);
      ResponseUtil.success(res, result, '登录成功');
    } catch (error) {
      next(error);
    }
  }

  async getCurrentUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return ResponseUtil.unauthorized(res);
      }
      const user = await authService.getUserById(req.user.id);
      ResponseUtil.success(res, user);
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return ResponseUtil.unauthorized(res);
      }
      const { oldPassword, newPassword } = req.body;
      await authService.changePassword(req.user.id, oldPassword, newPassword);
      ResponseUtil.success(res, null, '密码修改成功');
    } catch (error) {
      next(error);
    }
  }

  async initSystem(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await authService.initDefaultRoles();
      await authService.initAdminUser();
      ResponseUtil.success(res, null, '系统初始化成功');
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
