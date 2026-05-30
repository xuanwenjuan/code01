import { Request, Response } from 'express';
import { CostLedger, WorkOrder, WorkOrderMaterial, sequelize, MaterialCategory, MaterialWaste } from '../models';
import { success, badRequest, notFound } from '../utils/response';
import { generateLedgerNo } from '../utils/batchNo';
import { UserRole } from '../types';
import { Op } from 'sequelize';
import dayjs from 'dayjs';

export async function generateLedger(req: Request, res: Response) {
  const { workOrderId, categoryId, statisticsDate, remark } = req.body;

  if (!workOrderId && !categoryId) {
    return res.status(400).json(badRequest('工单ID或类目ID必填其一'));
  }

  const ledgerNo = generateLedgerNo();

  let materialCost = 0;
  let wasteCost = 0;
  let laborCost = 0;
  let bookName = '';
  let categoryName = '';

  if (workOrderId) {
    const order = await WorkOrder.findByPk(workOrderId);
    if (!order) {
      return res.status(404).json(notFound('工单不存在'));
    }
    bookName = order.bookName;

    const materials = await WorkOrderMaterial.findAll({
      where: { workOrderId }
    });
    materialCost = materials.reduce((sum, m) => sum + Number(m.totalPrice), 0);

    const wastes = await MaterialWaste.findAll({
      where: { workOrderId, isVerified: true }
    });
    wasteCost = wastes.reduce((sum, w) => sum + Number(w.totalCost), 0);

    laborCost = Number(order.quantity) * 50;
  } else if (categoryId) {
    const category = await MaterialCategory.findByPk(categoryId);
    if (!category) {
      return res.status(404).json(notFound('物料类目不存在'));
    }
    categoryName = category.name;

    const materials = await WorkOrderMaterial.findAll({
      where: { categoryId }
    });
    materialCost = materials.reduce((sum, m) => sum + Number(m.totalPrice), 0);

    const wastes = await MaterialWaste.findAll({
      where: { categoryId, isVerified: true }
    });
    wasteCost = wastes.reduce((sum, w) => sum + Number(w.totalCost), 0);
  }

  const totalCost = materialCost + wasteCost + laborCost;

  const ledger = await CostLedger.create({
    ledgerNo,
    workOrderId,
    categoryId,
    bookName,
    categoryName,
    materialCost,
    wasteCost,
    laborCost,
    totalCost,
    statisticsDate: statisticsDate || new Date(),
    remark,
    operatorId: req.user?.userId
  });

  res.json(success(ledger, '台账生成成功'));
}

export async function getLedgerList(req: Request, res: Response) {
  const { workOrderId, categoryId, startDate, endDate, page = 1, pageSize = 10 } = req.query;

  const where: any = {};
  if (workOrderId) {
    where.workOrderId = workOrderId;
  }
  if (categoryId) {
    where.categoryId = categoryId;
  }
  if (startDate && endDate) {
    where.statisticsDate = {
      [Op.between]: [new Date(startDate as string), new Date(endDate as string)]
    };
  }

  const { count, rows } = await CostLedger.findAndCountAll({
    where,
    order: [['statisticsDate', 'DESC']],
    limit: Number(pageSize),
    offset: (Number(page) - 1) * Number(pageSize)
  });

  res.json(success({
    list: rows,
    total: count,
    page: Number(page),
    pageSize: Number(pageSize)
  }));
}

export async function getLedgerDetail(req: Request, res: Response) {
  const { id } = req.params;

  const ledger = await CostLedger.findByPk(id);
  if (!ledger) {
    return res.status(404).json(notFound('台账不存在'));
  }

  res.json(success(ledger));
}

export async function deleteLedger(req: Request, res: Response) {
  const { id } = req.params;

  const count = await CostLedger.count({ where: { id } });
  if (count === 0) {
    return res.status(404).json(notFound('台账不存在'));
  }

  await CostLedger.destroy({ where: { id } });
  res.json(success(null, '删除成功'));
}

