import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User, { UserRole } from '../models/User';
import ResponseUtil from '../utils/response';
import { AuthRequest } from '../middlewares/auth.middleware';
import { BadRequestException, UnauthorizedException, NotFoundException } from '../exceptions/AppException';
import { body } from 'express-validator';

export const loginValidation = [
  body('username').notEmpty().withMessage('用户名不能为空'),
  body('password').notEmpty().withMessage('密码不能为空')
];

export const registerValidation = [
  body('username').isLength({ min: 3, max: 50 }).withMessage('用户名长度为3-50字符'),
  body('password').isLength({ min: 6 }).withMessage('密码至少6位'),
  body('realName').notEmpty().withMessage('真实姓名不能为空'),
  body('phone').notEmpty().withMessage('手机号不能为空'),
  body('role').isIn(Object.values(UserRole)).withMessage('无效的角色类型')
];

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ where: { username } });
    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    if (user.status !== 'active') {
      throw new UnauthorizedException('账号已被禁用');
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    await user.update({ lastLogin: new Date() });

    ResponseUtil.success(res, {
      token,
      user: {
        id: user.id,
        username: user.username,
        realName: user.realName,
        phone: user.phone,
        role: user.role
      }
    }, '登录成功');
  } catch (error) {
    next(error);
  }
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password, realName, phone, role } = req.body;

    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      throw new BadRequestException('用户名已存在');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      password: hashedPassword,
      realName,
      phone,
      role: role || UserRole.WORKER,
      status: 'active'
    });

    ResponseUtil.created(res, {
      id: user.id,
      username: user.username,
      realName: user.realName,
      phone: user.phone,
      role: user.role
    }, '注册成功');
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findByPk(req.user!.id);
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    ResponseUtil.success(res, {
      id: user.id,
      username: user.username,
      realName: user.realName,
      phone: user.phone,
      role: user.role,
      status: user.status,
      lastLogin: user.lastLogin
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findByPk(req.user!.id);
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    const isValidPassword = await bcrypt.compare(oldPassword, user.password);
    if (!isValidPassword) {
      throw new BadRequestException('原密码错误');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await user.update({ password: hashedPassword });

    ResponseUtil.success(res, null, '密码修改成功');
  } catch (error) {
    next(error);
  }
};