import { Request, Response, NextFunction } from 'express';
import { body, query } from 'express-validator';
import userService from '../services/user.service';
import { ResponseUtil } from '../utils/response';
import { validate } from '../middlewares/validation.middleware';
import { AuthRequest } from '../middlewares/auth.middleware';
import { UserRole } from '../constants/role.constants';

export const createUserValidation = [
  body('username').notEmpty().withMessage('用户名不能为空').isLength({ min: 3, max: 50 }).withMessage('用户名长度必须在3-50个字符之间'),
  body('password').isLength({ min: 6, max: 50 }).withMessage('密码长度必须在6-50个字符之间'),
  body('realName').notEmpty().withMessage('真实姓名不能为空').isLength({ max: 50 }).withMessage('真实姓名不能超过50个字符'),
  body('phone').notEmpty().withMessage('手机号不能为空').isLength({ max: 20 }).withMessage('手机号不能超过20个字符'),
  body('role').isIn(Object.values(UserRole)).withMessage('无效的用户角色'),
  body('avatar').optional().isURL().withMessage('头像必须是有效的URL'),
];

export const updateUserValidation = [
  body('realName').optional().isLength({ max: 50 }).withMessage('真实姓名不能超过50个字符'),
  body('phone').optional().isLength({ max: 20 }).withMessage('手机号不能超过20个字符'),
  body('role').optional().isIn(Object.values(UserRole)).withMessage('无效的用户角色'),
  body('avatar').optional().isURL().withMessage('头像必须是有效的URL'),
  body('isActive').optional().isBoolean().withMessage('isActive必须是布尔值'),
  body('password').optional().isLength({ min: 6, max: 50 }).withMessage('密码长度必须在6-50个字符之间'),
];

export const create = [
  ...createUserValidation,
  validate,
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await userService.create(req.body);
      ResponseUtil.created(res, result, '创建成功');
    } catch (error) {
      next(error);
    }
  },
];

export const findAll = [
  query('page').optional().isInt({ min: 1 }).withMessage('页码必须是正整数'),
  query('pageSize').optional().isInt({ min: 1, max: 100 }).withMessage('每页数量必须在1-100之间'),
  query('role').optional().isIn(Object.values(UserRole)).withMessage('无效的用户角色'),
  query('isActive').optional().isBoolean().withMessage('isActive必须是布尔值'),
  query('keyword').optional().isLength({ max: 50 }).withMessage('关键词不能超过50个字符'),
  validate,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await userService.findAll(req.query);
      ResponseUtil.success(res, result, '获取成功');
    } catch (error) {
      next(error);
    }
  },
];

export const findOne = [
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const result = await userService.findOne(id);
      ResponseUtil.success(res, result, '获取成功');
    } catch (error) {
      next(error);
    }
  },
];

export const update = [
  ...updateUserValidation,
  validate,
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const result = await userService.update(id, req.body);
      ResponseUtil.success(res, result, '更新成功');
    } catch (error) {
      next(error);
    }
  },
];

export const remove = [
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      await userService.remove(id, req.user?.role);
      ResponseUtil.success(res, null, '删除成功');
    } catch (error) {
      next(error);
    }
  },
];

export const toggleActive = [
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const result = await userService.toggleActive(id, req.user!.role);
      ResponseUtil.success(res, result, result.isActive ? '账号已启用' : '账号已禁用');
    } catch (error) {
      next(error);
    }
  },
];
