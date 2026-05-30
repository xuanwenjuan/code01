import { Part } from '../models/part.model';
import { Category } from '../models/category.model';
import { Supplier } from '../models/supplier.model';
import { BusinessError } from '../middlewares/errorHandler';
import { Op } from 'sequelize';
import { Stock } from '../models/stock.model';
import { CategoryStatus } from '../constants/business';
import { operationLogService } from './operationLog.service';

export class PartService {
  async createPart(
    data: {
      code: string;
      name: string;
      specification?: string;
      vehicleModel?: string;
      categoryId: number;
      supplierId?: number;
      unitPrice: number;
      unit?: string;
      safeStock?: number;
      remark?: string;
    },
    operatorId?: number,
    operatorName?: string
  ) {
    const existing = await Part.findOne({ where: { code: data.code } });
    if (existing) {
      throw new BusinessError('配件编码已存在');
    }

    const category = await Category.findByPk(data.categoryId);
    if (!category) {
      throw new BusinessError('分类不存在');
    }

    if (category.status === CategoryStatus.DISABLED) {
      throw new BusinessError('该类目已被封存，无法在其下新增配件');
    }

    if (data.supplierId) {
      const supplier = await Supplier.findByPk(data.supplierId);
      if (!supplier) {
        throw new BusinessError('供应商不存在');
      }
    }

    const part = await Part.create(data);

    if (operatorId) {
      await operationLogService.logOperation({
        module: 'part',
        operation: 'create',
        targetId: part.id,
        afterData: part.toJSON(),
        operatorId,
        operatorName,
        remark: '创建配件',
      });
    }

    return part;
  }

  async updatePart(
    id: number,
    data: {
      name?: string;
      specification?: string;
      vehicleModel?: string;
      categoryId?: number;
      supplierId?: number;
      unitPrice?: number;
      unit?: string;
      safeStock?: number;
      remark?: string;
    },
    operatorId?: number,
    operatorName?: string
  ) {
    const part = await Part.findByPk(id);
    if (!part) {
      throw new BusinessError('配件不存在');
    }

    if (data.categoryId) {
      const category = await Category.findByPk(data.categoryId);
      if (!category) {
        throw new BusinessError('分类不存在');
      }
      if (category.status === CategoryStatus.DISABLED) {
        throw new BusinessError('该类目已被封存，无法将配件移动到该类目下');
      }
    }

    if (data.supplierId) {
      const supplier = await Supplier.findByPk(data.supplierId);
      if (!supplier) {
        throw new BusinessError('供应商不存在');
      }
    }

    const beforeData = part.toJSON();
    await part.update(data);

    if (operatorId) {
      await operationLogService.logOperation({
        module: 'part',
        operation: 'update',
        targetId: id,
        beforeData,
        afterData: part.toJSON(),
        operatorId,
        operatorName,
        remark: '更新配件',
      });
    }

    return part;
  }

  async deletePart(id: number, operatorId?: number, operatorName?: string) {
    const part = await Part.findByPk(id);
    if (!part) {
      throw new BusinessError('配件不存在');
    }

    const hasStock = await Stock.count({ where: { partId: id } });
    if (hasStock > 0) {
      throw new BusinessError('该配件有库存，无法删除');
    }

    const beforeData = part.toJSON();
    await part.destroy();

    if (operatorId) {
      await operationLogService.logOperation({
        module: 'part',
        operation: 'delete',
        targetId: id,
        beforeData,
        operatorId,
        operatorName,
        remark: '删除配件',
      });
    }

    return true;
  }

  async getPart(id: number) {
    const part = await Part.findByPk(id, {
      include: [Category, Supplier],
    });

    if (!part) {
      throw new BusinessError('配件不存在');
    }

    const totalStock = await Stock.sum('quantity', { where: { partId: id } });

    return {
      ...part.toJSON(),
      stock: totalStock || 0,
    };
  }

  async getPartList(params: {
    page?: number;
    pageSize?: number;
    code?: string;
    name?: string;
    categoryId?: number;
    supplierId?: number;
    lowStock?: boolean;
  }) {
    const { page = 1, pageSize = 10, code, name, categoryId, supplierId, lowStock } = params;
    const where: any = {};

    if (code) {
      where.code = { [Op.like]: `%${code}%` };
    }
    if (name) {
      where.name = { [Op.like]: `%${name}%` };
    }
    if (categoryId) {
      where.categoryId = categoryId;
    }
    if (supplierId) {
      where.supplierId = supplierId;
    }

    const { count, rows } = await Part.findAndCountAll({
      where,
      offset: (page - 1) * pageSize,
      limit: pageSize,
      order: [['createdAt', 'DESC']],
      include: [Category, Supplier],
    });

    const partsWithStock = await Promise.all(
      rows.map(async (part) => {
        const totalStock = await Stock.sum('quantity', { where: { partId: part.id } });
        return {
          ...part.toJSON(),
          stock: totalStock || 0,
          isLowStock: (totalStock || 0) < part.safeStock,
        };
      })
    );

    let filteredParts = partsWithStock;
    if (lowStock) {
      filteredParts = partsWithStock.filter((p) => p.isLowStock);
    }

    return {
      list: filteredParts,
      total: lowStock ? filteredParts.length : count,
      page,
      pageSize,
    };
  }
}

export const partService = new PartService();
