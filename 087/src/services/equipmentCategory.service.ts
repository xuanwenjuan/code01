import { EquipmentCategory, InspectionWorkOrder } from '../models';
import { CategoryStatus, WorkOrderStatus, OperationModule } from '../types';
import { NotFoundException, ConflictException, BadRequestException } from '../exceptions/http.exception';
import { Op } from 'sequelize';
import operationLogService from './operationLog.service';
import { Request } from 'express';

class EquipmentCategoryService {
  async checkCategoryUsable(categoryId: number): Promise<boolean> {
    const category = await EquipmentCategory.findByPk(categoryId);
    if (!category) {
      throw new NotFoundException('设备类目不存在');
    }
    if (category.status === CategoryStatus.DISCONTINUED) {
      throw new BadRequestException(`设备类目【${category.name}】已停产，无法进行绑定操作`);
    }
    return true;
  }

  async createCategory(data: {
    name: string;
    code: string;
    parentId?: number;
    sortOrder?: number;
    description?: string;
    createdBy?: number;
  }, req?: Request) {
    const existingCategory = await EquipmentCategory.findOne({
      where: { code: data.code }
    });
    if (existingCategory) {
      throw new ConflictException('类目编码已存在');
    }

    let level = 1;
    if (data.parentId) {
      const parent = await EquipmentCategory.findByPk(data.parentId);
      if (!parent) {
        throw new NotFoundException('父级类目不存在');
      }
      if (parent.status === CategoryStatus.DISCONTINUED) {
        throw new BadRequestException(`父级类目【${parent.name}】已停产，无法创建子类目`);
      }
      level = parent.level + 1;
    }

    const category = await EquipmentCategory.create({
      ...data,
      level,
      status: CategoryStatus.ACTIVE,
      sortOrder: data.sortOrder || 0
    });

    if (req) {
      await operationLogService.logCreate(OperationModule.CATEGORY, category.id, category, req);
    }

    return category;
  }

  async updateCategory(id: number, data: {
    name?: string;
    code?: string;
    parentId?: number;
    sortOrder?: number;
    description?: string;
    status?: CategoryStatus;
  }, req?: Request) {
    const category = await EquipmentCategory.findByPk(id);
    if (!category) {
      throw new NotFoundException('类目不存在');
    }

    const beforeData = category.toJSON();

    if (data.code && data.code !== category.code) {
      const existingCategory = await EquipmentCategory.findOne({
        where: { code: data.code, id: { [Op.ne]: id } }
      });
      if (existingCategory) {
        throw new ConflictException('类目编码已存在');
      }
    }

    if (data.parentId !== undefined) {
      if (data.parentId === id) {
        throw new BadRequestException('不能将自己设为父级类目');
      }

      if (data.parentId) {
        const parent = await EquipmentCategory.findByPk(data.parentId);
        if (!parent) {
          throw new NotFoundException('父级类目不存在');
        }
        if (parent.status === CategoryStatus.DISCONTINUED) {
          throw new BadRequestException(`父级类目【${parent.name}】已停产，无法进行绑定`);
        }
        data['level'] = parent.level + 1;
      } else {
        data['level'] = 1;
      }
    }

    await category.update(data);

    if (req) {
      await operationLogService.logUpdate(OperationModule.CATEGORY, id, beforeData, category, req);
    }

    return category;
  }

  async deleteCategory(id: number, req?: Request) {
    const category = await EquipmentCategory.findByPk(id);
    if (!category) {
      throw new NotFoundException('类目不存在');
    }

    const childCount = await EquipmentCategory.count({
      where: { parentId: id }
    });
    if (childCount > 0) {
      throw new BadRequestException('该类目下存在子类目，无法删除');
    }

    const workOrderCount = await InspectionWorkOrder.count({
      where: { 
        equipmentCategoryId: id,
        status: { [Op.ne]: WorkOrderStatus.COMPLETED }
      }
    });
    if (workOrderCount > 0) {
      throw new BadRequestException('该类目下存在未完成的巡检工单，无法删除');
    }

    const beforeData = category.toJSON();
    await category.destroy();

    if (req) {
      await operationLogService.logDelete(OperationModule.CATEGORY, id, beforeData, req);
    }

    return true;
  }

