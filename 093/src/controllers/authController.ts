import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { ResponseUtil } from '../utils/response';
import { body, validationResult } from 'express-validator';

export const authController = {
  validateLogin: [
    body('username').notEmpty().withMessage('用户名不能为空'),
    body('password').notEmpty().withMessage('密码不能为空'),
  ],

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json(ResponseUtil.error('参数验证失败', 400));
        return;
      }

      const result = await AuthService.login(req.body);
      res.json(ResponseUtil.success(result, '登录成功'));
    } catch (error) {
      next(error);
    }
  },

  validateRegister: [
    body('username').notEmpty().withMessage('用户名不能为空'),
    body('password').isLength({ min: 6 }).withMessage('密码长度不能少于6位'),
    body('email').isEmail().withMessage('邮箱格式不正确'),
  ],

  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json(ResponseUtil.error('参数验证失败', 400));
        return;
      }

      const user = await AuthService.register(req.body);
      const { password, ...userInfo } = user.toJSON();
      res.status(201).json(ResponseUtil.success(userInfo, '注册成功'));
    } catch (error) {
      next(error);
    }
  },

  async getCurrentUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const user = await AuthService.getCurrentUser(userId);
      res.json(ResponseUtil.success(user, '获取成功'));
    } catch (error) {
      next(error);
    }
  },
};
