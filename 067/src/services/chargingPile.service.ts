import { ChargingPile, ChargingSite, OperationLog } from '../models';
import { ChargingPileStatus, ChargingPowerType, PaginationParams } from '../types';
import { AppError, NotFoundException, BadRequestException } from '../middleware/error.middleware';
import { Transaction, Op, fn, col } from 'sequelize';
import sequelize from '../config/database';
import logger from '../config/logger';
import { OperationType } from './operationLog.service';

interface ChargingPileFilterParams extends PaginationParams {
  siteId?: number;
  status?: ChargingPileStatus;
  powerType?: ChargingPowerType;
  minPower?: number;
  maxPower?: number;
  keyword?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class ChargingPileService {
  async create(data: {
    siteId: number;
    pileCode: string;
    powerType: ChargingPowerType;
    ratedPower: number;
    ratedVoltage?: string;
    ratedCurrent?: string;
    gunNumber?: number;
    manufacturer?: string;
    model?: string;
    installLocation?: string;
    customElectricityPrice?: number;
    customServiceFee?: number;
    operatorId?: number;
  }) {
    const t: Transaction = await sequelize.transaction();

    try {
      const site = await ChargingSite.findByPk(data.siteId, { transaction: t });

      if (!site) {
        throw new NotFoundException('站点不存在');
      }

      if (!site.isOperating) {
        throw new BadRequestException('该站点已停运，无法添加充电桩');
      }

      const existingPile = await ChargingPile.findOne({
        where: { pileCode: data.pileCode },
        transaction: t,
      });

      if (existingPile) {
        throw new BadRequestException('充电桩编号已存在');
      }

      const pile = await ChargingPile.create(
        {
          siteId: data.siteId,
          pileCode: data.pileCode,
          powerType: data.powerType,
          ratedPower: data.ratedPower,
          ratedVoltage: data.ratedVoltage,
          ratedCurrent: data.ratedCurrent,
          gunNumber: data.gunNumber || 1,
          manufacturer: data.manufacturer,
          model: data.model,
          installLocation: data.installLocation,
          customElectricityPrice: data.customElectricityPrice,
          customServiceFee: data.customServiceFee,
          status: ChargingPileStatus.OFFLINE,
        },
        { transaction: t }
      );

      await OperationLog.create(
        {
          userId: data.operatorId,
          method: 'POST',
          path: '/api/charging-piles',
          body: JSON.stringify(data),
          statusCode: 200,
          operationType: OperationType.CREATE,
          description: `创建充电桩: ${data.pileCode}`,
        },
        { transaction: t }
      );

      await t.commit();

      logger.info(`充电桩 ${data.pileCode} 创建成功`);

      return pile;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async update(
    id: number,
    data: {
      pileCode?: string;
      powerType?: ChargingPowerType;
      ratedPower?: number;
      ratedVoltage?: string;
      ratedCurrent?: string;
      gunNumber?: number;
      manufacturer?: string;
      model?: string;
      installLocation?: string;
      customElectricityPrice?: number;
      customServiceFee?: number;
      status?: ChargingPileStatus;
      operatorId?: number;
    }
  ) {
    const t: Transaction = await sequelize.transaction();

    try {
      const pile = await ChargingPile.findByPk(id, {
        include: [{ model: ChargingSite, as: 'site' }],
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (!pile) {
        throw new NotFoundException('充电桩不存在');
      }

      if (data.pileCode && data.pileCode !== pile.pileCode) {
        const existingPile = await ChargingPile.findOne({
          where: { pileCode: data.pileCode },
          transaction: t,
        });

        if (existingPile) {
          throw new BadRequestException('充电桩编号已存在');
        }
      }

      if (!pile.site?.isOperating && data.status) {
        throw new BadRequestException('该站点已停运，无法修改充电桩状态');
      }

      await pile.update(data, { transaction: t });

      await OperationLog.create(
        {
          userId: data.operatorId,
          method: 'PUT',
          path: `/api/charging-piles/${id}`,
          params: JSON.stringify({ id }),
          body: JSON.stringify(data),
          statusCode: 200,
          operationType: OperationType.UPDATE,
          description: `更新充电桩: ${data.pileCode || pile.pileCode}`,
        },
        { transaction: t }
      );

      await t.commit();

      logger.info(`充电桩 ${pile.pileCode} 更新成功`);

      return pile;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async delete(id: number, operatorId?: number) {
    const t: Transaction = await sequelize.transaction();

    try {
      const pile = await ChargingPile.findByPk(id, { transaction: t });

      if (!pile) {
        throw new NotFoundException('充电桩不存在');
      }

      const hasActiveOrder = await pile.countOrders({
        where: {
          status: {
            [Op.in]: ['pending', 'charging', 'paused'],
          },
        },
        transaction: t,
      });

      if (hasActiveOrder > 0) {
        throw new BadRequestException('该充电桩有正在进行的订单，无法删除');
      }

      await pile.destroy({ transaction: t });

      await OperationLog.create(
        {
          userId: operatorId,
          method: 'DELETE',
          path: `/api/charging-piles/${id}`,
          params: JSON.stringify({ id }),
          statusCode: 200,
          operationType: OperationType.DELETE,
          description: `删除充电桩: ${pile.pileCode}`,
        },
        { transaction: t }
      );

      await t.commit();

      logger.info(`充电桩 ${pile.pileCode} 删除成功`);

      return { success: true };
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async batchDelete(ids: number[], operatorId?: number) {
    const t: Transaction = await sequelize.transaction();

    try {
      const piles = await ChargingPile.findAll({
        where: { id: { [Op.in]: ids } },
        transaction: t,
      });

      if (piles.length !== ids.length) {
        throw new NotFoundException('部分充电桩不存在');
      }

      for (const pile of piles) {
        const hasActiveOrder = await pile.countOrders({
          where: {
            status: {
              [Op.in]: ['pending', 'charging', 'paused'],
            },
          },
          transaction: t,
        });

        if (hasActiveOrder > 0) {
          throw new BadRequestException(`充电桩 ${pile.pileCode} 有正在进行的订单，无法删除`);
        }
      }

      await ChargingPile.destroy({
        where: { id: { [Op.in]: ids } },
        transaction: t,
      });

      await OperationLog.create(
        {
          userId: operatorId,
          method: 'DELETE',
          path: '/api/charging-piles/batch',
          body: JSON.stringify({ ids }),
          statusCode: 200,
          operationType: OperationType.BATCH_DELETE_PILE,
          description: `批量删除充电桩: ${piles.map((p) => p.pileCode).join(', ')}`,
        },
        { transaction: t }
      );

      await t.commit();

      logger.info(`批量删除 ${piles.length} 个充电桩成功`);

      return { success: true, deletedCount: piles.length };
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async getById(id: number) {
    const pile = await ChargingPile.findByPk(id, {
      include: [
        {
          model: ChargingSite,
          as: 'site',
          attributes: ['id', 'siteCode', 'name', 'address', 'isOperating'],
        },
      ],
    });

    if (!pile) {
      throw new NotFoundException('充电桩不存在');
    }

    return pile;
  }

  async getList(params: ChargingPileFilterParams) {
    const {
      page = 1,
      pageSize = 10,
      siteId,
      status,
      powerType,
      minPower,
      maxPower,
      keyword,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = params;

    const offset = (page - 1) * pageSize;

    const where: any = {};

    if (siteId) {
      where.siteId = siteId;
    }

    if (status) {
      where.status = status;
    }

    if (powerType) {
      where.powerType = powerType;
    }

    if (minPower !== undefined) {
      where.ratedPower = { ...where.ratedPower, [Op.gte]: minPower };
    }

    if (maxPower !== undefined) {
      where.ratedPower = { ...where.ratedPower, [Op.lte]: maxPower };
    }

    if (keyword) {
      where[Op.or] = [
        { pileCode: { [Op.like]: `%${keyword}%` } },
        { model: { [Op.like]: `%${keyword}%` } },
        { installLocation: { [Op.like]: `%${keyword}%` } },
      ];
    }

    const order: [string, string][] = [[sortBy, sortOrder.toUpperCase()]];

    const { count, rows } = await ChargingPile.findAndCountAll({
      where,
      offset,
      limit: pageSize,
      include: [
        {
          model: ChargingSite,
          as: 'site',
          attributes: ['id', 'siteCode', 'name', 'address', 'isOperating'],
        },
      ],
      order,
    });

    return {
      list: rows,
      total: count,
      page,
      pageSize,
    };
  }

  async getStatistics(params: {
    siteId?: number;
    startDate?: string;
    endDate?: string;
  }) {
    const { siteId, startDate, endDate } = params;

    const where: any = {};

    if (siteId) {
      where.siteId = siteId;
    }

    const statusStats = await ChargingPile.findAll({
      where,
      attributes: ['status', [fn('COUNT', col('id')), 'count']],
      group: ['status'],
      raw: true,
    });

    const powerTypeStats = await ChargingPile.findAll({
      where,
      attributes: ['powerType', [fn('COUNT', col('id')), 'count']],
      group: ['powerType'],
      raw: true,
    });

    const totalPiles = statusStats.reduce((sum, item) => sum + Number((item as any).count), 0);

    return {
      totalPiles,
      statusStats,
      powerTypeStats,
    };
  }

  async getPowerDistribution(siteId?: number) {
    const where: any = {};

    if (siteId) {
      where.siteId = siteId;
    }

    const ranges = [
      { min: 0, max: 20, label: '0-20kW' },
      { min: 20, max: 60, label: '20-60kW' },
      { min: 60, max: 120, label: '60-120kW' },
      { min: 120, max: 250, label: '120-250kW' },
      { min: 250, max: Infinity, label: '250kW+' },
    ];

    const results: any[] = [];

    for (const range of ranges) {
      const count = await ChargingPile.count({
        where: {
          ...where,
          ratedPower: {
            [Op.gte]: range.min,
            ...(range.max !== Infinity && { [Op.lt]: range.max }),
          },
        },
      });

      results.push({
        range: range.label,
        count,
      });
    }

    return results;
  }

  async startMaintenance(id: number, operatorId?: number, remark?: string) {
    const t: Transaction = await sequelize.transaction();

    try {
      const pile = await ChargingPile.findByPk(id, { transaction: t, lock: t.LOCK.UPDATE });

      if (!pile) {
        throw new NotFoundException('充电桩不存在');
      }

      if (pile.status !== ChargingPileStatus.ONLINE && pile.status !== ChargingPileStatus.OFFLINE) {
        throw new BadRequestException('当前状态不支持开始维护');
      }

      const hasActiveOrder = await pile.countOrders({
        where: {
          status: {
            [Op.in]: ['pending', 'charging', 'paused'],
          },
        },
        transaction: t,
      });

      if (hasActiveOrder > 0) {
        throw new BadRequestException('该充电桩有正在进行的订单，无法开始维护');
      }

      await pile.update(
        {
          status: ChargingPileStatus.MAINTENANCE,
          lastMaintenanceTime: new Date(),
        },
        { transaction: t }
      );

      await OperationLog.create(
        {
          userId: operatorId,
          method: 'POST',
          path: `/api/charging-piles/${id}/maintenance/start`,
          params: JSON.stringify({ id }),
          body: JSON.stringify({ remark }),
          statusCode: 200,
          operationType: OperationType.START_MAINTENANCE,
          description: `开始充电桩维护: ${pile.pileCode}, 备注: ${remark || '无'}`,
        },
        { transaction: t }
      );

      await t.commit();

      logger.info(`充电桩 ${pile.pileCode} 开始维护`);

      return pile;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async completeMaintenance(id: number, operatorId?: number, remark?: string) {
    const t: Transaction = await sequelize.transaction();

    try {
      const pile = await ChargingPile.findByPk(id, { transaction: t, lock: t.LOCK.UPDATE });

      if (!pile) {
        throw new NotFoundException('充电桩不存在');
      }

      if (pile.status !== ChargingPileStatus.MAINTENANCE) {
        throw new BadRequestException('充电桩不在维护状态');
      }

      await pile.update(
        {
          status: ChargingPileStatus.OFFLINE,
        },
        { transaction: t }
      );

      await OperationLog.create(
        {
          userId: operatorId,
          method: 'POST',
          path: `/api/charging-piles/${id}/maintenance/complete`,
          params: JSON.stringify({ id }),
          body: JSON.stringify({ remark }),
          statusCode: 200,
          operationType: OperationType.COMPLETE_MAINTENANCE,
          description: `完成充电桩维护: ${pile.pileCode}, 备注: ${remark || '无'}`,
        },
        { transaction: t }
      );

      await t.commit();

      logger.info(`充电桩 ${pile.pileCode} 完成维护`);

      return pile;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async reportFault(id: number, faultDescription: string, operatorId?: number) {
    const t: Transaction = await sequelize.transaction();

    try {
      const pile = await ChargingPile.findByPk(id, { transaction: t, lock: t.LOCK.UPDATE });

      if (!pile) {
        throw new NotFoundException('充电桩不存在');
      }

      if (pile.status === ChargingPileStatus.MAINTENANCE) {
        throw new BadRequestException('充电桩正在维护中');
      }

      await pile.update(
        {
          status: ChargingPileStatus.FAULT,
          faultDescription,
          faultTime: new Date(),
        },
        { transaction: t }
      );

      await OperationLog.create(
        {
          userId: operatorId,
          method: 'POST',
          path: `/api/charging-piles/${id}/fault`,
          params: JSON.stringify({ id }),
          body: JSON.stringify({ faultDescription }),
          statusCode: 200,
          operationType: OperationType.REPORT_FAULT,
          description: `充电桩故障报修: ${pile.pileCode}, 故障原因: ${faultDescription}`,
        },
        { transaction: t }
      );

      await t.commit();

      logger.warn(`充电桩 ${pile.pileCode} 故障报修: ${faultDescription}`);

      return pile;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async fixFault(id: number, operatorId?: number, remark?: string) {
    const t: Transaction = await sequelize.transaction();

    try {
      const pile = await ChargingPile.findByPk(id, { transaction: t, lock: t.LOCK.UPDATE });

      if (!pile) {
        throw new NotFoundException('充电桩不存在');
      }

      if (pile.status !== ChargingPileStatus.FAULT) {
        throw new BadRequestException('充电桩不在故障状态');
      }

      await pile.update(
        {
          status: ChargingPileStatus.OFFLINE,
          faultDescription: null,
          faultTime: null,
        },
        { transaction: t }
      );

      await OperationLog.create(
        {
          userId: operatorId,
          method: 'POST',
          path: `/api/charging-piles/${id}/fix-fault`,
          params: JSON.stringify({ id }),
          body: JSON.stringify({ remark }),
          statusCode: 200,
          operationType: OperationType.UPDATE,
          description: `充电桩故障修复: ${pile.pileCode}, 备注: ${remark || '无'}`,
        },
        { transaction: t }
      );

      await t.commit();

      logger.info(`充电桩 ${pile.pileCode} 故障修复`);

      return pile;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async toggleOnline(id: number, operatorId?: number) {
    const t: Transaction = await sequelize.transaction();

    try {
      const pile = await ChargingPile.findByPk(id, {
        include: [{ model: ChargingSite, as: 'site' }],
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (!pile) {
        throw new NotFoundException('充电桩不存在');
      }

      if (!pile.site?.isOperating) {
        throw new BadRequestException('该站点已停运，无法修改充电桩在线状态');
      }

      if (pile.status === ChargingPileStatus.MAINTENANCE || pile.status === ChargingPileStatus.FAULT) {
        throw new BadRequestException('当前状态不支持切换在线状态');
      }

      const newStatus =
        pile.status === ChargingPileStatus.ONLINE ? ChargingPileStatus.OFFLINE : ChargingPileStatus.ONLINE;

      await pile.update({ status: newStatus }, { transaction: t });

      await OperationLog.create(
        {
          userId: operatorId,
          method: 'POST',
          path: `/api/charging-piles/${id}/toggle-online`,
          params: JSON.stringify({ id }),
          statusCode: 200,
          operationType: OperationType.UPDATE,
          description: `切换充电桩在线状态: ${pile.pileCode} -> ${newStatus}`,
        },
        { transaction: t }
      );

      await t.commit();

      logger.info(`充电桩 ${pile.pileCode} 状态切换为: ${newStatus}`);

      return pile;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }
}

export default new ChargingPileService();
