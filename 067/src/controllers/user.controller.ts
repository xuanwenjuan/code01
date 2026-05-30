import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import userService from '../services/user.service';
import { ResponseUtil } from '../utils/response';
import { UserRole } from '../types';

export const validateRegister = [
  body('username').isString().notEmpty().withMessage('用户名不能为空'),
  body('password').isString().isLength({ min: 6 }).withMessage('密码长度至少6位'),
  body('phone').isString().isMobilePhone('zh-CN').withMessage('请输入有效的手机号'),
  body('realName').optional().isString(),
  body('role').optional().isIn(Object.values(UserRole)).withMessage('无效的用户角色'),
];

export const validateLogin = [
  body('username').isString().notEmpty().withMessage('用户名不能为空'),
  body('password').isString().notEmpty().withMessage('密码不能为空'),
];

export const register = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(ResponseUtil.error(errors.array()[0].msg, 400));
    }

    const user = await userService.register(req.body);
    res.json(ResponseUtil.success(user, '注册成功'));
  } catch (error: any) {
    res.status(error.statusCode || 500).json(ResponseUtil.error(error.message, error.statusCode || 500));
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(ResponseUtil.error(errors.array()[0].msg, 400));
    }

    const { username, password } = req.body;
    const user = await userService.login(username, password);

    const token = require('../utils/jwt').JwtUtil.sign({
      id: user.id,
      username: user.username,
      role: user.role,
    });

    res.json(ResponseUtil.success({ user, token }, '登录成功'));
  } catch (error: any) {
    res.status(error.statusCode || 500).json(ResponseUtil.error(error.message, error.statusCode || 500));
  }
};

export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json(ResponseUtil.error('未登录', 401));
    }

    const user = await userService.getUserById(req.user.id);
    res.json(ResponseUtil.success(user));
  } catch (error: any) {
    res.status(error.statusCode || 500).json(ResponseUtil.error(error.message, error.statusCode || 500));
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    const user = await userService.getUserById(Number(req.params.id));
    res.json(ResponseUtil.success(user));
  } catch (error: any) {
    res.status(error.statusCode || 500).json(ResponseUtil.error(error.message, error.statusCode || 500));
  }
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const { page, pageSize, role, keyword } = req.query;
    const result = await userService.getUsers({
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
      role: role as UserRole,
      keyword: keyword as string,
    });
    res.json(ResponseUtil.success(result));
  } catch (error: any) {
    res.status(error.statusCode || 500).json(ResponseUtil.error(error.message, error.statusCode || 500));
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const user = await userService.updateUser(Number(req.params.id), req.body);
    res.json(ResponseUtil.success(user, '更新成功'));
  } catch (error: any) {
    res.status(error.statusCode || 500).json(ResponseUtil.error(error.message, error.statusCode || 500));
  }
};

export const updateBalance = async (req: Request, res: Response) => {
  try {
    const { amount } = req.body;
    const result = await userService.updateBalance(Number(req.params.id), Number(amount));
    res.json(ResponseUtil.success(result, '余额更新成功'));
  } catch (error: any) {
    res.status(error.statusCode || 500).json(ResponseUtil.error(error.message, error.statusCode || 500));
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    await userService.deleteUser(Number(req.params.id));
    res.json(ResponseUtil.success(null, '删除成功'));
  } catch (error: any) {
    res.status(error.statusCode || 500).json(ResponseUtil.error(error.message, error.statusCode || 500));
  }
};
