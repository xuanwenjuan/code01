import { ConsumableRecord, ObservationSite, EquipmentCategory, InspectionWorkOrder, ConsumableInventory, sequelize } from '../models';
import { NotFoundException, BadRequestException, ConflictException } from '../exceptions/http.exception';
import { Op, fn, col, Transaction } from 'sequelize';
import equipmentCategoryService from './equipmentCategory.service';
import operationLogService from './operationLog.service';
import { OperationModule, OperationType } from '../types';
import logger from '../utils/logger';
import { Request } from 'express';

class ConsumableRecordService {
  generateRecordNo(): string {
    const now = new Date();
    const timestamp = now.getTime().toString().slice(-6);
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `CR${timestamp}${random}`;
  }

  async getOrCreateInventory(equipmentCategoryId: number, name: string, transaction: Transaction) {
    let inventory = await ConsumableInventory.findOne({
      where: { equipmentCategoryId, name },
      transaction
    });

    if (!inventory) {
      inventory = await ConsumableInventory.create({
        equipmentCategoryId,
        name,
        quantity: 0,
        unit: '',
        unitPrice: 0,
        totalValue: 0,
        minStock: 10,
        maxStock: 1000
      }, { transaction });
    }

    return inventory;
  }

  async updateInventoryQuantity(
    equipmentCategoryId: number,
    name: string,
    quantity: number,
    type: 'in' | 'out',
    unitPrice?: number,
    transaction?: Transaction
  ) {
    const inventory = await this.getOrCreateInventory(equipmentCategoryId, name, transaction!);

    let newQuantity = inventory.quantity;
    let newUnitPrice = inventory.unitPrice;

    if (type === 'in') {
      newQuantity += quantity;
      if (unitPrice !== undefined) {
        newUnitPrice = unitPrice;
      }
    } else {
      if (inventory.quantity < quantity) {
        throw new ConflictException(`耗材 ${name} 库存不足，当前库存: ${inventory.quantity}，需要: ${quantity}`);
      }
      newQuantity -= quantity;
    }

    const totalValue = newQuantity * newUnitPrice;

    await inventory.update({
      quantity: newQuantity,
      unitPrice: newUnitPrice,
      totalValue
    }, { transaction });

    return inventory;
  }

