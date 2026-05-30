import { InspectionPlan, Equipment, User } from '../models';
import { NotFoundError, ConflictError } from '../utils/errors';
import { FindOptions, Op } from 'sequelize';
import CodeGenerator from '../utils/generator';

export class InspectionPlanService {
  async create(data: {
    name: string;
    code?: string;
    equipmentId: number;
    inspectorId?: number;
    frequencyType: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
    frequencyValue?: number;
    startDate: Date;
    endDate?: Date;
    inspectionItems: string;
    description?: string;
    createdBy: number;
  }) {
    const equipment = await Equipment.findByPk(data.equipmentId);
    if (!equipment) {
      throw new NotFoundError('设备不存在');
    }

    if (data.inspectorId) {
      const inspector = await User.findByPk(data.inspectorId);
      if (!inspector) {
        throw new NotFoundError('巡检员不存在');
      }
    }

    const code = data.code || CodeGenerator.generatePlanNo();
    const exists = await InspectionPlan.findOne({ where: { code } });
    if (exists) {
      throw new ConflictError('计划编码已存在');
    }

    return InspectionPlan.create({
      ...data,
      code,
      isActive: true,
    });
  }

  async update(id: number, data: {
    name?: string;
    code?: string;
    equipmentId?: number;
    inspectorId?: number;
    frequencyType?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
    frequencyValue?: number;
    startDate?: Date;
    endDate?: Date;
    inspectionItems?: string;
    description?: string;
    isActive?: boolean;
  }) {
    const plan = await InspectionPlan.findByPk(id);
    if (!plan) {
      throw new NotFoundError('巡检计划不存在');
    }

    if (data.equipmentId) {
      const equipment = await Equipment.findByPk(data.equipmentId);
      if (!equipment) {
        throw new NotFoundError('设备不存在');
      }
    }

    if (data.inspectorId) {
      const inspector = await User.findByPk(data.inspectorId);
      if (!inspector) {
        throw new NotFoundError('巡检员不存在');
      }
    }

    if (data.code && data.code !== plan.code) {
      const exists = await InspectionPlan.findOne({ where: { code: data.code } });
      if (exists) {
        throw new ConflictError('计划编码已存在');
      }
    }

    return plan.update(data);
  }

  async delete(id: number) {
    const plan = await InspectionPlan.findByPk(id);
    if (!plan) {
      throw new NotFoundError('巡检计划不存在');
    }
    return plan.destroy();
  }

  async findById(id: number) {
    const plan = await InspectionPlan.findByPk(id, {
      include: [
        { model: Equipment, as: 'equipment' },
        { model: User, as: 'inspector', attributes: ['id', 'username', 'realName'] },
        { model: User, as: 'creator', attributes: ['id', 'username', 'realName'] },
      ],
    });
    if (!plan) {
      throw new NotFoundError('巡检计划不存在');
    }
    return plan;
  }

  async findAll(params: {
    name?: string;
    code?: string;
    equipmentId?: number;
    inspectorId?: number;
    frequencyType?: string;
    isActive?: boolean;
    page?: number;
    pageSize?: number;
  }) {
    const { name, code, equipmentId, inspectorId, frequencyType, isActive, page = 1, pageSize = 10 } = params;
    const where: Record<string, unknown> = {};

    if (name) {
      where.name = { [Op.like]: `%${name}%` };
    }

    if (code) {
      where.code = { [Op.like]: `%${code}%` };
    }

    if (equipmentId) {
      where.equipmentId = equipmentId;
    }

    if (inspectorId) {
      where.inspectorId = inspectorId;
    }

    if (frequencyType) {
      where.frequencyType = frequencyType;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const options: FindOptions = {
      where,
      include: [
        { model: Equipment, as: 'equipment' },
        { model: User, as: 'inspector', attributes: ['id', 'username', 'realName'] },
      ],
      order: [['createdAt', 'DESC']],
    };

    if (page && pageSize) {
      options.offset = (page - 1) * pageSize;
      options.limit = pageSize;
    }

    const { count, rows } = await InspectionPlan.findAndCountAll(options);
    return { list: rows, total: count, page, pageSize };
  }

  async toggleActive(id: number) {
    const plan = await InspectionPlan.findByPk(id);
    if (!plan) {
      throw new NotFoundError('巡检计划不存在');
    }

    return plan.update({ isActive: !plan.isActive });
  }
}

export default new InspectionPlanService();
