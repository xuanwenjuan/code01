import Material from '../models/Material';
import Order from '../models/Order';
import MaterialLock from '../models/MaterialLock';
import { NotFoundError, BadRequestError, ConflictError } from '../utils/errors';
import { MaterialStatus, MaterialType, LockType, MaterialFilterParams } from '../types';
import { Op, Transaction } from 'sequelize';
import { env } from '../config/environment';
import sequelize from '../config/database';

interface CreateMaterialRequest {
  name: string;
  type: MaterialType;
  specification: string;
  quantity: number;
  unit?: string;
  unitCost: number;
  supplier?: string;
  receivedDate: Date;
  expirationDate?: Date;
  location?: string;
  remarks?: string;
}

interface UpdateMaterialRequest {
  name?: string;
  type?: MaterialType;
  specification?: string;
  quantity?: number;
  unit?: string;
  status?: MaterialStatus;
  unitCost?: number;
  supplier?: string;
  receivedDate?: Date;
  expirationDate?: Date;
  location?: string;
  remarks?: string;
}

interface StockInRequest {
  quantity: number;
  remark?: string;
  operatorId?: number;
}

export class MaterialService {
  static generateBatchNumber(): string {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `MAT${dateStr}${random}`;
  }

  static async create(data: CreateMaterialRequest): Promise<Material> {
    const batchNumber = this.generateBatchNumber();
    const lowStockAlert = data.quantity <= env.LOW_STOCK_THRESHOLD;

    const material = await Material.create({
      ...data,
      batchNumber,
      lowStockAlert,
      status: MaterialStatus.AVAILABLE,
      lockedQuantity: 0,
      availableQuantity: data.quantity,
    });

    return material;
  }

  static async update(id: number, data: UpdateMaterialRequest): Promise<Material> {
    const material = await Material.findByPk(id);
    if (!material) {
      throw new NotFoundError('原料不存在');
    }

    if (material.status === MaterialStatus.USED) {
      throw new BadRequestError('原料已耗用，无法修改');
    }

    let lowStockAlert = material.lowStockAlert;
    if (data.quantity !== undefined) {
      lowStockAlert = data.quantity <= env.LOW_STOCK_THRESHOLD;
    }

    await material.update({ ...data, lowStockAlert });

    return material;
  }

  static async delete(id: number): Promise<void> {
    const material = await Material.findByPk(id);
    if (!material) {
      throw new NotFoundError('原料不存在');
    }

    const hasOrders = await Order.findOne({ where: { materialId: id } });
    if (hasOrders) {
      throw new ConflictError('该原料已被订单使用，无法删除');
    }

    await material.destroy();
  }

  static async getById(id: number): Promise<Material> {
    const material = await Material.findByPk(id);
    if (!material) {
      throw new NotFoundError('原料不存在');
    }
    return material;
  }

  static async getList(
    page: number = 1,
    pageSize: number = 10,
    filters?: MaterialFilterParams
  ): Promise<{ list: Material[]; total: number }> {
    const where: any = {};

    if (filters) {
      if (filters.name) {
        where.name = { [Op.like]: `%${filters.name}%` };
      }
      if (filters.types && filters.types.length > 0) {
        where.type = { [Op.in]: filters.types };
      }
      if (filters.statuses && filters.statuses.length > 0) {
        where.status = { [Op.in]: filters.statuses };
      }
      if (filters.batchNumber) {
        where.batchNumber = { [Op.like]: `%${filters.batchNumber}%` };
      }
      if (filters.supplier) {
        where.supplier = { [Op.like]: `%${filters.supplier}%` };
      }
      if (filters.minQuantity !== undefined) {
        where.quantity = { ...where.quantity, [Op.gte]: filters.minQuantity };
      }
      if (filters.maxQuantity !== undefined) {
        where.quantity = { ...where.quantity, [Op.lte]: filters.maxQuantity };
      }
      if (filters.startDate && filters.endDate) {
        where.receivedDate = { [Op.between]: [filters.startDate, filters.endDate] };
      } else if (filters.startDate) {
        where.receivedDate = { [Op.gte]: filters.startDate };
      } else if (filters.endDate) {
        where.receivedDate = { [Op.lte]: filters.endDate };
      }
    }

    const { count, rows } = await Material.findAndCountAll({
      where,
      offset: (page - 1) * pageSize,
      limit: pageSize,
      order: [['createdAt', 'DESC']],
    });

    return { list: rows, total: count };
  }

