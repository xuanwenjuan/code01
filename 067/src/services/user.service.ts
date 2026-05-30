import { User } from '../models';
import { UserRole } from '../types';
import { PasswordUtil } from '../utils/password';
import { AppError } from '../middleware/error.middleware';
import { Transaction } from 'sequelize';
import sequelize from '../config/database';

export class UserService {
  async register(data: {
    username: string;
    password: string;
    phone: string;
    realName?: string;
    role?: UserRole;
  }) {
    const t: Transaction = await sequelize.transaction();

    try {
      const exists = await User.findOne({
        where: {
          $or: [{ username: data.username }, { phone: data.phone }],
        },
        transaction: t,
      });

      if (exists) {
        throw new AppError('用户名或手机号已存在', 400);
      }

      const hashedPassword = await PasswordUtil.hash(data.password);

      const user = await User.create(
        {
          username: data.username,
          password: hashedPassword,
          phone: data.phone,
          realName: data.realName,
          role: data.role || UserRole.USER,
          isActive: true,
          balance: 0,
        },
        { transaction: t }
      );

      await t.commit();

      const userData = user.toJSON();
      delete (userData as any).password;

      return userData;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async login(username: string, password: string) {
    const user = await User.findOne({
      where: { username },
    });

    if (!user) {
      throw new AppError('用户名或密码错误', 401);
    }

    if (!user.isActive) {
      throw new AppError('账户已被禁用', 403);
    }

    const isValid = await PasswordUtil.compare(password, user.password);

    if (!isValid) {
      throw new AppError('用户名或密码错误', 401);
    }

    const userData = user.toJSON();
    delete (userData as any).password;

    return userData;
  }

  async getUserById(id: number) {
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      throw new AppError('用户不存在', 404);
    }

    return user;
  }

  async getUsers(params: {
    page?: number;
    pageSize?: number;
    role?: UserRole;
    keyword?: string;
  }) {
    const { page = 1, pageSize = 10, role, keyword } = params;
    const offset = (page - 1) * pageSize;

    const where: any = {};

    if (role) {
      where.role = role;
    }

    if (keyword) {
      where.$or = [
        { username: { $like: `%${keyword}%` } },
        { phone: { $like: `%${keyword}%` } },
        { realName: { $like: `%${keyword}%` } },
      ];
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      offset,
      limit: pageSize,
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
    });

    return {
      list: rows,
      total: count,
      page,
      pageSize,
    };
  }

  async updateUser(
    id: number,
    data: {
      phone?: string;
      realName?: string;
      role?: UserRole;
      isActive?: boolean;
    }
  ) {
    const t: Transaction = await sequelize.transaction();

    try {
      const user = await User.findByPk(id, { transaction: t });

      if (!user) {
        throw new AppError('用户不存在', 404);
      }

      if (data.phone && data.phone !== user.phone) {
        const exists = await User.findOne({
          where: { phone: data.phone },
          transaction: t,
        });

        if (exists) {
          throw new AppError('手机号已被使用', 400);
        }
      }

      await user.update(data, { transaction: t });
      await t.commit();

      const userData = user.toJSON();
      delete (userData as any).password;

      return userData;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async updateBalance(id: number, amount: number) {
    const t: Transaction = await sequelize.transaction();

    try {
      const user = await User.findByPk(id, { transaction: t });

      if (!user) {
        throw new AppError('用户不存在', 404);
      }

      const newBalance = Number(user.balance) + amount;

      if (newBalance < 0) {
        throw new AppError('余额不足', 400);
      }

      await user.update({ balance: newBalance }, { transaction: t });
      await t.commit();

      return { balance: newBalance };
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async deleteUser(id: number) {
    const user = await User.findByPk(id);

    if (!user) {
      throw new AppError('用户不存在', 404);
    }

    await user.destroy();

    return null;
  }
}

export default new UserService();
