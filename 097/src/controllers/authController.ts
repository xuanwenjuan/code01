import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import { comparePassword, generateToken } from '../utils/jwt';
import { ResponseUtil } from '../utils/response';
import { AuthRequest } from '../middleware/auth';
import { hashPassword } from '../utils/jwt';
import { BadRequestException, UnauthorizedException } from '../exceptions/HttpException';
import Joi from 'joi';

export const loginSchema = Joi.object({
  username: Joi.string().required().messages({
    'any.required': '用户名不能为空'
  }),
  password: Joi.string().required().messages({
    'any.required': '密码不能为空'
  })
});

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ where: { username } });
    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('账号已被禁用');
    }

    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    const token = generateToken({
      id: user.id,
      username: user.username,
      role: user.role
    });

    res.json(ResponseUtil.success({
      token,
      user: {
        id: user.id,
        username: user.username,
        realName: user.realName,
        role: user.role,
        phone: user.phone
      }
    }, '登录成功'));
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findByPk(req.user!.id, {
      attributes: ['id', 'username', 'realName', 'role', 'phone', 'isActive', 'createdAt']
    });

    res.json(ResponseUtil.success(user));
  } catch (error) {
    next(error);
  }
};

export const changePasswordSchema = Joi.object({
  oldPassword: Joi.string().required().messages({
    'any.required': '旧密码不能为空'
  }),
  newPassword: Joi.string().min(6).required().messages({
    'any.required': '新密码不能为空',
    'string.min': '新密码长度不能少于6位'
  })
});

export const changePassword = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findByPk(req.user!.id);

    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    const isValidPassword = await comparePassword(oldPassword, user.password);
    if (!isValidPassword) {
      throw new BadRequestException('旧密码错误');
    }

    user.password = await hashPassword(newPassword);
    await user.save();

    res.json(ResponseUtil.success(null, '密码修改成功'));
  } catch (error) {
    next(error);
  }
};
