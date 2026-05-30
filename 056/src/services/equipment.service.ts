import { Equipment, EquipmentCategory, Department } from '../models';
import { NotFoundError, ConflictError } from '../utils/errors';
import { EquipmentStatus } from '../types';
import { FindOptions, Op } from 'sequelize';
import CodeGenerator from '../utils/generator';
import sequelize from '../config/database';

export class EquipmentService {
  async create(data: {
    name: string;
    code?: string;
    categoryId: number;
    departmentId: number;
    specification?: string;
    model?: string;
    manufacturer?: string;
    purchaseDate?: Date;
    warrantyPeriod?: number;
    location?: string;
    description?: string;
  }) {
    const category = await EquipmentCategory.findByPk(data.categoryId);
    if (!category) {
      throw new NotFoundError('设备分类不存在');
    }

    const department = await Department.findByPk(data.departmentId);
    if (!department) {
      throw new NotFoundError('所属部门不存在');
    }

    const code = data.code || CodeGenerator.generateEquipmentCode();
    const exists = await Equipment.findOne({ where: { code } });
    if (exists) {
      throw new ConflictError('设备编码已存在');
    }

    return Equipment.create({
      ...data,
      code,
      status: EquipmentStatus.NORMAL,
    });
  }

  async update(id: number, data: {
    name?: string;
    code?: string;
    categoryId?: number;
    departmentId?: number;
    specification?: string;
    model?: string;
    manufacturer?: string;
    purchaseDate?: Date;
    warrantyPeriod?: number;
    location?: string;
    status?: EquipmentStatus;
    description?: string;
  }) {
    const equipment = await Equipment.findByPk(id);
    if (!equipment) {
      throw new NotFoundError('设备不存在');
    }

    if (data.categoryId) {
      const category = await EquipmentCategory.findByPk(data.categoryId);
      if (!category) {
        throw new NotFoundError('设备分类不存在');
      }
    }

    if (data.departmentId) {
      const department = await Department.findByPk(data.departmentId);
      if (!department) {
        throw new NotFoundError('所属部门不存在');
      }
    }

    if (data.code && data.code !== equipment.code) {
      const exists = await Equipment.findOne({ where: { code: data.code } });
      if (exists) {
        throw new ConflictError('设备编码已存在');
      }
    }

    return equipment.update(data);
  }

  async delete(id: number) {
    const equipment = await Equipment.findByPk(id);
    if (!equipment) {
      throw new NotFoundError('设备不存在');
    }
    return equipment.destroy();
  }

  async findById(id: number) {
    const equipment = await Equipment.findByPk(id, {
      include: [
        { model: EquipmentCategory, as: 'category' },
        { model: Department, as: 'department' },
      ],
    });
    if (!equipment) {
      throw new NotFoundError('设备不存在');
    }
    return equipment;
  }

  async findAll(params: {
    name?: string;
    code?: string;
    categoryId?: number;
    departmentId?: number;
    status?: EquipmentStatus;
    page?: number;
    pageSize?: number;
  }) {
    const { name, code, categoryId, departmentId, status, page = 1, pageSize = 10 } = params;
    const where: Record<string, unknown> = {};

    if (name) {
      where.name = { [Op.like]: `%${name}%` };
    }

    if (code) {
      where.code = { [Op.like]: `%${code}%` };
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (departmentId) {
      where.departmentId = departmentId;
    }

    if (status) {
      where.status = status;
    }

    const options: FindOptions = {
      where,
      include: [
        { model: EquipmentCategory, as: 'category' },
        { model: Department, as: 'department' },
      ],
      order: [['createdAt', 'DESC']],
    };

    if (page && pageSize) {
      options.offset = (page - 1) * pageSize;
      options.limit = pageSize;
    }

    const { count, rows } = await Equipment.findAndCountAll(options);
    return { list: rows, total: count, page, pageSize };
  }

  async updateStatus(id: number, status: EquipmentStatus) {
    const equipment = await Equipment.findByPk(id);
    if (!equipment) {
      throw new NotFoundError('设备不存在');
    }

    return equipment.update({ status });
  }

  async getStatistics() {
    const result = await Equipment.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      group: ['status'],
    });

    return result.map((item: any) => ({
      status: item.status,
      count: parseInt(item.getDataValue('count')),
    }));
  }
}

export default new EquipmentService();