  async createRecord(data: {
    siteId?: number;
    equipmentCategoryId?: number;
    workOrderId?: number;
    name: string;
    specification?: string;
    unit: string;
    quantity: number;
    unitPrice: number;
    type: 'in' | 'out';
    operatorId?: number;
    receiveDate?: Date;
    remark?: string;
    createdBy?: number;
  }, req?: Request) {
    const transaction = await sequelize.transaction();

    try {
      if (data.quantity <= 0) {
        throw new BadRequestException('数量必须大于0');
      }
      if (data.unitPrice < 0) {
        throw new BadRequestException('单价不能为负数');
      }

      if (data.siteId) {
        const site = await ObservationSite.findByPk(data.siteId, { transaction });
        if (!site) {
          throw new NotFoundException('站点不存在');
        }
      }

      if (data.equipmentCategoryId) {
        await equipmentCategoryService.checkCategoryUsable(data.equipmentCategoryId);
      }

      if (data.workOrderId) {
        const workOrder = await InspectionWorkOrder.findByPk(data.workOrderId, { transaction });
        if (!workOrder) {
          throw new NotFoundException('工单不存在');
        }
        if (workOrder.equipmentCategoryId) {
          await equipmentCategoryService.checkCategoryUsable(workOrder.equipmentCategoryId);
        }
      }

      const recordNo = this.generateRecordNo();
      const totalPrice = data.quantity * data.unitPrice;

      const record = await ConsumableRecord.create({
        ...data,
        recordNo,
        totalPrice
      }, { transaction });

      if (data.equipmentCategoryId) {
        await this.updateInventoryQuantity(
          data.equipmentCategoryId,
          data.name,
          data.quantity,
          data.type,
          data.unitPrice,
          transaction
        );
      }

      await transaction.commit();

      if (req) {
        await operationLogService.logCreate(OperationModule.CONSUMABLE, record.id, record, req);
      }

      logger.info(`耗材记录已创建 - 记录ID: ${record.id}, 耗材名称: ${data.name}, 类型: ${data.type}, 数量: ${data.quantity}`);

      return record;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async batchOutbound(data: {
    siteId?: number;
    equipmentCategoryId?: number;
    workOrderId?: number;
    items: {
      name: string;
      specification?: string;
      unit: string;
      quantity: number;
      unitPrice: number;
    }[];
    operatorId?: number;
    remark?: string;
    createdBy?: number;
  }, req?: Request) {
    const transaction = await sequelize.transaction();

    try {
      const { items, ...commonData } = data;
      const records: any[] = [];

      for (const item of items) {
        if (item.quantity <= 0) {
          throw new BadRequestException(`耗材 ${item.name} 数量必须大于0`);
        }

        const recordNo = this.generateRecordNo();
        const totalPrice = item.quantity * item.unitPrice;

        const record = await ConsumableRecord.create({
          ...commonData,
          ...item,
          recordNo,
          totalPrice,
          type: 'out'
        }, { transaction });

        records.push(record);

        if (commonData.equipmentCategoryId) {
          await this.updateInventoryQuantity(
            commonData.equipmentCategoryId,
            item.name,
            item.quantity,
            'out',
            item.unitPrice,
            transaction
          );
        }
      }

      await transaction.commit();

      if (req) {
        for (const record of records) {
          await operationLogService.logCreate(OperationModule.CONSUMABLE, record.id, record, req);
        }
      }

      logger.info(`批量出库完成 - 共 ${records.length} 条记录`);

      return records;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async updateRecord(id: number, data: {
    siteId?: number;
    equipmentCategoryId?: number;
    workOrderId?: number;
    name?: string;
    specification?: string;
    unit?: string;
    quantity?: number;
    unitPrice?: number;
    type?: 'in' | 'out';
    operatorId?: number;
    receiveDate?: Date;
    remark?: string;
  }, req?: Request) {
    const transaction = await sequelize.transaction();

    try {
      const record = await ConsumableRecord.findByPk(id, { transaction });
      if (!record) {
        throw new NotFoundException('记录不存在');
      }

      const beforeData = record.toJSON();

      if (data.quantity !== undefined && data.quantity <= 0) {
        throw new BadRequestException('数量必须大于0');
      }
      if (data.unitPrice !== undefined && data.unitPrice < 0) {
        throw new BadRequestException('单价不能为负数');
      }

      if (data.siteId) {
        const site = await ObservationSite.findByPk(data.siteId, { transaction });
        if (!site) {
          throw new NotFoundException('站点不存在');
        }
      }

      if (data.equipmentCategoryId) {
        await equipmentCategoryService.checkCategoryUsable(data.equipmentCategoryId);
      }

      if (data.workOrderId) {
        const workOrder = await InspectionWorkOrder.findByPk(data.workOrderId, { transaction });
        if (!workOrder) {
          throw new NotFoundException('工单不存在');
        }
      }

      if (data.quantity !== undefined && record.equipmentCategoryId) {
        const quantityDiff = data.quantity - record.quantity;
        if (quantityDiff !== 0) {
          const adjustType = quantityDiff > 0 ? record.type : (record.type === 'in' ? 'out' : 'in');
          await this.updateInventoryQuantity(
            record.equipmentCategoryId,
            record.name,
            Math.abs(quantityDiff),
            adjustType,
            record.unitPrice,
            transaction
          );
        }
      }

      let totalPrice = record.totalPrice;
      if (data.quantity !== undefined && data.unitPrice !== undefined) {
        totalPrice = data.quantity * data.unitPrice;
      } else if (data.quantity !== undefined) {
        totalPrice = data.quantity * record.unitPrice;
      } else if (data.unitPrice !== undefined) {
        totalPrice = record.quantity * data.unitPrice;
      }
      data.totalPrice = totalPrice;

      await record.update(data, { transaction });

      await transaction.commit();

      if (req) {
        await operationLogService.logUpdate(OperationModule.CONSUMABLE, id, beforeData, record, req);
      }

      return record;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async deleteRecord(id: number, req?: Request) {
    const transaction = await sequelize.transaction();

    try {
      const record = await ConsumableRecord.findByPk(id, { transaction });
      if (!record) {
        throw new NotFoundException('记录不存在');
      }

      if (record.workOrderId) {
        const workOrder = await InspectionWorkOrder.findByPk(record.workOrderId, { transaction });
        if (workOrder && workOrder.status !== 'completed') {
          throw new BadRequestException('关联工单未完成，无法删除该耗材记录');
        }
      }

      const recordTime = new Date(record.createdAt || '');
      const now = new Date();
      const diffHours = (now.getTime() - recordTime.getTime()) / (1000 * 60 * 60);
      if (diffHours > 24) {
        throw new BadRequestException('超过24小时的记录无法删除');
      }

      if (record.equipmentCategoryId) {
        const reverseType = record.type === 'in' ? 'out' : 'in';
        await this.updateInventoryQuantity(
          record.equipmentCategoryId,
          record.name,
          record.quantity,
          reverseType,
          record.unitPrice,
          transaction
        );
      }

      const beforeData = record.toJSON();
      await record.destroy({ transaction });

      await transaction.commit();

      if (req) {
        await operationLogService.logDelete(OperationModule.CONSUMABLE, id, beforeData, req);
      }

      logger.info(`耗材记录已删除 - 记录ID: ${id}, 耗材名称: ${record.name}`);

      return true;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async getRecordById(id: number) {
    const record = await ConsumableRecord.findByPk(id, {
      include: [
        { model: ObservationSite, as: 'site' },
        { model: EquipmentCategory, as: 'equipmentCategory' },
        { model: InspectionWorkOrder, as: 'workOrder' }
      ]
    });
    if (!record) {
      throw new NotFoundException('记录不存在');
    }
    return record;
  }

  async getRecordList(params: {
    name?: string;
    siteId?: number;
    equipmentCategoryId?: number;
    workOrderId?: number;
    type?: 'in' | 'out';
    startDate?: string;
    endDate?: string;
    page?: number;
    pageSize?: number;
  }) {
    const { name, siteId, equipmentCategoryId, workOrderId, type, startDate, endDate, page = 1, pageSize = 10 } = params;
    const where: any = {};

    if (name) {
      where.name = { [Op.like]: `%${name}%` };
    }
    if (siteId) {
      where.siteId = siteId;
    }
    if (equipmentCategoryId) {
      where.equipmentCategoryId = equipmentCategoryId;
    }
    if (workOrderId) {
      where.workOrderId = workOrderId;
    }
    if (type) {
      where.type = type;
    }
    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const { count, rows } = await ConsumableRecord.findAndCountAll({
      where,
      include: [
        { model: ObservationSite, as: 'site' },
        { model: EquipmentCategory, as: 'equipmentCategory' }
      ],
      order: [['createdAt', 'DESC']],
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

  async getInventoryList(params: {
    equipmentCategoryId?: number;
    name?: string;
    lowStock?: boolean;
    page?: number;
    pageSize?: number;
  }) {
    const { equipmentCategoryId, name, lowStock, page = 1, pageSize = 10 } = params;
    const where: any = {};

    if (equipmentCategoryId) {
      where.equipmentCategoryId = equipmentCategoryId;
    }
    if (name) {
      where.name = { [Op.like]: `%${name}%` };
    }
    if (lowStock) {
      where.quantity = { [Op.lte]: col('minStock') };
    }

    const { count, rows } = await ConsumableInventory.findAndCountAll({
      where,
      include: [
        { model: EquipmentCategory, as: 'equipmentCategory' }
      ],
      order: [['createdAt', 'DESC']],
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

  async getInventoryStatistics() {
    const [inStats] = await ConsumableRecord.findAll({
      where: { type: 'in' },
      attributes: [
        'name',
        [fn('SUM', col('quantity')), 'totalInQuantity'],
        [fn('SUM', col('totalPrice')), 'totalInAmount']
      ],
      group: ['name']
    });

    const [outStats] = await ConsumableRecord.findAll({
      where: { type: 'out' },
      attributes: [
        'name',
        [fn('SUM', col('quantity')), 'totalOutQuantity'],
        [fn('SUM', col('totalPrice')), 'totalOutAmount']
      ],
      group: ['name']
    });

    const allNames = new Set([
      ...(inStats ? (inStats as any[]).map((s: any) => s.name) : []),
      ...(outStats ? (outStats as any[]).map((s: any) => s.name) : [])
    ]);

    const inventory: any[] = [];
    for (const name of allNames) {
      const inStat = inStats ? (inStats as any[]).find((s: any) => s.name === name) : null;
      const outStat = outStats ? (outStats as any[]).find((s: any) => s.name === name) : null;
      
      inventory.push({
        name,
        inQuantity: inStat ? parseFloat(inStat.dataValues.totalInQuantity) : 0,
        inAmount: inStat ? parseFloat(inStat.dataValues.totalInAmount) : 0,
        outQuantity: outStat ? parseFloat(outStat.dataValues.totalOutQuantity) : 0,
        outAmount: outStat ? parseFloat(outStat.dataValues.totalOutAmount) : 0,
        currentQuantity: (inStat ? parseFloat(inStat.dataValues.totalInQuantity) : 0) - 
                        (outStat ? parseFloat(outStat.dataValues.totalOutQuantity) : 0)
      });
    }

    return inventory;
  }

  async getConsumptionBySite(siteId?: number) {
    const where: any = { type: 'out' };
    if (siteId) {
      where.siteId = siteId;
    }

    const stats = await ConsumableRecord.findAll({
      where,
      attributes: [
        [col('site.name'), 'siteName'],
        'name',
        [fn('SUM', col('quantity')), 'totalQuantity'],
        [fn('SUM', col('totalPrice')), 'totalAmount']
      ],
      include: [
        { model: ObservationSite, as: 'site', attributes: [] }
      ],
      group: ['siteId', 'name'],
      order: [[fn('SUM', col('totalPrice')), 'DESC']]
    });

    return stats.map((s: any) => ({
      siteName: s.getDataValue('siteName'),
      name: s.name,
      totalQuantity: parseFloat(s.getDataValue('totalQuantity')),
      totalAmount: parseFloat(s.getDataValue('totalAmount'))
    }));
  }

  async getConsumptionByCategory(categoryId?: number) {
    const where: any = { type: 'out' };
    if (categoryId) {
      where.equipmentCategoryId = categoryId;
    }

    const stats = await ConsumableRecord.findAll({
      where,
      attributes: [
        [col('equipmentCategory.name'), 'categoryName'],
        'name',
        [fn('SUM', col('quantity')), 'totalQuantity'],
        [fn('SUM', col('totalPrice')), 'totalAmount']
      ],
      include: [
        { model: EquipmentCategory, as: 'equipmentCategory', attributes: [] }
      ],
      group: ['equipmentCategoryId', 'name'],
      order: [[fn('SUM', col('totalPrice')), 'DESC']]
    });

    return stats.map((s: any) => ({
      categoryName: s.getDataValue('categoryName'),
      name: s.name,
      totalQuantity: parseFloat(s.getDataValue('totalQuantity')),
      totalAmount: parseFloat(s.getDataValue('totalAmount'))
    }));
  }

  async getConsumptionReport(startDate: string, endDate: string) {
    const where: any = {
      type: 'out',
      createdAt: {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      }
    };

    const stats = await ConsumableRecord.findAll({
      where,
      attributes: [
        'name',
        [fn('SUM', col('quantity')), 'totalQuantity'],
        [fn('SUM', col('totalPrice')), 'totalAmount'],
        [fn('COUNT', col('id')), 'usageCount']
      ],
      group: ['name'],
      order: [[fn('SUM', col('totalPrice')), 'DESC']]
    });

    const totalAmount = await ConsumableRecord.sum('totalPrice', { where });
    const totalQuantity = await ConsumableRecord.sum('quantity', { where });

    return {
      summary: {
        totalAmount,
        totalQuantity,
        itemCount: stats.length
      },
      details: stats.map((s: any) => ({
        name: s.name,
        totalQuantity: parseFloat(s.getDataValue('totalQuantity')),
        totalAmount: parseFloat(s.getDataValue('totalAmount')),
        usageCount: parseInt(s.getDataValue('usageCount'))
      }))
    };
  }
}

export default new ConsumableRecordService();