export async function getCostStatistics(req: Request, res: Response) {
  const { startDate, endDate, groupBy = 'month' } = req.query;

  const where: any = {};
  if (startDate && endDate) {
    where.statisticsDate = {
      [Op.between]: [new Date(startDate as string), new Date(endDate as string)]
    };
  }

  let groupField: any;
  switch (groupBy) {
    case 'day':
      groupField = sequelize.fn('DATE', sequelize.col('statisticsDate'));
      break;
    case 'month':
      groupField = sequelize.fn('DATE_FORMAT', sequelize.col('statisticsDate'), '%Y-%m');
      break;
    case 'year':
      groupField = sequelize.fn('YEAR', sequelize.col('statisticsDate'));
      break;
    default:
      groupField = sequelize.fn('DATE_FORMAT', sequelize.col('statisticsDate'), '%Y-%m');
  }

  const stats = await CostLedger.findAll({
    attributes: [
      [groupField, 'period'],
      [sequelize.fn('SUM', sequelize.col('materialCost')), 'totalMaterialCost'],
      [sequelize.fn('SUM', sequelize.col('wasteCost')), 'totalWasteCost'],
      [sequelize.fn('SUM', sequelize.col('laborCost')), 'totalLaborCost'],
      [sequelize.fn('SUM', sequelize.col('totalCost')), 'totalCost'],
      [sequelize.fn('COUNT', sequelize.col('id')), 'count']
    ],
    where,
    group: ['period'],
    order: [['period', 'DESC']]
  });

  const summary = await CostLedger.findAll({
    attributes: [
      [sequelize.fn('SUM', sequelize.col('materialCost')), 'totalMaterialCost'],
      [sequelize.fn('SUM', sequelize.col('wasteCost')), 'totalWasteCost'],
      [sequelize.fn('SUM', sequelize.col('laborCost')), 'totalLaborCost'],
      [sequelize.fn('SUM', sequelize.col('totalCost')), 'totalCost'],
      [sequelize.fn('COUNT', sequelize.col('id')), 'count']
    ],
    where
  });

  res.json(success({ stats, summary: summary[0] }));
}

export async function getOrderCostComparison(req: Request, res: Response) {
  const orders = await WorkOrder.findAll({
    limit: 20,
    order: [['createdAt', 'DESC']]
  });

  const result = [];
  for (const order of orders) {
    const materials = await WorkOrderMaterial.findAll({
      where: { workOrderId: order.id }
    });
    const materialCost = materials.reduce((sum, m) => sum + Number(m.totalPrice), 0);

    const wastes = await MaterialWaste.findAll({
      where: { workOrderId: order.id, isVerified: true }
    });
    const wasteCost = wastes.reduce((sum, w) => sum + Number(w.totalCost), 0);

    const laborCost = Number(order.quantity) * 50;
    const totalCost = materialCost + wasteCost + laborCost;

    result.push({
      orderNo: order.orderNo,
      bookName: order.bookName,
      quantity: order.quantity,
      status: order.status,
      materialCost,
      wasteCost,
      laborCost,
      totalCost,
      unitCost: order.quantity > 0 ? totalCost / order.quantity : 0
    });
  }

  res.json(success(result));
}

export async function getCategoryCostAnalysis(req: Request, res: Response) {
  const categories = await MaterialCategory.findAll({ where: { level: 1 } });

  const result = [];
  for (const category of categories) {
    const materials = await WorkOrderMaterial.findAll({
      where: { categoryId: category.id }
    });
    const totalMaterialCost = materials.reduce((sum, m) => sum + Number(m.totalPrice), 0);

    const wastes = await MaterialWaste.findAll({
      where: { categoryId: category.id, isVerified: true }
    });
    const totalWasteCost = wastes.reduce((sum, w) => sum + Number(w.totalCost), 0);

    const usageCount = materials.length;

    result.push({
      categoryId: category.id,
      categoryName: category.name,
      categoryCode: category.code,
      status: category.status,
      totalMaterialCost,
      totalWasteCost,
      totalCost: totalMaterialCost + totalWasteCost,
      usageCount,
      avgCost: usageCount > 0 ? (totalMaterialCost + totalWasteCost) / usageCount : 0
    });
  }

  result.sort((a, b) => b.totalCost - a.totalCost);
  res.json(success(result));
}