  static async lockMaterial(
    materialId: number,
    orderId: number,
    quantity: number,
    lockType: LockType = LockType.PRODUCTION_SCHEDULE,
    lockedBy?: number,
    remarks?: string
  ): Promise<MaterialLock> {
    return await sequelize.transaction(async (t: Transaction) => {
      const material = await Material.findByPk(materialId, { transaction: t });
      if (!material) {
        throw new NotFoundError('原料不存在');
      }

      if (material.status !== MaterialStatus.AVAILABLE) {
        throw new BadRequestError('原料状态不可用');
      }

      const availableQuantity = material.quantity - material.lockedQuantity;
      if (availableQuantity < quantity) {
        throw new BadRequestError(`原料可用库存不足，当前可用: ${availableQuantity}`);
      }

      const newLockedQuantity = material.lockedQuantity + quantity;
      const newAvailableQuantity = material.quantity - newLockedQuantity;
      const newStatus = newAvailableQuantity <= 0 ? MaterialStatus.LOCKED : material.status;

      await material.update(
        {
          lockedQuantity: newLockedQuantity,
          availableQuantity: newAvailableQuantity,
          status: newStatus,
        },
        { transaction: t }
      );

      const lock = await MaterialLock.create(
        {
          materialId,
          orderId,
          quantity,
          lockType,
          lockedBy,
          remarks,
          isActive: true,
        },
        { transaction: t }
      );

      return lock;
    });
  }

  static async unlockMaterial(lockId: number): Promise<void> {
    return await sequelize.transaction(async (t: Transaction) => {
      const lock = await MaterialLock.findByPk(lockId, { transaction: t });
      if (!lock) {
        throw new NotFoundError('锁定记录不存在');
      }

      if (!lock.isActive) {
        throw new BadRequestError('该锁定已解除');
      }

      const material = await Material.findByPk(lock.materialId, { transaction: t });
      if (!material) {
        throw new NotFoundError('原料不存在');
      }

      const newLockedQuantity = Math.max(0, material.lockedQuantity - lock.quantity);
      const newAvailableQuantity = material.quantity - newLockedQuantity;
      const newStatus =
        newAvailableQuantity > 0 && newLockedQuantity === 0
          ? MaterialStatus.AVAILABLE
          : material.status;

      await material.update(
        {
          lockedQuantity: newLockedQuantity,
          availableQuantity: newAvailableQuantity,
          status: newStatus,
        },
        { transaction: t }
      );

      await lock.update(
        {
          isActive: false,
          releasedAt: new Date(),
        },
        { transaction: t }
      );
    });
  }

  static async getMaterialLocks(materialId: number): Promise<MaterialLock[]> {
    return await MaterialLock.findAll({
      where: { materialId, isActive: true },
      order: [['lockedAt', 'DESC']],
    });
  }

  static async getOrderMaterialLocks(orderId: number): Promise<MaterialLock[]> {
    return await MaterialLock.findAll({
      where: { orderId, isActive: true },
      include: [{ model: Material, as: 'material' }],
      order: [['lockedAt', 'DESC']],
    });
  }

  static async updateStatus(id: number, status: MaterialStatus): Promise<Material> {
    const material = await Material.findByPk(id);
    if (!material) {
      throw new NotFoundError('原料不存在');
    }

    if (material.status === MaterialStatus.USED && status !== MaterialStatus.USED) {
      throw new BadRequestError('原料已耗用，无法变更状态');
    }

    await material.update({ status });

    return material;
  }

