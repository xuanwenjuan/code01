import { User, Department } from '../models';
import { NotFoundError, ConflictError, BadRequestError } from '../utils/errors';
import { UserRole } from '../types';
import { FindOptions, Op } from 'sequelize';
import PasswordUtil from '../utils/password';

export class UserService {
  async create(data: {
    username: string;
    password: string;
    realName: string;
    phone?: string;
    email?: string;
    role: UserRole;
    departmentId?: number;
  }) {
    const exists = await User.findOne({ where: { username: data.username } });
    if (exists) {
      throw new ConflictError('用户名已存在');
    }

    if (data.departmentId) {
      const department = await Department.findByPk(data.departmentId);
      if (!department) {
        throw new NotFoundError('部门不存在');
      }
    }

    const hashedPassword = await PasswordUtil.hash(data.password);

    const user = await User.create({
      ...data,
      password: hashedPassword,
      isActive: true,
    });

    const { password, ...userWithoutPassword } = user.toJSON();
    return userWithoutPassword;
  }

  async update(id: number, data: {
    realName?: string;
    phone?: string;
    email?: string;
    role?: UserRole;
    departmentId?: number;
    isActive?: boolean;
  }) {
    const user = await User.findByPk(id);
    if (!user) {
      throw new NotFoundError('用户不存在');
    }

    if (data.departmentId) {
      const department = await Department.findByPk(data.departmentId);
      if (!department) {
        throw new NotFoundError('部门不存在');
      }
    }

    await user.update(data);
    const { password, ...userWithoutPassword } = user.toJSON();
    return userWithoutPassword;
  }

  async delete(id: number) {
    const user = await User.findByPk(id);
    if (!user) {
      throw new NotFoundError('用户不存在');
    }
    return user.destroy();
  }

  async findById(id: number) {
    const user = await User.findByPk(id, {
      include: [{ model: Department, as: 'department' }],
    });
    if (!user) {
      throw new NotFoundError('用户不存在');
    }
    const { password, ...userWithoutPassword } = user.toJSON();
    return userWithoutPassword;
  }

  async findAll(params: {
    username?: string;
    realName?: string;
    role?: UserRole;
    departmentId?: number;
    isActive?: boolean;
    page?: number;
    pageSize?: number;
  }) {
    const { username, realName, role, departmentId, isActive, page = 1, pageSize = 10 } = params;
    const where: Record<string, unknown> = {};

    if (username) {
      where.username = { [Op.like]: `%${username}%` };
    }

    if (realName) {
      where.realName = { [Op.like]: `%${realName}%` };
    }

    if (role) {
      where.role = role;
    }

    if (departmentId) {
      where.departmentId = departmentId;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const options: FindOptions = {
      where,
      include: [{ model: Department, as: 'department' }],
      order: [['createdAt', 'DESC']],
      attributes: { exclude: ['password'] },
    };

    if (page && pageSize) {
      options.offset = (page - 1) * pageSize;
      options.limit = pageSize;
    }

    const { count, rows } = await User.findAndCountAll(options);
    return { list: rows, total: count, page, pageSize };
  }

  async resetPassword(id: number, newPassword: string) {
    const user = await User.findByPk(id);
    if (!user) {
      throw new NotFoundError('用户不存在');
    }

    const hashedPassword = await PasswordUtil.hash(newPassword);
    await user.update({ password: hashedPassword });

    return true;
  }
}

export default new UserService();