  async getCategoryById(id: number) {
    const category = await EquipmentCategory.findByPk(id, {
      include: [
        { model: EquipmentCategory, as: 'parent' },
        { model: EquipmentCategory, as: 'children' }
      ]
    });
    if (!category) {
      throw new NotFoundException('类目不存在');
    }
    return category;
  }

  async getCategoryList(params: {
    name?: string;
    status?: CategoryStatus;
    page?: number;
    pageSize?: number;
  }) {
    const { name, status, page = 1, pageSize = 10 } = params;
    const where: any = {};

    if (name) {
      where.name = { [Op.like]: `%${name}%` };
    }
    if (status) {
      where.status = status;
    }

    const { count, rows } = await EquipmentCategory.findAndCountAll({
      where,
      order: [['sortOrder', 'ASC'], ['createdAt', 'DESC']],
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

  async getCategoryTree(params: {
    parentId?: number | null;
    status?: CategoryStatus;
    includeDisabled?: boolean;
  } = {}): Promise<any[]> {
    const { parentId, status, includeDisabled = false } = params;
    const where: any = {};
    
    if (parentId === undefined) {
      where.parentId = null;
    } else {
      where.parentId = parentId;
    }

    if (!includeDisabled) {
      where.status = status || CategoryStatus.ACTIVE;
    } else if (status) {
      where.status = status;
    }

    const allCategories = await EquipmentCategory.findAll({
      where: includeDisabled ? {} : { status: CategoryStatus.ACTIVE },
      order: [['sortOrder', 'ASC'], ['createdAt', 'DESC']]
    });

    const categoryMap = new Map<number, any>();
    const rootCategories: any[] = [];

    allCategories.forEach(category => {
      categoryMap.set(category.id, {
        ...category.toJSON(),
        children: []
      });
    });

    allCategories.forEach(category => {
      const node = categoryMap.get(category.id)!;
      if (category.parentId === null || category.parentId === undefined) {
        rootCategories.push(node);
      } else {
        const parent = categoryMap.get(category.parentId);
        if (parent) {
          parent.children.push(node);
        } else {
          rootCategories.push(node);
        }
      }
    });

    if (parentId !== undefined && parentId !== null) {
      const targetNode = categoryMap.get(parentId);
      return targetNode ? targetNode.children : [];
    }

    return rootCategories;
  }

  async getCategoryTreeLegacy(parentId?: number | null): Promise<any[]> {
    const where: any = {};
    if (parentId === undefined) {
      where.parentId = null;
    } else {
      where.parentId = parentId;
    }

    const categories = await EquipmentCategory.findAll({
      where,
      order: [['sortOrder', 'ASC'], ['createdAt', 'DESC']]
    });

    const result: any[] = [];
    for (const category of categories) {
      const children = await this.getCategoryTreeLegacy(category.id);
      result.push({
        ...category.toJSON(),
        children
      });
    }

    return result;
  }

  async updateStatus(id: number, status: CategoryStatus, req?: Request) {
    const category = await EquipmentCategory.findByPk(id);
    if (!category) {
      throw new NotFoundException('类目不存在');
    }

    const beforeData = category.toJSON();

    if (status === CategoryStatus.DISCONTINUED) {
      const activeChildren = await EquipmentCategory.count({
        where: { 
          parentId: id, 
          status: CategoryStatus.ACTIVE 
        }
      });
      if (activeChildren > 0) {
        throw new BadRequestException('该类目下存在启用状态的子类目，请先停用子类目');
      }

      const pendingWorkOrders = await InspectionWorkOrder.count({
        where: { 
          equipmentCategoryId: id,
          status: { 
            [Op.in]: [WorkOrderStatus.PENDING, WorkOrderStatus.IN_PROGRESS, WorkOrderStatus.MAINTENANCE]
          }
        }
      });
      if (pendingWorkOrders > 0) {
        throw new BadRequestException('该类目下存在未完成的巡检工单，无法停用');
      }
    }

    await category.update({ status });

    if (req) {
      await operationLogService.logUpdate(OperationModule.CATEGORY, id, beforeData, category, req);
    }

    return category;
  }
}

export default new EquipmentCategoryService();