export async function getMaterialConsumptionTrend(req: Request, res: Response) {
  const { days = 30 } = req.query;
  const startDate = dayjs().subtract(Number(days), 'day').toDate();

  const materials = await WorkOrderMaterial.findAll({
    where: {
      createdAt: { [Op.gte]: startDate }
    },
    include: [{ model: MaterialCategory, attributes: ['name'] }],
    order: [['createdAt', 'ASC']]
  });

  const dailyData: Record<string, any> = {};
  materials.forEach(m => {
    const date = dayjs(m.createdAt).format('YYYY-MM-DD');
    if (!dailyData[date]) {
      dailyData[date] = { date, totalMaterialCost: 0, totalWasteCost: 0, count: 0 };
    }
    dailyData[date].totalMaterialCost += Number(m.totalPrice);
    dailyData[date].count++;
  });

  const wastes = await MaterialWaste.findAll({
    where: {
      createdAt: { [Op.gte]: startDate },
      isVerified: true
    }
  });

  wastes.forEach(w => {
    const date = dayjs(w.createdAt).format('YYYY-MM-DD');
    if (!dailyData[date]) {
      dailyData[date] = { date, totalMaterialCost: 0, totalWasteCost: 0, count: 0 };
    }
    dailyData[date].totalWasteCost += Number(w.totalCost);
  });

  const trend = Object.values(dailyData).sort((a, b) => a.date.localeCompare(b.date));

  res.json(success({
    trend,
    totalMaterialCost: trend.reduce((sum, d) => sum + d.totalMaterialCost, 0),
    totalWasteCost: trend.reduce((sum, d) => sum + d.totalWasteCost, 0),
    totalCount: trend.reduce((sum, d) => sum + d.count, 0)
  }));
}

export async function getCostOverview(req: Request, res: Response) {
  const now = dayjs();
  const currentMonthStart = now.startOf('month').toDate();
  const lastMonthStart = now.subtract(1, 'month').startOf('month').toDate();
  const lastMonthEnd = now.subtract(1, 'month').endOf('month').toDate();

  const [currentMonthStats, lastMonthStats] = await Promise.all([
    CostLedger.findAll({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('materialCost')), 'materialCost'],
        [sequelize.fn('SUM', sequelize.col('wasteCost')), 'wasteCost'],
        [sequelize.fn('SUM', sequelize.col('laborCost')), 'laborCost'],
        [sequelize.fn('SUM', sequelize.col('totalCost')), 'totalCost']
      ],
      where: { statisticsDate: { [Op.gte]: currentMonthStart } }
    }),
    CostLedger.findAll({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('materialCost')), 'materialCost'],
        [sequelize.fn('SUM', sequelize.col('wasteCost')), 'wasteCost'],
        [sequelize.fn('SUM', sequelize.col('laborCost')), 'laborCost'],
        [sequelize.fn('SUM', sequelize.col('totalCost')), 'totalCost']
      ],
      where: {
        statisticsDate: {
          [Op.between]: [lastMonthStart, lastMonthEnd]
        }
      }
    })
  ]);

  const categoryCosts = await CostLedger.findAll({
    attributes: [
      'categoryId',
      'categoryName',
      [sequelize.fn('SUM', sequelize.col('totalCost')), 'totalCost']
    ],
    where: { categoryId: { [Op.not]: null } },
    group: ['categoryId', 'categoryName'],
    limit: 10
  });

  const orderCosts = await CostLedger.findAll({
    attributes: [
      'workOrderId',
      'bookName',
      'totalCost'
    ],
    where: { workOrderId: { [Op.not]: null } },
    order: [['totalCost', 'DESC']],
    limit: 10
  });

  res.json(success({
    currentMonth: currentMonthStats[0],
    lastMonth: lastMonthStats[0],
    categoryRanking: categoryCosts,
    orderRanking: orderCosts
  }));
}
