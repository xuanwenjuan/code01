import { Store, Admin } from '../models';
import { AppError } from '../middleware/errorHandler';
import { Op } from 'sequelize';

interface CreateStoreRequest {
  name: string;
  address: string;
  phone: string;
  managerId?: number;
}

interface UpdateStoreRequest extends Partial<CreateStoreRequest> {
  status?: number;
}

export class StoreService {
  static async create(data: CreateStoreRequest): Promise<Store> {
    const exists = await Store.findOne({
      where: { name: data.name }
    });
    if (exists) {
      throw new AppError('门店名称已存在', 400);
    }

    return await Store.create({
      ...data,
      status: 1
    });
  }

  static async update(id: number, data: UpdateStoreRequest): Promise<Store> {
    const store = await Store.findByPk(id);
    if (!store) {
      throw new AppError('门店不存在', 404);
    }

    if (data.name && data.name !== store.name) {
      const exists = await Store.findOne({
        where: { name: data.name }
      });
      if (exists) {
        throw new AppError('门店名称已存在', 400);
      }
    }

    await store.update(data);
    return store;
  }

  static async delete(id: number): Promise<void> {
    const store = await Store.findByPk(id);
    if (!store) {
      throw new AppError('门店不存在', 404);
    }

    await store.destroy();
  }

  static async getById(id: number): Promise<Store> {
    const store = await Store.findByPk(id, {
      include: [{ model: Admin, as: 'manager', attributes: ['id', 'realName', 'phone'] }]
    });
    if (!store) {
      throw new AppError('门店不存在', 404);
    }
    return store;
  }

  static async getList(params: {
    page?: number;
    pageSize?: number;
    name?: string;
    status?: number;
  }): Promise<{ list: Store[]; total: number }> {
    const { page = 1, pageSize = 10, name, status } = params;
    
    const where: any = {};
    if (name) {
      where.name = { [Op.like]: `%${name}%` };
    }
    if (status !== undefined) {
      where.status = status;
    }

    const { count, rows } = await Store.findAndCountAll({
      where,
      offset: (page - 1) * pageSize,
      limit: pageSize,
      order: [['id', 'DESC']],
      include: [{ model: Admin, as: 'manager', attributes: ['id', 'realName'] }]
    });

    return { list: rows, total: count };
  }

  static async getAll(): Promise<Store[]> {
    return await Store.findAll({
      where: { status: 1 },
      order: [['name', 'ASC']]
    });
  }
}
