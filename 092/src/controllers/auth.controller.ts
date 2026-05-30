import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/user.model';
import { generateToken } from '../utils/jwt';
import { ResponseUtil } from '../utils/response.util';
import { BadRequestException, UnauthorizedException } from '../common/http-exception';
import { UserRole } from '../common/enums';

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ where: { username } });
    if (!user) {
      return next(new BadRequestException('用户名或密码错误'));
    }

    if (!user.status) {
      return next(new BadRequestException('账户已被禁用'));
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return next(new BadRequestException('用户名或密码错误'));
    }

    const token = generateToken({
      userId: user.id,
      username: user.username,
      role: user.role,
    });

    await user.update({
      lastLoginTime: new Date(),
      lastLoginIp: req.ip,
    });

    res.json(ResponseUtil.success({
      token,
      user: {
        id: user.id,
        username: user.username,
        realName: user.realName,
        phone: user.phone,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    }, '登录成功'));
  } catch (error) {
    next(error);
  }
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password, realName, phone, email, role } = req.body;

    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return next(new BadRequestException('用户名已存在'));
    }

    const existingPhone = await User.findOne({ where: { phone } });
    if (existingPhone) {
      return next(new BadRequestException('手机号已存在'));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      password: hashedPassword,
      realName,
      phone,
      email,
      role: role || UserRole.BUSINESS,
      status: true,
    });

    res.json(ResponseUtil.success({
      id: user.id,
      username: user.username,
      realName: user.realName,
      phone: user.phone,
      role: user.role,
    }, '注册成功'));
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(new UnauthorizedException('未授权'));
    }

    const user = await User.findByPk(req.user.userId, {
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      return next(new UnauthorizedException('用户不存在'));
    }

    res.json(ResponseUtil.success(user));
  } catch (error) {
    next(error);
  }
};