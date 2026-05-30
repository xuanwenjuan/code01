import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models';
import { ResponseUtil } from '../utils/response';
import { UnauthorizedException, BadRequestException, NotFoundException } from '../exceptions/HttpException';
import Joi from 'joi';
import bcrypt from 'bcryptjs';

const loginSchema = Joi.object({
  username: Joi.string().required().trim().messages({
    'string.empty': '用户名不能为空',
    'any.required': '用户名是必填项'
  }),
  password: Joi.string().required().messages({
    'string.empty': '密码不能为空',
    'any.required': '密码是必填项'
  })
});

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      throw new BadRequestException(error.details[0].message);
    }

    const { username, password } = value;

    const user = await User.findOne({
      where: { username },
      include: [{ association: 'area' }]
    });

    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('账号已被禁用，请联系管理员');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        role: user.role,
        areaId: user.areaId
      },
      process.env.JWT_SECRET || 'garden-secret-2024',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    await user.update({ lastLoginAt: new Date() });

    const userData = user.toJSON();
    delete (userData as any).password;

    ResponseUtil.success(res, {
      token,
      user: userData
    }, '登录成功');
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new UnauthorizedException('未登录，请先登录');
    }

    const user = await User.findByPk(req.user.userId, {
      include: [{ association: 'area' }]
    });

    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('账号已被禁用');
    }

    const userData = user.toJSON();
    delete (userData as any).password;

    ResponseUtil.success(res, userData);
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new UnauthorizedException('未登录');
    }

    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      throw new BadRequestException('旧密码和新密码都是必填项');
    }

    if (newPassword.length < 6) {
      throw new BadRequestException('新密码长度不能少于6位');
    }

    const user = await User.findByPk(req.user.userId);
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('旧密码错误');
    }

    await user.update({ password: newPassword });

    ResponseUtil.success(res, null, '密码修改成功');
  } catch (error) {
    next(error);
  }
};
