import { Supplier } from '../models/supplier.model';
import { SupplierStatus } from '../constants/business';
import { BusinessError } from '../middlewares/errorHandler';
import { Op, Transaction } from 'sequelize';
import { operationLogService } from './operationLog.service';

export class SupplierService {
  async createSupplier(data: {
    name: string;
    code: string;
    brand?: string;
    address?: string;
    contactPerson?: string;
    contactPhone?: string;
    qualification?: string;
    qualificationExpiryDate?: Date;
    supplyCategories?: string;
    supplyCycle?: number;
    paymentTerm?: string;
    remark?: string;
  }, operatorId?: number, operatorName?: string) {
    const existing = await Supplier.findOne({ where: { code: data.code } });
    if (existing) {
      throw new BusinessError('供应商编码已存在');
    }

    const supplier = await Supplier.create(data);

    if (operatorId) {
      await operationLogService.logOperation({
        module: 'supplier',
        operation: 'create',
        targetId: supplier.id,
        afterData: supplier.toJSON(),
        operatorId,
        operatorName,
        remark: '创建供应商',
      });
    }

    return supplier;
  }

  async updateSupplier(
    id: number,
    data: {
      name?: string;
      code?: string;
      brand?: string;
      address?: string;
      contactPerson?: string;
      contactPhone?: string;
      qualification?: string;
      qualificationExpiryDate?: Date;
      supplyCategories?: string;
      supplyCycle?: number;
      paymentTerm?: string;
      status?: SupplierStatus;
      remark?: string;
    },
    operatorId?: number,
    operatorName?: string
  ) {
    const supplier = await Supplier.findByPk(id);
    if (!supplier) {
      throw new BusinessError('供应商不存在');
    }

    if (data.code && data.code !== supplier.code) {
      const existing = await Supplier.findOne({ where: { code: data.code } });
      if (existing) {
        throw new BusinessError('供应商编码已存在');
      }
    }

    const beforeData = supplier.toJSON();
    await supplier.update(data);

    if (operatorId) {
      await operationLogService.logOperation({
        module: 'supplier',
        operation: 'update',
        targetId: supplier.id,
        beforeData,
        afterData: supplier.toJSON(),
        operatorId,
        operatorName,
        remark: '更新供应商',
      });
    }

    return supplier;
  }

  async deleteSupplier(id: number, operatorId?: number, operatorName?: string) {
    const supplier = await Supplier.findByPk(id);
    if (!supplier) {
      throw new BusinessError('供应商不存在');
    }

    const beforeData = supplier.toJSON();
    await supplier.destroy();

    if (operatorId) {
      await operationLogService.logOperation({
        module: 'supplier',
        operation: 'delete',
        targetId: id,
        beforeData,
        operatorId,
        operatorName,
        remark: '删除供应商',
      });
    }

    return true;
  }

  async getSupplier(id: number) {
    return await Supplier.findByPk(id);
  }

  async getSupplierList(params: {
    page?: number;
    pageSize?: number;
    name?: string;
    code?: string;
    brand?: string;
    supplyCategory?: string;
    status?: SupplierStatus;
    qualificationExpiring?: boolean;
  }) {
    const { page = 1, pageSize = 10, name, code, brand, supplyCategory, status, qualificationExpiring } = params;
    const where: any = {};

    if (name) {
      where.name = { [Op.like]: `%${name}%` };
    }
    if (code) {
      where.code = { [Op.like]: `%${code}%` };
    }
    if (brand) {
      where.brand = { [Op.like]: `%${brand}%` };
    }
    if (supplyCategory) {
      where.supplyCategories = { [Op.like]: `%${supplyCategory}%` };
    }
    if (status) {
      where.status = status;
    }
    if (qualificationExpiring) {
      const thirtyDaysLater = new Date();
      thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
      where.qualificationExpiryDate = {
        [Op.between]: [new Date(), thirtyDaysLater],
      };
    }

    const { count, rows } = await Supplier.findAndCountAll({
      where,
      offset: (page - 1) * pageSize,
      limit: pageSize,
      order: [['createdAt', 'DESC']],
    });

    return {
      list: rows,
      total: count,
      page,
      pageSize,
    };
  }
}

export const supplierService = new SupplierService();
