import CostReport from '../models/CostReport';
import Order from '../models/Order';
import Material from '../models/Material';
import Category from '../models/Category';
import { OrderStatus, MaterialType } from '../types';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { Op } from 'sequelize';
import sequelize from '../config/database';

interface GenerateReportRequest {
  startDate: Date;
  endDate: Date;
  categoryId?: number;
}

interface CostAnalysisResult {
  categoryId: number;
  categoryName: string;
  totalOrders: number;
  totalQuantity: number;
  totalRevenue: number;
  materialCost: number;
  processingCost: number;
  laborCost: number;
  otherCost: number;
  totalCost: number;
  netProfit: number;
  profitMargin: number;
}

export class CostReportService {
  private static calculateCosts(
    totalRevenue: number,
    materialType?: MaterialType
  ): {
    materialCost: number;
    processingCost: number;
    laborCost: number;
    otherCost: number;
    totalCost: number;
    netProfit: number;
    profitMargin: number;
  } {
    let materialRate = 0.4;
    let processingRate = 0.25;
    let laborRate = 0.2;

    if (materialType === MaterialType.CARBON_FIBER) {
      materialRate = 0.5;
      processingRate = 0.2;
      laborRate = 0.15;
    } else if (materialType === MaterialType.ALUMINUM) {
      materialRate = 0.35;
      processingRate = 0.3;
      laborRate = 0.18;
    }

    const otherRate = 0.05;

    const materialCost = totalRevenue * materialRate;
    const processingCost = totalRevenue * processingRate;
    const laborCost = totalRevenue * laborRate;
    const otherCost = totalRevenue * otherRate;
    const totalCost = materialCost + processingCost + laborCost + otherCost;
    const netProfit = totalRevenue - totalCost;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    return {
      materialCost,
      processingCost,
      laborCost,
      otherCost,
      totalCost,
      netProfit,
      profitMargin,
    };
  }

  static async generateReport(data: GenerateReportRequest): Promise<CostReport> {
    if (data.startDate >= data.endDate) {
      throw new BadRequestError('开始日期必须早于结束日期');
    }

    const where: any = {
      createdAt: {
        [Op.between]: [data.startDate, data.endDate],
      },
      status: {
        [Op.in]: [OrderStatus.DELIVERED, OrderStatus.CLOSED],
      },
    };

    if (data.categoryId) {
      const category = await Category.findByPk(data.categoryId);
      if (!category) {
        throw new BadRequestError('配件类目不存在');
      }
      where.categoryId = data.categoryId;
    }

    const orders = await Order.findAll({
      where,
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalOrders'],
        [sequelize.fn('SUM', sequelize.col('quantity')), 'totalQuantity'],
        [sequelize.fn('SUM', sequelize.col('total_amount')), 'totalRevenue'],
      ],
      raw: true,
    });

    const totalOrders = parseInt((orders[0] as any).totalOrders || 0, 10);
    const totalQuantity = parseInt((orders[0] as any).totalQuantity || 0, 10);
    const totalRevenue = parseFloat((orders[0] as any).totalRevenue || 0);

    const costs = this.calculateCosts(totalRevenue);

    const report = await CostReport.create({
      reportDate: data.endDate,
      categoryId: data.categoryId,
      totalOrders,
      totalQuantity,
      ...costs,
    });

