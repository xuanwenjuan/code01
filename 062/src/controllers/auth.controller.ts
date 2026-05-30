import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User, UserRole } from '../models/User';
import { AuthRequest } from '../middleware/auth.middleware';
import { ResponseUtil } from '../utils/response';
import { BadRequestException, UnauthorizedException, NotFoundException } from '../exceptions/HttpException';
import { OperationLogger } from '../utils/logger';
import sequelize from '../config/database';
import { OperationType } from '../models/OperationLog';

export class AuthController {
  static async login(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        throw new BadRequestException('用户名和密码不能为空');
      }

      const user = await User.findOne({ where: { username } });
      if (!user) {
        throw new UnauthorizedException('用户名或密码错误');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('用户名或密码错误');
      }

      if (!user.isActive) {
        throw new UnauthorizedException('用户已被禁用');
      }

      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        process.env.JWT_SECRET || 'hotel-secret-key-2024',
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' } as jwt.SignOptions
      );

      await OperationLogger.log('用户管理', OperationType.CREATE, `用户 ${user.realName} 登录系统`, req);

      return ResponseUtil.success(res, {
        token,
        user: {
          id: user.id,
          username: user.username,
          realName: user.realName,
          role: user.role,
          phone: user.phone
        }
      }, '登录成功');
    } catch (error) {
      next(error);
    }
  }

  static async getCurrentUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      return ResponseUtil.success(res, req.user);
    } catch (error) {
      next(error);
    }
  }

  static async initAdmin() {
    try {
      const adminExists = await User.findOne({ where: { role: UserRole.ADMIN } });
      if (adminExists) {
        return;
      }

      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        username: 'admin',
        password: hashedPassword,
        realName: '系统管理员',
        role: UserRole.ADMIN,
        phone: '13800138000',
        isActive: true
      } as any);

      console.log('管理员账号初始化成功: admin / admin123');
    } catch (error) {
      console.error('初始化管理员账号失败:', error);
    }
  }
}
