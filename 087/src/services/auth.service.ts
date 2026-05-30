import { User } from '../models';
import { UnauthorizedException, BadRequestException, NotFoundException, ConflictException } from '../exceptions/http.exception';
import { generateToken } from '../config/jwt';
import { UserRole } from '../types';
import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';

class AuthService {
  async login(username: string, password: string) {
    const user = await User.findOne({ where: { username } });
    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('账号已被禁用');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    const token = generateToken({
      userId: user.id,
      username: user.username,
      role: user.role as UserRole
    });

    await user.update({ lastLoginAt: new Date() });

    return {
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
    };
  }

  async register(data: {
    username: string;
    password: string;
    realName: string;
    phone: string;
    email?: string;
    role?: UserRole;
  }) {
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          { username: data.username },
          { phone: data.phone }
        ]
      }
    });

    if (existingUser) {
      throw new ConflictException('用户名或手机号已存在');
    }

    const user = await User.create({
      ...data,
      isActive: true,
      role: data.role || UserRole.INSPECTION
    });

    return {
      id: user.id,
      username: user.username,
      realName: user.realName,
      phone: user.phone,
      email: user.email,
      role: user.role
    };
  }

  async changePassword(userId: number, oldPassword: string, newPassword: string) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('原密码错误');
    }

    await user.update({ password: newPassword });

    return true;
  }

  async getUserInfo(userId: number) {
    const user = await User.findByPk(userId, {
      attributes: ['id', 'username', 'realName', 'phone', 'email', 'role', 'avatar', 'isActive', 'lastLoginAt', 'createdAt']
    });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    return user;
  }

  async getUserList(params: {
    keyword?: string;
    role?: UserRole;
    page?: number;
    pageSize?: number;
  }) {
    const { keyword, role, page = 1, pageSize = 10 } = params;
    const where: any = {};

    if (keyword) {
      where[Op.or] = [
        { username: { [Op.like]: `%${keyword}%` } },
        { realName: { [Op.like]: `%${keyword}%` } },
        { phone: { [Op.like]: `%${keyword}%` } }
      ];
    }
    if (role) {
      where.role = role;
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: ['id', 'username', 'realName', 'phone', 'email', 'role', 'avatar', 'isActive', 'lastLoginAt', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit: pageSize,
      offset: (page - 1) * pageSize
    });

    return {
      list: rows,
      total: count,
      page,
      pageSize
    };
  }

  async updateUser(id: number, data: {
    realName?: string;
    phone?: string;
    email?: string;
    role?: UserRole;
    avatar?: string;
    isActive?: boolean;
  }) {
    const user = await User.findByPk(id);
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    if (data.phone && data.phone !== user.phone) {
      const existingUser = await User.findOne({
        where: { phone: data.phone, id: { [Op.ne]: id } }
      });
      if (existingUser) {
        throw new ConflictException('手机号已存在');
      }
    }

    await user.update(data);

    return {
      id: user.id,
      username: user.username,
      realName: user.realName,
      phone: user.phone,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      isActive: user.isActive
    };
  }

  async deleteUser(id: number) {
    const user = await User.findByPk(id);
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    await user.destroy();
    return true;
  }
}

export default new AuthService();
