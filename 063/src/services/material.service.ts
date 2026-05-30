import { Op, Transaction } from 'sequelize';
import sequelize from '../config/database';
import Material from '../models/Material';
import Category from '../models/Category';
import Warehouse from '../models/Warehouse';
import StockLog, { StockLogType } from '../models/StockLog';
import Requisition from '../models/Requisition';
import { BusinessError } from '../middlewares/errorHandler';

enum CategoryStatus {
  ARCHIVED = 0,
  ACTIVE = 1
}

export interface CreateMaterialRequest {
  name: string;
  code: string;
  specification?: string;
  model?: string;
  unit: string;
  unitPrice: number;
  categoryId: number;
  warehouseId: number;
  stockQuantity?: number;
  minStockThreshold?: number;
  location?: string;
  description?: string;
}

export interface UpdateMaterialRequest {
  id: number;
  name?: string;
  code?: string;
  specification?: string;
  model?: string;
  unit?: string;
  unitPrice?: number;
  categoryId?: number;
  warehouseId?: number;
  minStockThreshold?: number;
  location?: string;
  description?: string;
  status?: number;
}

export interface StockInRequest {
  materialId: number;
  quantity: number;
  remark?: string;
  operatorId: number;
}

export enum MaterialStatus {
  DISABLED = 0,
  ACTIVE = 1
}

class MaterialService {
  async create(request: CreateMaterialRequest) {
    const existingCode = await Material.findOne({
      where: { code: request.code }
    });

    if (existingCode) {
      throw new BusinessError('物资编码已存在', 400);
    }

    const existingName = await Material.findOne({
      where: { 
        name: request.name,
        warehouseId: request.warehouseId
      }
    });
    if (existingName) {
      throw new BusinessError('同一仓库下物资名称已存在', 400);
    }

    const category = await Category.findByPk(request.categoryId);
    if (!category) {
      throw new BusinessError('类目不存在', 400);
    }
    if (category.status === CategoryStatus.ARCHIVED) {
      throw new BusinessError('不能在已归档的类目下创建物资', 400);
    }

    const warehouse = await Warehouse.findByPk(request.warehouseId);
    if (!warehouse) {
      throw new BusinessError('仓库不存在', 400);
    }

    return Material.create({
      ...request,
      stockQuantity: request.stockQuantity || 0,
      status: MaterialStatus.ACTIVE
    });
  }

  async update(request: UpdateMaterialRequest) {
    const material = await Material.findByPk(request.id);
    if (!material) {
      throw new BusinessError('物资不存在', 404);
    }

    if (request.code && request.code !== material.code) {
      const existing = await Material.findOne({
        where: { code: request.code }
      });
      if (existing) {
        throw new BusinessError('物资编码已存在', 400);
      }
    }

    if (request.name && request.name !== material.name) {
      const existingName = await Material.findOne({
        where: { 
          name: request.name,
          warehouseId: material.warehouseId,
          id: { [Op.ne]: request.id }
        }
      });
      if (existingName) {
        throw new BusinessError('同一仓库下物资名称已存在', 400);
      }
    }

    if (request.categoryId && request.categoryId !== material.categoryId) {
      const category = await Category.findByPk(request.categoryId);
      if (!category) {
        throw new BusinessError('类目不存在', 400);
      }
      if (category.status === CategoryStatus.ARCHIVED) {
        throw new BusinessError('不能将物资移动到已归档的类目', 400);
      }
    }

    if (request.warehouseId && request.warehouseId !== material.warehouseId) {
      const warehouse = await Warehouse.findByPk(request.warehouseId);
      if (!warehouse) {
        throw new BusinessError('仓库不存在', 400);
      }
    }

    return material.update(request);
  }

  async delete(id: number) {
    const material = await Material.findByPk(id);
    if (!material) {
      throw new BusinessError('物资不存在', 404);
    }
    return material.destroy();
  }

  async getById(id: number) {
    return Material.findByPk(id, {
      include: [
        { model: Category, as: 'category' },
        { model: Warehouse, as: 'warehouse' }
      ]
    });
  }

  async getList(params: {
    name?: string;
    code?: string;
    categoryId?: number;
    warehouseId?: number;
    status?: number;
  }) {
    const where: any = {};
    if (params.name) {
      where.name = { [Op.like]: `%${params.name}%` };
    }
    if (params.code) {
      where.code = { [Op.like]: `%${params.code}%` };
    }
    if (params.categoryId) {
      where.categoryId = params.categoryId;
    }
    if (params.warehouseId) {
      where.warehouseId = params.warehouseId;
    }
    if (params.status !== undefined) {
      where.status = params.status;
    }

    return Material.findAll({
      where,
      include: [
        { model: Category, as: 'category' },
        { model: Warehouse, as: 'warehouse' }
      ],
      order: [['id', 'DESC']]
    });
  }

  async stockIn(request: StockInRequest) {
    const t = await sequelize.transaction();

    try {
      const material = await Material.findByPk(request.materialId, { transaction: t });
      if (!material) {
        throw new BusinessError('物资不存在', 404);
      }

      const beforeQuantity = material.stockQuantity;
      const afterQuantity = beforeQuantity + request.quantity;

      await material.update({ stockQuantity: afterQuantity }, { transaction: t });

      const logNo = `IN${Date.now()}${Math.floor(Math.random() * 1000)}`;
      await StockLog.create(
        {
          logNo,
          materialId: request.materialId,
          warehouseId: material.warehouseId,
          type: StockLogType.IN,
          quantity: request.quantity,
          beforeQuantity,
          afterQuantity,
          operatorId: request.operatorId,
          remark: request.remark
        },
        { transaction: t }
      );

      await t.commit();
      return { success: true };
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async stockOut(request: StockInRequest) {
    const t = await sequelize.transaction();

    try {
      const material = await Material.findByPk(request.materialId, { transaction: t });
      if (!material) {
        throw new BusinessError('物资不存在', 404);
      }

      if (material.stockQuantity < request.quantity) {
        throw new BusinessError('库存不足', 400);
      }

      const beforeQuantity = material.stockQuantity;
      const afterQuantity = beforeQuantity - request.quantity;

      await material.update({ stockQuantity: afterQuantity }, { transaction: t });

      const logNo = `OUT${Date.now()}${Math.floor(Math.random() * 1000)}`;
      await StockLog.create(
        {
          logNo,
          materialId: request.materialId,
          warehouseId: material.warehouseId,
          type: StockLogType.OUT,
          quantity: request.quantity,
          beforeQuantity,
          afterQuantity,
          operatorId: request.operatorId,
          remark: request.remark
        },
        { transaction: t }
      );

      await t.commit();
      return { success: true };
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async getStockLogs(params: {
    materialId?: number;
    warehouseId?: number;
    type?: number;
    startDate?: string;
    endDate?: string;
  }) {
    const where: any = {};
    if (params.materialId) {
      where.materialId = params.materialId;
    }
    if (params.warehouseId) {
      where.warehouseId = params.warehouseId;
    }
    if (params.type) {
      where.type = params.type;
    }
    if (params.startDate && params.endDate) {
      where.createdAt = {
        [Op.between]: [new Date(params.startDate), new Date(params.endDate)]
      };
    }

    return StockLog.findAll({
      where,
      include: [
        { model: Material, as: 'material' },
        { model: Warehouse, as: 'warehouse' },
        { model: require('../models/User').default, as: 'operator' }
      ],
      order: [['createdAt', 'DESC']]
    });
  }
}

export default new MaterialService();