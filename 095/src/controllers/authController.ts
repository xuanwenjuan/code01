import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User';
import { successResponse } from '../utils/response';
import { AppError } from '../middleware/errorHandler';
import logger from '../config/logger';

export const loginValidation = [
  body('username').notEmpty().withMessage('用户名不能为空'),
  body('password').notEmpty().withMessage('密码不能为空'),
];

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError(errors.array()[0].msg, 400));
    }

    const { username, password } = req.body;

    const user = await User.findOne({ where: { username } });
    if (!user) {
      return next(new AppError('用户名或密码错误', 401));
    }

    if (!user.isActive) {
      return next(new AppError('账户已被禁用', 403));
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return next(new AppError('用户名或密码错误', 401));
    }

    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    logger.info(`用户 ${username} 登录成功`);

    res.json(
      successResponse(
        {
          token,
          user: {
            id: user.id,
            username: user.username,
            realName: user.realName,
            role: user.role,
            phone: user.phone,
            email: user.email,
          },
        },
        '登录成功'
      )
    );
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findByPk(req.user!.userId, {
      attributes: ['id', 'username', 'realName', 'role', 'phone', 'email'],
    });

    if (!user) {
      return next(new AppError('用户不存在', 404));
    }

    res.json(successResponse(user));
  } catch (error) {
    next(error);
  }
};