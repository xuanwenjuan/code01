import { CostRecord, ApplicationItem, ForageApplication, ForageCategory, Stable } from '../models';
import { Op, fn, col, literal, QueryTypes } from 'sequelize';
import dayjs from 'dayjs';
import { sequelize } from '../database';

export interface CostReportQuery {
  startDate?: Date;
  endDate?: Date;
  categoryId?: number;
  stableId?: number;
  type: 'daily' | 'monthly' | 'yearly';
}

class CostService {
  async generateDailyReport(date?: Date) {
    const reportDate = date || new Date();
    const startOfDay = dayjs(reportDate).startOf('day').toDate();
    const endOfDay = dayjs(reportDate).endOf('day').toDate();

    const t = await sequelize.transaction();
    
    try {
      await CostRecord.destroy({
        where: {
          recordDate: { [Op.between]: [startOfDay, endOfDay] },
          type: 'daily'
        },
        transaction: t
      });

      const completedItems = await ApplicationItem.findAll({
        include: [
          {
            model: ForageApplication,
            as: 'application',
            where: {
              status: 'completed',
              completedAt: { [Op.between]: [startOfDay, endOfDay] }
            },
            include: [{ model: Stable, as: 'stable' }]
          },
          { model: ForageCategory, as: 'category' }
        ],
        transaction: t
      });

      const costByCategory = new Map<number, { consumption: number; damage: number; unitPrice: number; stableId?: number }>();
      
      for (const item of completedItems) {
        const categoryId = item.categoryId;
        const stableId = item.application?.stableId;
        const actualQuantity = Number(item.actualQuantity || 0);
        const damagedQuantity = Number(item.damagedQuantity || 0);
        const returnedQuantity = Number(item.returnedQuantity || 0);
        const consumedQuantity = actualQuantity - returnedQuantity - damagedQuantity;
        
        const unitPrice = Number(item.category?.unitPrice || 0);

        const key = `${categoryId}_${stableId || 'all'}`;
        
        if (!costByCategory.has(key)) {
          costByCategory.set(key, { consumption: 0, damage: 0, unitPrice, stableId });
        }
        const categoryData = costByCategory.get(key)!;
        categoryData.consumption += consumedQuantity;
        categoryData.damage += damagedQuantity;
      }

      const records = [];
      for (const [, data] of costByCategory) {
        const totalCost = data.consumption * data.unitPrice;
        const lossCost = data.damage * data.unitPrice;
        
        const record = await CostRecord.create({
          recordDate: reportDate,
          categoryId: data.stableId ? data.stableId : undefined,
          stableId: data.stableId,
          consumptionQuantity: data.consumption,
          avgUnitPrice: data.unitPrice,
          totalCost,
          lossQuantity: data.damage,
          lossCost,
          type: 'daily'
        }, { transaction: t });
        records.push(record);
      }

      await t.commit();
      return records;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async generateMonthlyReport(year: number, month: number) {
    const startDate = dayjs(`${year}-${month}-01`).startOf('month').toDate();
    const endDate = dayjs(`${year}-${month}-01`).endOf('month').toDate();

    const t = await sequelize.transaction();
    
    try {
      await CostRecord.destroy({
        where: {
          recordDate: { [Op.between]: [startDate, endDate] },
          type: 'monthly'
        },
        transaction: t
      });

      const dailyRecords = await CostRecord.findAll({
        where: {
          recordDate: { [Op.between]: [startDate, endDate] },
          type: 'daily'
        },
        transaction: t
      });

      const monthlyByCategory = new Map<number, { consumption: number; damage: number; totalCost: number; lossCost: number; unitPrices: number[]; stableId?: number }>();

      for (const record of dailyRecords) {
        const key = `${record.categoryId}_${record.stableId || 'all'}`;
        
        if (!monthlyByCategory.has(key)) {
          monthlyByCategory.set(key, {
            consumption: 0,
            damage: 0,
            totalCost: 0,
            lossCost: 0,
            unitPrices: [],
            stableId: record.stableId
          });
        }
        
        const data = monthlyByCategory.get(key)!;
        data.consumption += Number(record.consumptionQuantity || 0);
        data.damage += Number(record.lossQuantity || 0);
        data.totalCost += Number(record.totalCost || 0);
        data.lossCost += Number(record.lossCost || 0);
        if (record.avgUnitPrice) data.unitPrices.push(Number(record.avgUnitPrice));
      }

      const records = [];
      for (const [, data] of monthlyByCategory) {
        const avgUnitPrice = data.unitPrices.length > 0 
          ? data.unitPrices.reduce((a, b) => a + b, 0) / data.unitPrices.length 
          : 0;

        const record = await CostRecord.create({
          recordDate: startDate,
          categoryId: data.stableId ? data.stableId : undefined,
          stableId: data.stableId,
          consumptionQuantity: data.consumption,
          avgUnitPrice,
          totalCost: data.totalCost,
          lossQuantity: data.damage,
          lossCost: data.lossCost,
          type: 'monthly'
        }, { transaction: t });
        records.push(record);
      }

      await t.commit();
      return records;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async getCostReport(query: CostReportQuery) {
    const where: any = { type: query.type };
    
    if (query.startDate && query.endDate) {
      where.recordDate = { [Op.between]: [query.startDate, query.endDate] };
    }
    
    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }
    
    if (query.stableId) {
      where.stableId = query.stableId;
    }

    const records = await CostRecord.findAll({
      where,
      include: [
        { model: ForageCategory, as: 'category' },
        { model: Stable, as: 'stable' }
      ],
      order: [['recordDate', 'DESC']]
    });

    const summary = await CostRecord.findOne({
      where,
      attributes: [
        [fn('SUM', col('consumptionQuantity')), 'totalConsumption'],
        [fn('SUM', col('totalCost')), 'totalCost'],
        [fn('SUM', col('lossQuantity')), 'totalLossQuantity'],
        [fn('SUM', col('lossCost')), 'totalLossCost'],
        [fn('AVG', col('avgUnitPrice')), 'avgPrice']
      ]
    });

    return {
      records,
      summary: summary?.toJSON()
    };
  }

  async getCategoryConsumptionStats(startDate: Date, endDate: Date) {
    const stats = await CostRecord.findAll({
      where: {
        recordDate: { [Op.between]: [startDate, endDate] },
        categoryId: { [Op.ne]: null }
      },
      attributes: [
        'categoryId',
        [fn('SUM', col('consumptionQuantity')), 'totalConsumption'],
        [fn('SUM', col('totalCost')), 'totalCost'],
        [fn('SUM', col('lossQuantity')), 'totalLoss'],
        [fn('SUM', col('lossCost')), 'totalLossCost']
      ],
      include: [{ model: ForageCategory, as: 'category' }],
      group: ['categoryId'],
      order: [[literal('totalConsumption'), 'DESC']]
    });

    return stats;
  }

  async getStableCostStats(startDate: Date, endDate: Date) {
    const stats = await CostRecord.findAll({
      where: {
        recordDate: { [Op.between]: [startDate, endDate] },
        stableId: { [Op.ne]: null }
      },
      attributes: [
        'stableId',
        [fn('SUM', col('consumptionQuantity')), 'totalConsumption'],
        [fn('SUM', col('totalCost')), 'totalCost'],
        [fn('SUM', col('lossQuantity')), 'totalLoss'],
        [fn('SUM', col('lossCost')), 'totalLossCost']
      ],
      include: [{ model: Stable, as: 'stable' }],
      group: ['stableId'],
      order: [[literal('totalCost'), 'DESC']]
    });

    return stats;
  }

  async getMonthlyTrend(year: number) {
    const startDate = dayjs(`${year}-01-01`).toDate();
    const endDate = dayjs(`${year}-12-31`).toDate();

    const trend = await CostRecord.findAll({
      where: {
        recordDate: { [Op.between]: [startDate, endDate] },
        type: 'monthly'
      },
      attributes: [
        [fn('MONTH', col('recordDate')), 'month'],
        [fn('SUM', col('totalCost')), 'totalCost'],
        [fn('SUM', col('lossCost')), 'lossCost'],
        [fn('SUM', col('consumptionQuantity')), 'totalConsumption']
      ],
      group: [fn('MONTH', col('recordDate'))],
      order: [[literal('month'), 'ASC']]
    });

    return trend;
  }

  async getCostAnalysis(startDate: Date, endDate: Date) {
    const categoryStats = await this.getCategoryConsumptionStats(startDate, endDate);
    const stableStats = await this.getStableCostStats(startDate, endDate);

    const totalCost = categoryStats.reduce((sum, stat: any) => sum + Number(stat.toJSON().totalCost || 0), 0);
    const totalLoss = categoryStats.reduce((sum, stat: any) => sum + Number(stat.toJSON().totalLossCost || 0), 0);
    const totalConsumption = categoryStats.reduce((sum, stat: any) => sum + Number(stat.toJSON().totalConsumption || 0), 0);

    const lossRate = totalCost > 0 ? (totalLoss / totalCost * 100).toFixed(2) : '0';

    return {
      period: { startDate, endDate },
      summary: {
        totalCost,
        totalLoss,
        totalConsumption,
        lossRate: Number(lossRate)
      },
      byCategory: categoryStats,
      byStable: stableStats
    };
  }

  async getInventoryValuation() {
    const valuation = await sequelize.query(`
      SELECT 
        c.id as categoryId,
        c.name as categoryName,
        c.type as categoryType,
        i.quantity as quantity,
        i.unitPrice as unitPrice,
        i.totalValue as totalValue,
        i.warningThreshold as warningThreshold
      FROM forage_categories c
      LEFT JOIN forage_inventories i ON c.id = i.categoryId
      WHERE c.status = 'active'
      ORDER BY i.totalValue DESC
    `, { type: QueryTypes.SELECT });

    const totalValue = valuation.reduce((sum: number, item: any) => sum + Number(item.totalValue || 0), 0);

    return {
      valuation,
      totalValue
    };
  }

  async getLowStockAlerts() {
    const alerts = await sequelize.query(`
      SELECT 
        c.id as categoryId,
        c.name as categoryName,
        c.type as categoryType,
        i.quantity as currentQuantity,
        i.warningThreshold as warningThreshold,
        i.unitPrice as unitPrice,
        i.totalValue as totalValue
      FROM forage_categories c
      LEFT JOIN forage_inventories i ON c.id = i.categoryId
      WHERE c.status = 'active' 
        AND i.quantity <= i.warningThreshold
      ORDER BY i.quantity ASC
    `, { type: QueryTypes.SELECT });

    return alerts;
  }
}

export const costService = new CostService();
