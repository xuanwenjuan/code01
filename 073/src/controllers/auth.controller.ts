import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models';
import { ResponseUtil } from '../utils/response';
import { BadRequestException, UnauthorizedException, NotFoundException } from '../exceptions/HttpException';
import { UserRole } from '../types';

export class AuthController {
  static async register(req: Request, res: Response) {
    const { username, password, realName, email, phone, department, role } = req.body;

    const existing = await User.findOne({ where: { username } });
    if (existing) {
      throw new BadRequestException('用户名已存在');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      password: hashedPassword,
      realName,
      email,
      phone,
      department,
      role: role || UserRole.RESEARCHER,
      quota: 0,
      usedQuota: 0,
      status: true,
      lastLoginAt: new Date()
    });

    const token = AuthController.generateToken(user);

    return ResponseUtil.success(res, {
      token,
      user: {
        id: user.id,
        username: user.username,
        realName: user.realName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        department: user.department
      }
    }, '注册成功');
  }

  static async login(req: Request, res: Response) {
    const { username, password } = req.body;

    const user = await User.findOne({ where: { username } });
    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    if (!user.status) {
      throw new UnauthorizedException('账户已被禁用');
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    await user.update({ lastLoginAt: new Date() });

    const token = AuthController.generateToken(user);

    return ResponseUtil.success(res, {
      token,
      user: {
        id: user.id,
        username: user.username,
        realName: user.realName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        department: user.department,
        quota: user.quota,
        usedQuota: user.usedQuota
      }
    }, '登录成功');
  }

  static async getProfile(req: Request, res: Response) {
    const user = await User.findByPk(req.user?.userId);
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    return ResponseUtil.success(res, {
      id: user.id,
      username: user.username,
      realName: user.realName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      department: user.department,
      quota: user.quota,
      usedQuota: user.usedQuota,
      lastLoginAt: user.lastLoginAt
    }, '查询成功');
  }

  static async changePassword(req: Request, res: Response) {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findByPk(req.user?.userId);
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    const isValid = await bcrypt.compare(oldPassword, user.password);
    if (!isValid) {
      throw new BadRequestException('原密码错误');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await user.update({ password: hashedPassword });

    return ResponseUtil.success(res, null, '密码修改成功');
  }

  private static generateToken(user: User): string {
    return jwt.sign(
      {
        userId: user.id,
        username: user.username,
        role: user.role
      },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
  }
}
