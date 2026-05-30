import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models';
import { ResponseUtil } from '../utils/response';
import { JwtUtil } from '../utils/jwt';
import { BadRequestException, UnauthorizedException, NotFoundException } from '../exceptions/HttpException';
import { loginSchema, registerSchema } from '../validations/auth.validation';
import { UserRole } from '../types';

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { error, value } = loginSchema.validate(req.body);
      if (error) {
        throw new BadRequestException(error.message);
      }

      const { username, password } = value;
      const user = await User.findOne({ where: { username } });
      
      if (!user) {
        throw new UnauthorizedException('用户名或密码错误');
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        throw new UnauthorizedException('用户名或密码错误');
      }

      if (!user.status) {
        throw new UnauthorizedException('账号已被禁用');
      }

      const token = JwtUtil.generateToken({
        userId: user.id,
        username: user.username,
        role: user.role
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
          avatar: user.avatar
        }
      }, '登录成功'));
    } catch (error) {
      next(error);
    }
  }

  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { error, value } = registerSchema.validate(req.body);
      if (error) {
        throw new BadRequestException(error.message);
      }

      const { username, password, realName, phone, email } = value;
      
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
        email,
        role: UserRole.STUDENT,
        status: true
      });

      const token = JwtUtil.generateToken({
        userId: user.id,
        username: user.username,
        role: user.role
      });

      res.status(201).json(ResponseUtil.created({
        token,
        user: {
          id: user.id,
          username: user.username,
          realName: user.realName,
          phone: user.phone,
          email: user.email,
          role: user.role,
          avatar: user.avatar
        }
      }, '注册成功'));
    } catch (error) {
      next(error);
    }
  }

  static async getCurrentUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const user = await User.findByPk(userId, {
        attributes: ['id', 'username', 'realName', 'phone', 'email', 'role', 'avatar', 'status']
      });

      if (!user) {
        throw new NotFoundException('用户不存在');
      }

      res.json(ResponseUtil.success(user));
    } catch (error) {
      next(error);
    }
  }
}
