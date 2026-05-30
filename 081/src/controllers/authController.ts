import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body } from 'express-validator';
import { User } from '../models';
import { jwtConfig } from '../config/jwt';
import { ResponseUtil } from '../utils/response';
import { BadRequestException, UnauthorizedException } from '../exceptions/HttpException';

export const loginValidation = [
  body('username').notEmpty().withMessage('用户名不能为空'),
  body('password').notEmpty().withMessage('密码不能为空')
];

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({
      where: { username },
      include: [{ association: 'store', attributes: ['id', 'storeName'] }]
    });

    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    if (!user.isActive) {
      throw new BadRequestException('账号已被禁用，请联系管理员');
    }

    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        role: user.role,
        storeId: user.storeId
      },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn }
    );

    ResponseUtil.success(res, {
      token,
      user: {
        id: user.id,
        username: user.username,
        realName: user.realName,
        role: user.role,
        storeId: user.storeId,
        store: user.store,
        phone: user.phone,
        email: user.email
      }
    }, '登录成功');
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findByPk(req.user!.userId, {
      include: [{ association: 'store', attributes: ['id', 'storeName'] }],
      attributes: ['id', 'username', 'realName', 'role', 'storeId', 'phone', 'email', 'isActive']
    });

    ResponseUtil.success(res, user);
  } catch (error) {
    next(error);
  }
};
