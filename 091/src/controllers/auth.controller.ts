import { Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import authService from '../services/auth.service';
import { ResponseUtil } from '../utils/response';
import { validate } from '../middlewares/validation.middleware';
import { AuthRequest } from '../middlewares/auth.middleware';
import { UserRole } from '../constants/role.constants';

export const loginValidation = [
  body('username').notEmpty().withMessage('用户名不能为空'),
  body('password').notEmpty().withMessage('密码不能为空'),
];

export const registerValidation = [
  body('username').notEmpty().withMessage('用户名不能为空'),
  body('password').isLength({ min: 6 }).withMessage('密码长度不能少于6位'),
  body('realName').notEmpty().withMessage('真实姓名不能为空'),
  body('phone').notEmpty().withMessage('手机号不能为空'),
  body('role').isIn(Object.values(UserRole)).withMessage('无效的角色'),
];

export const login = [
  ...loginValidation,
  validate,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await authService.login(req.body);
      ResponseUtil.success(res, result, '登录成功');
    } catch (error) {
      next(error);
    }
  },
];

export const register = [
  ...registerValidation,
  validate,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await authService.register(req.body);
      ResponseUtil.created(res, result, '注册成功');
    } catch (error) {
      next(error);
    }
  },
];

export const getCurrentUser = [
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      ResponseUtil.success(res, req.user, '获取成功');
    } catch (error) {
      next(error);
    }
  },
];