    return report;
  }

  static async getById(id: number): Promise<CostReport> {
    const report = await CostReport.findByPk(id, {
      include: [{ model: Category, as: 'category' }],
    });

    if (!report) {
      throw new NotFoundError('报表不存在');
    }

    return report;
  }

  static async getList(
    page: number = 1,
    pageSize: number = 10,
    startDate?: Date,
    endDate?: Date
  ): Promise<{ list: CostReport[]; total: number }> {
    const where: any = {};
    if (startDate && endDate) {
      where.reportDate = { [Op.between]: [startDate, endDate] };
    }

    const { count, rows } = await CostReport.findAndCountAll({
      where,
      offset: (page - 1) * pageSize,
      limit: pageSize,
      order: [['reportDate', 'DESC']],
      include: [{ model: Category, as: 'category' }],
    });

    return { list: rows, total: count };
  }

  static async delete(id: number): Promise<void> {
    const report = await CostReport.findByPk(id);
    if (!report) {
      throw new NotFoundError('报表不存在');
    }

    await report.destroy();
  }

  static async getSummary(startDate: Date, endDate: Date): Promise<any> {
    if (startDate >= endDate) {
      throw new BadRequestError('开始日期必须早于结束日期');
    }

    const where: any = {
      reportDate: {
        [Op.between]: [startDate, endDate],
      },
    };

    const reports = await CostReport.findAll({
      where,
      attributes: [
        [sequelize.fn('SUM', sequelize.col('total_orders')), 'totalOrders'],
        [sequelize.fn('SUM', sequelize.col('total_quantity')), 'totalQuantity'],
        [sequelize.fn('SUM', sequelize.col('material_cost')), 'totalMaterialCost'],
        [sequelize.fn('SUM', sequelize.col('processing_cost')), 'totalProcessingCost'],
        [sequelize.fn('SUM', sequelize.col('labor_cost')), 'totalLaborCost'],
        [sequelize.fn('SUM', sequelize.col('other_cost')), 'totalOtherCost'],
        [sequelize.fn('SUM', sequelize.col('total_cost')), 'totalCost'],
        [sequelize.fn('SUM', sequelize.col('total_revenue')), 'totalRevenue'],
        [sequelize.fn('SUM', sequelize.col('net_profit')), 'netProfit'],
      ],
      raw: true,
    });

    const summary = reports[0] as any;
    const profitMargin = summary.totalRevenue > 0
      ? (summary.netProfit / summary.totalRevenue) * 100
      : 0;

    const totalReports = await CostReport.count({ where });

    return {
      totalReports,
      totalOrders: parseInt(summary.totalOrders || 0, 10),
      totalQuantity: parseInt(summary.totalQuantity || 0, 10),
      totalMaterialCost: parseFloat(summary.totalMaterialCost || 0),
      totalProcessingCost: parseFloat(summary.totalProcessingCost || 0),
      totalLaborCost: parseFloat(summary.totalLaborCost || 0),
      totalOtherCost: parseFloat(summary.totalOtherCost || 0),
      totalCost: parseFloat(summary.totalCost || 0),
      totalRevenue: parseFloat(summary.totalRevenue || 0),
      netProfit: parseFloat(summary.netProfit || 0),
      profitMargin,
    };
  }

  static async getCategoryAnalysis(
    startDate: Date,
    endDate: Date
  ): Promise<CostAnalysisResult[]> {
    if (startDate >= endDate) {
      throw new BadRequestError('开始日期必须早于结束日期');
    }

    const categories = await Category.findAll({ where: { isActive: true } });
    const results: CostAnalysisResult[] = [];

    for (const category of categories) {
      const orders = await Order.findAll({
        where: {
          createdAt: { [Op.between]: [startDate, endDate] },
          status: { [Op.in]: [OrderStatus.DELIVERED, OrderStatus.CLOSED] },
          categoryId: category.id,
        },
        attributes: [
          [sequelize.fn('COUNT', sequelize.col('id')), 'totalOrders'],
          [sequelize.fn('SUM', sequelize.col('quantity')), 'totalQuantity'],
          [sequelize.fn('SUM', sequelize.col('total_amount')), 'totalRevenue'],
        ],
        raw: true,
      });

      const totalOrders = parseInt((orders[0] as any).totalOrders || 0, 10);
      const totalQuantity = parseInt((orders[0] as any).totalQuantity || 0, 10);
      const totalRevenue = parseFloat((orders[0] as any).totalRevenue || 0);

      const costs = this.calculateCosts(totalRevenue);

      results.push({
        categoryId: category.id,
        categoryName: category.name,
        totalOrders,
        totalQuantity,
        totalRevenue,
        ...costs,
      });
    }

    return results.sort((a, b) => b.totalRevenue - a.totalRevenue);
  }

  static async getMaterialAnalysis(
    startDate: Date,
    endDate: Date
  ): Promise<any[]> {
    if (startDate >= endDate) {
      throw new BadRequestError('开始日期必须早于结束日期');
    }

    const materialStats = await Material.findAll({
      attributes: [
        'type',
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalMaterials'],
        [sequelize.fn('SUM', sequelize.col('quantity')), 'totalQuantity'],
        [sequelize.fn('SUM', sequelize.literal('quantity * unit_cost')), 'totalValue'],
      ],
      where: {
        receivedDate: { [Op.between]: [startDate, endDate] },
      },
      group: ['type'],
      raw: true,
    });

    return materialStats.map((stat: any) => ({
      type: stat.type,
      totalMaterials: parseInt(stat.totalMaterials, 10),
      totalQuantity: parseFloat(stat.totalQuantity),
      totalValue: parseFloat(stat.totalValue),
    }));
  }
}
