import { Op, Transaction } from 'sequelize';
import { CommissionTier, CommissionTierType } from '../database/models/commissionTier.model';
import { Distributor, DistributorLevel } from '../database/models/distributor.model';
import { AppError } from '../utils/error';
import sequelize from '../database';
import { startOfMonth, endOfMonth } from 'date-fns';

export class CommissionTierService {
  async create(data: Partial<CommissionTier>) {
    const tier = await CommissionTier.create(data);
    return tier;
  }

  async update(id: number, data: Partial<CommissionTier>) {
    const tier = await CommissionTier.findByPk(id);
    if (!tier) {
      throw new AppError('佣金梯度不存在', 404);
    }
    await tier.update(data);
    return tier;
  }

  async delete(id: number) {
    const tier = await CommissionTier.findByPk(id);
    if (!tier) {
      throw new AppError('佣金梯度不存在', 404);
    }
    await tier.destroy();
  }

  async getById(id: number) {
    const tier = await CommissionTier.findByPk(id, {
      include: [Distributor],
    });
    if (!tier) {
      throw new AppError('佣金梯度不存在', 404);
    }
    return tier;
  }

  async getList(query: any = {}) {
    const { page = 1, pageSize = 10, distributorId, tierType, enabled } = query;
    const where: any = {};

    if (distributorId !== undefined) {
      where.distributorId = distributorId === 'null' ? null : distributorId;
    }
    if (tierType) {
      where.tierType = tierType;
    }
    if (enabled !== undefined) {
      where.enabled = enabled;
    }

    const { count, rows } = await CommissionTier.findAndCountAll({
      where,
      include: [Distributor],
      order: [
        ['sortOrder', 'ASC'],
        ['minThreshold', 'ASC'],
      ],
      offset: (page - 1) * pageSize,
      limit: pageSize,
    });

    return {
      list: rows,
      total: count,
      page: Number(page),
      pageSize: Number(pageSize),
    };
  }

  async getApplicableTier(
    distributorId: number,
    tierType: CommissionTierType,
    value: number
  ): Promise<CommissionTier | null> {
    const tiers = await CommissionTier.findAll({
      where: {
        [Op.or]: [{ distributorId }, { distributorId: null }],
        tierType,
        enabled: true,
        minThreshold: { [Op.lte]: value },
      },
      order: [
        ['distributorId', 'DESC'],
        ['minThreshold', 'DESC'],
      ],
      limit: 1,
    });

    return tiers[0] || null;
  }

  async calculateDistributorCommissionRate(distributor: Distributor): Promise<number> {
    const monthlyAmountTier = await this.getApplicableTier(
      distributor.id,
      CommissionTierType.MONTHLY_AMOUNT,
      distributor.monthlySales
    );
    if (monthlyAmountTier) {
      return monthlyAmountTier.commissionRate;
    }

    const totalAmountTier = await this.getApplicableTier(
      distributor.id,
      CommissionTierType.TOTAL_AMOUNT,
      distributor.totalSales
    );
    if (totalAmountTier) {
      return totalAmountTier.commissionRate;
    }

    const orderCountTier = await this.getApplicableTier(
      distributor.id,
      CommissionTierType.ORDER_COUNT,
      distributor.totalOrders
    );
    if (orderCountTier) {
      return orderCountTier.commissionRate;
    }

    return distributor.baseCommissionRate;
  }

  async updateDistributorStats(
    distributorId: number,
    orderAmount: number,
    t?: Transaction
  ) {
    const distributor = await Distributor.findByPk(distributorId, { transaction: t });
    if (!distributor) {
      throw new AppError('分销商不存在', 404);
    }

    await distributor.increment(
      {
        totalSales: orderAmount,
        monthlySales: orderAmount,
        totalOrders: 1,
      },
      { transaction: t }
    );

    await distributor.reload({ transaction: t });

    const newCommissionRate = await this.calculateDistributorCommissionRate(distributor);
    const newLevel = this.calculateDistributorLevel(distributor.totalSales);

    await distributor.update(
      {
        commissionRate: newCommissionRate,
        level: newLevel,
      },
      { transaction: t }
    );

    return distributor;
  }

  calculateDistributorLevel(totalSales: number): DistributorLevel {
    if (totalSales >= 500000) {
      return DistributorLevel.DIAMOND;
    } else if (totalSales >= 200000) {
      return DistributorLevel.PLATINUM;
    } else if (totalSales >= 100000) {
      return DistributorLevel.GOLD;
    } else if (totalSales >= 50000) {
      return DistributorLevel.SILVER;
    }
    return DistributorLevel.BRONZE;
  }

  async resetMonthlySales(date?: Date) {
    const t = await sequelize.transaction();
    try {
      await Distributor.update(
        { monthlySales: 0 },
        { where: {}, transaction: t }
      );
      await t.commit();
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async getStatistics(distributorId?: number) {
    const where: any = {};
    if (distributorId) {
      where.distributorId = distributorId;
    }

    const tiers = await CommissionTier.findAll({ where });
    const groupedByType = tiers.reduce((acc, tier) => {
      const type = tier.tierType;
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(tier);
      return acc;
    }, {} as Record<string, CommissionTier[]>);

    return {
      totalTiers: tiers.length,
      enabledTiers: tiers.filter(t => t.enabled).length,
      byType: groupedByType,
    };
  }
}

export const commissionTierService = new CommissionTierService();
