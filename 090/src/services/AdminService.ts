import bcrypt from 'bcryptjs';
import { Admin, Store } from '../models';
import { AppError } from '../middleware/errorHandler';
import { AdminRole } from '../types';
import { Op } from 'sequelize';

interface CreateAdminRequest {
  username: string;
  password: string;
  realName: string;
  phone: string;
  role: AdminRole;
  storeId?: number;
}

interface UpdateAdminRequest {
  realName?: string;
  phone?: string;
  role?: AdminRole;
  storeId?: number;
  status?: number;
  password?: string;
}

export class AdminService {
  static async create(data: CreateAdminRequest): Promise<Admin> {
    const exists = await Admin.findOne({
      where: { username: data.username }
    });
    if (exists) {
      throw new AppError('用户名已存在', 400);
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    return await Admin.create({
      ...data,
      password: hashedPassword,
      status: 1
    });
  }

  static async update(id: number, data: UpdateAdminRequest): Promise<Admin> {
    const admin = await Admin.findByPk(id);
    if (!admin) {
      throw new AppError('管理员不存在', 404);
    }

    const updateData: any = { ...data };
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    await admin.update(updateData);
    return admin;
  }

  static async delete(id: number): Promise<void> {
    const admin = await Admin.findByPk(id);
    if (!admin) {
      throw new AppError('管理员不存在', 404);
    }

    if (admin.role === AdminRole.SUPER_ADMIN) {
      throw new AppError('超级管理员无法删除', 400);
    }

    await admin.destroy();
  }

  static async getById(id: number): Promise<Admin> {
    const admin = await Admin.findByPk(id, {
      include: [{ model: Store, as: 'store' }],
      attributes: { exclude: ['password'] }
    });
    if (!admin) {
      throw new AppError('管理员不存在', 404);
    }
    return admin;
  }

  static async getList(params: {
    page?: number;
    pageSize?: number;
    username?: string;
    realName?: string;
    role?: AdminRole;
    storeId?: number;
    status?: number;
  }): Promise<{ list: Admin[]; total: number }> {
    const { page = 1, pageSize = 10, username, realName, role, storeId, status } = params;
    
    const where: any = {};
    if (username) {
      where.username = { [Op.like]: `%${username}%` };
    }
    if (realName) {
      where.realName = { [Op.like]: `%${realName}%` };
    }
    if (role) {
      where.role = role;
    }
    if (storeId) {
      where.storeId = storeId;
    }
    if (status !== undefined) {
      where.status = status;
    }

    const { count, rows } = await Admin.findAndCountAll({
      where,
      offset: (page - 1) * pageSize,
      limit: pageSize,
      order: [['id', 'DESC']],
      attributes: { exclude: ['password'] },
      include: [{ model: Store, as: 'store' }]
    });

    return { list: rows, total: count };
  }
}
