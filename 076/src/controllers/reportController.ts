import { Request, Response } from 'express';
import { Op, fn, col, literal } from 'sequelize';
import { Order, SalesReport, Product, Recipe, RecipeItem, Ingredient, Store } from '../models';
import { ResponseUtil } from '../utils/response';
import { OrderStatus, UserRole } from '../types';
import ExcelJS from 'exceljs';
import { NotFoundException, ForbiddenException, BadRequestException } from '../exceptions/HttpException';

export const generateDailyReport = async (req: Request, res: Response) => {
  const { date, storeId } = req.body;

  if (!date) {
    throw new BadRequestException('请指定报表日期');
  }

  const reportDate = new Date(date);
  const startOfDay = new Date(reportDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(reportDate);
  endOfDay.setHours(23, 59, 59, 999);

  const storeIds = req.user?.role === UserRole.SUPER_ADMIN && storeId 
    ? [storeId] 
    : (req.user?.storeId ? [req.user.storeId] : null);

  if (!storeIds && !storeId) {
    throw new BadRequestException('请指定门店');
  }

  const orders = await Order.findAll({
    where: {
      storeId: storeIds ? storeIds[0] : storeId,
      status: OrderStatus.COMPLETED,
      createdAt: { [Op.between]: [startOfDay, endOfDay] }
    },
    include: [{ model: Product, as: 'product' }]
  });

  const materialCost = await calculateMaterialCost(orders);
  const totalSales = orders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
  const orderCount = orders.length;
  const laborCost = orderCount * 15;
  const netProfit = totalSales - materialCost - laborCost;

  const productSales = await Order.findAll({
    where: {
      storeId: storeIds ? storeIds[0] : storeId,
      status: OrderStatus.COMPLETED,
      createdAt: { [Op.between]: [startOfDay, endOfDay] }
    },
    attributes: [
      'productId',
      'productName',
      [fn('COUNT', '*'), 'count'],
      [fn('SUM', col('totalAmount')), 'total']
    ],
    group: ['productId', 'productName'],
    order: [[literal('count'), 'DESC']],
    limit: 10
  });

  const report = await SalesReport.create({
    storeId: storeIds ? storeIds[0] : storeId,
    reportDate,
    orderCount,
    totalSales,
    materialCost,
    laborCost,
    netProfit,
    topProducts: JSON.stringify(productSales)
  });

  res.status(201).json(ResponseUtil.created(report, '日报表生成成功'));
};

const calculateMaterialCost = async (orders: any[]): Promise<number> => {
  let totalCost = 0;

  for (const order of orders) {
    const recipe = await Recipe.findOne({
      where: {
        productId: order.productId,
        status: 'active'
      }
    });

    if (recipe) {
      const recipeItems = await RecipeItem.findAll({
        where: { recipeId: recipe.id },
        include: [{ model: Ingredient, as: 'ingredient' }]
      });

      const productCost = recipeItems.reduce((sum, item) => {
        const ingredientCost = Number(item.quantity) * Number(item.ingredient?.unitPrice || 0);
        return sum + ingredientCost;
      }, 0);

      totalCost += productCost * order.quantity;
    } else {
      totalCost += order.totalAmount * 0.3;
    }
  }

  return totalCost;
};

export const getSalesReport = async (req: Request, res: Response) => {
  const { startDate, endDate, storeId, page = 1, pageSize = 10 } = req.query;

  const where: any = {};

  if (startDate && endDate) {
    where.reportDate = {
      [Op.between]: [new Date(startDate as string), new Date(endDate as string)]
    };
  }

  if (req.user?.role === UserRole.SUPER_ADMIN && storeId) {
    where.storeId = storeId;
  } else if (req.user?.storeId) {
    where.storeId = req.user.storeId;
  } else if (req.user?.role !== UserRole.SUPER_ADMIN) {
    throw new ForbiddenException('无权访问此数据');
  }

  const { count, rows } = await SalesReport.findAndCountAll({
    where,
    include: [{ model: Store, as: 'reportStore' }],
    order: [['reportDate', 'DESC']],
    limit: Number(pageSize),
    offset: (Number(page) - 1) * Number(pageSize)
  });

  res.json(ResponseUtil.pagination(rows, count, Number(page), Number(pageSize)));
};

export const exportSalesReport = async (req: Request, res: Response) => {
  const { startDate, endDate, storeId } = req.query;

  const where: any = {};

  if (startDate && endDate) {
    where.reportDate = {
      [Op.between]: [new Date(startDate as string), new Date(endDate as string)]
    };
  }

  if (req.user?.role === UserRole.SUPER_ADMIN && storeId) {
    where.storeId = storeId;
  } else if (req.user?.storeId) {
    where.storeId = req.user.storeId;
  } else if (req.user?.role !== UserRole.SUPER_ADMIN) {
    throw new ForbiddenException('无权访问此数据');
  }

  const reports = await SalesReport.findAll({
    where,
    include: [{ model: Store, as: 'reportStore' }],
    order: [['reportDate', 'ASC']]
  });

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('销售报表');

  worksheet.columns = [
    { header: '日期', key: 'date', width: 15 },
    { header: '门店', key: 'store', width: 20 },
    { header: '订单数量', key: 'orderCount', width: 12 },
    { header: '总销售额', key: 'totalSales', width: 15 },
    { header: '原料成本', key: 'materialCost', width: 15 },
    { header: '人工成本', key: 'laborCost', width: 15 },
    { header: '净利润', key: 'netProfit', width: 15 },
    { header: '毛利率', key: 'margin', width: 12 }
  ];

  reports.forEach(report => {
    const margin = report.totalSales > 0 
      ? ((report.netProfit / report.totalSales) * 100).toFixed(1) + '%' 
      : '0%';
    
    worksheet.addRow({
      date: report.reportDate.toISOString().split('T')[0],
      store: report.reportStore?.name || '-',
      orderCount: report.orderCount,
      totalSales: Number(report.totalSales).toFixed(2),
      materialCost: Number(report.materialCost).toFixed(2),
      laborCost: Number(report.laborCost || 0).toFixed(2),
      netProfit: Number(report.netProfit).toFixed(2),
      margin
    });
  });

  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } };

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=sales-report-${Date.now()}.xlsx`);

  await workbook.xlsx.write(res);
  res.end();
};

export const getStatistics = async (req: Request, res: Response) => {
  const { storeId } = req.query;

  const where: any = {
    status: OrderStatus.COMPLETED
  };

  if (req.user?.role === UserRole.SUPER_ADMIN && storeId) {
    where.storeId = storeId;
  } else if (req.user?.storeId) {
    where.storeId = req.user.storeId;
  } else if (req.user?.role !== UserRole.SUPER_ADMIN) {
    throw new ForbiddenException('无权访问此数据');
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayOrders = await Order.count({
    where: {
      ...where,
      createdAt: { [Op.gte]: today }
    }
  });

  const todaySales = await Order.sum('totalAmount', {
    where: {
      ...where,
      createdAt: { [Op.gte]: today }
    }
  });

  const todayOrdersList = await Order.findAll({
    where: {
      ...where,
      createdAt: { [Op.gte]: today }
    },
    include: [{ model: Product, as: 'product' }]
  });

  const todayMaterialCost = await calculateMaterialCost(todayOrdersList);

  const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthOrders = await Order.count({
    where: {
      ...where,
      createdAt: { [Op.gte]: thisMonth }
    }
  });

  const monthSales = await Order.sum('totalAmount', {
    where: {
      ...where,
      createdAt: { [Op.gte]: thisMonth }
    }
  });

  const monthOrdersList = await Order.findAll({
    where: {
      ...where,
      createdAt: { [Op.gte]: thisMonth }
    },
    include: [{ model: Product, as: 'product' }]
  });

  const monthMaterialCost = await calculateMaterialCost(monthOrdersList);

  const pendingCount = await Order.count({
    where: {
      storeId: where.storeId,
      status: { [Op.in]: [OrderStatus.PAID, OrderStatus.MAKING, OrderStatus.READY] }
    }
  });

  res.json(ResponseUtil.success({
    todayOrders,
    todaySales: Number(todaySales || 0),
    todayMaterialCost: Number(todayMaterialCost),
    todayNetProfit: Number(todaySales || 0) - Number(todayMaterialCost) - todayOrders * 15,
    monthOrders,
    monthSales: Number(monthSales || 0),
    monthMaterialCost: Number(monthMaterialCost),
    monthNetProfit: Number(monthSales || 0) - Number(monthMaterialCost) - monthOrders * 15,
    pendingCount
  }));
};

export const getCategorySalesReport = async (req: Request, res: Response) => {
  const { startDate, endDate, storeId } = req.query;

  const where: any = {
    status: OrderStatus.COMPLETED
  };

  if (startDate && endDate) {
    where.createdAt = {
      [Op.between]: [new Date(startDate as string), new Date(endDate as string)]
    };
  }

  if (req.user?.role === UserRole.SUPER_ADMIN && storeId) {
    where.storeId = storeId;
  } else if (req.user?.storeId) {
    where.storeId = req.user.storeId;
  } else if (req.user?.role !== UserRole.SUPER_ADMIN) {
    throw new ForbiddenException('无权访问此数据');
  }

  const orders = await Order.findAll({
    where,
    include: [{ model: Product, as: 'product', include: [{ model: Recipe, as: 'recipes' }] }]
  });

  const categoryStats: any = {};

  for (const order of orders) {
    const categoryId = order.product?.categoryId;
    const categoryName = order.product?.category?.name || '未分类';
    
    if (!categoryStats[categoryId]) {
      categoryStats[categoryId] = {
        categoryId,
        categoryName,
        orderCount: 0,
        totalSales: 0,
        materialCost: 0
      };
    }

    categoryStats[categoryId].orderCount += order.quantity;
    categoryStats[categoryId].totalSales += Number(order.totalAmount);

    const recipe = order.product?.recipes?.[0];
    if (recipe) {
      const recipeItems = await RecipeItem.findAll({
        where: { recipeId: recipe.id },
        include: [{ model: Ingredient, as: 'ingredient' }]
      });

      const cost = recipeItems.reduce((sum, item) => {
        return sum + Number(item.quantity) * Number(item.ingredient?.unitPrice || 0);
      }, 0);

      categoryStats[categoryId].materialCost += cost * order.quantity;
    } else {
      categoryStats[categoryId].materialCost += Number(order.totalAmount) * 0.3;
    }
  }

  const result = Object.values(categoryStats).map((stat: any) => ({
    ...stat,
    netProfit: stat.totalSales - stat.materialCost - stat.orderCount * 15,
    margin: stat.totalSales > 0 ? ((stat.netProfit / stat.totalSales) * 100).toFixed(1) + '%' : '0%'
  }));

  res.json(ResponseUtil.success(result));
};