  static async getLowStockAlertList(): Promise<Material[]> {
    const materials = await Material.findAll({
      where: {
        lowStockAlert: true,
        status: MaterialStatus.AVAILABLE,
      },
      order: [['quantity', 'ASC']],
    });

    return materials;
  }

  static async consumeMaterial(id: number, quantity: number): Promise<Material> {
    return await sequelize.transaction(async (t: Transaction) => {
      const material = await Material.findByPk(id, { transaction: t });
      if (!material) {
        throw new NotFoundError('原料不存在');
      }

      if (material.status !== MaterialStatus.AVAILABLE && material.status !== MaterialStatus.LOCKED) {
        throw new BadRequestError('原料状态不可用');
      }

      const availableForConsumption = material.quantity - material.lockedQuantity;
      if (availableForConsumption < quantity) {
        throw new BadRequestError(`原料可用库存不足，当前可用: ${availableForConsumption}`);
      }

      const newQuantity = material.quantity - quantity;
      const newAvailableQuantity = newQuantity - material.lockedQuantity;
      const lowStockAlert = newQuantity <= env.LOW_STOCK_THRESHOLD;
      const newStatus =
        newQuantity <= 0
          ? MaterialStatus.USED
          : newAvailableQuantity <= 0 && material.lockedQuantity > 0
            ? MaterialStatus.LOCKED
            : MaterialStatus.AVAILABLE;

      await material.update(
        {
          quantity: newQuantity,
          availableQuantity: newAvailableQuantity,
          lowStockAlert,
          status: newStatus,
        },
        { transaction: t }
      );

      return material;
    });
  }

  static async stockIn(id: number, data: StockInRequest): Promise<Material> {
    return await sequelize.transaction(async (t: Transaction) => {
      const material = await Material.findByPk(id, { transaction: t });
      if (!material) {
        throw new NotFoundError('原料不存在');
      }

      if (material.status === MaterialStatus.USED) {
        throw new BadRequestError('原料已耗用，无法入库');
      }

      const newQuantity = material.quantity + data.quantity;
      const newAvailableQuantity = newQuantity - material.lockedQuantity;
      const lowStockAlert = newAvailableQuantity <= env.LOW_STOCK_THRESHOLD;
      const newStatus =
        newAvailableQuantity <= 0 && material.lockedQuantity > 0
          ? MaterialStatus.LOCKED
          : MaterialStatus.AVAILABLE;

      await material.update(
        {
          quantity: newQuantity,
          availableQuantity: newAvailableQuantity,
          lowStockAlert,
          status: newStatus,
        },
        { transaction: t }
      );

      return material;
    });
  }

  static async getInventoryStatistics(): Promise<any> {
    const statuses = Object.values(MaterialStatus);
    const statistics: any = { total: 0, totalValue: 0 };

    for (const status of statuses) {
      const { count, rows } = await Material.findAndCountAll({ where: { status } });
      statistics[status] = count;
      statistics.total += count;

      const totalValue = rows.reduce((sum, m) => sum + m.quantity * m.unitCost, 0);
      statistics[`${status}Value`] = totalValue;
      statistics.totalValue += totalValue;
    }

    const lowStockCount = await Material.count({
      where: { lowStockAlert: true, status: MaterialStatus.AVAILABLE },
    });
    statistics.lowStockCount = lowStockCount;

    return statistics;
  }

  static async validateAvailableMaterial(id: number, requiredQuantity: number): Promise<void> {
    const material = await Material.findByPk(id);
    if (!material) {
      throw new NotFoundError('原料不存在');
    }
    if (material.status !== MaterialStatus.AVAILABLE) {
      throw new BadRequestError(`原料【${material.name}】状态不可用`);
    }
    if (material.quantity < requiredQuantity) {
      throw new BadRequestError(
        `原料【${material.name}】库存不足，当前: ${material.quantity}, 需要: ${requiredQuantity}`
      );
    }
  }
}
