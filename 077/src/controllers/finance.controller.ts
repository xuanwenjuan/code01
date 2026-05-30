import { Request, Response } from 'express';
import { Op, fn, col, literal } from 'sequelize';
import { ApiResponse } from '../utils/response';
import PaymentRecord from '../database/models/PaymentRecord.model';
import RentalOrder from '../database/models/RentalOrder.model';
import Customer from '../database/models/Customer.model';
import Equipment from '../database/models/Equipment.model';
import FinancialReport from '../database/models/FinancialReport.model';
import { NotFoundException, BadRequestException } from '../exceptions/http.exception';

export const getPaymentRecords = async (req: Request, res: Response) => {
  const { orderId, customerId, paymentType, startDate, endDate, page = 1, pageSize = 10 } = req.query;

  const pageNum = parseInt(page as string);
  const size = parseInt(pageSize as string);

  if (isNaN(pageNum) || pageNum < 1) {
    throw new BadRequestException('无效的页码');
  }
  if (isNaN(size) || size < 1 || size > 100) {
    throw new BadRequestException('无效的每页数量');
  }

  const where: any = {};
  if (orderId) {
    where.orderId = orderId;
  }
  if (customerId) {
    where.customerId = customerId;
  }
  if (paymentType) {
    where.paymentType = paymentType;
  }
  if (startDate && endDate) {
    where.createdAt = {
      [Op.between]: [new Date(startDate as string), new Date(endDate as string)]
    };
  }

  const { count, rows } = await PaymentRecord.findAndCountAll({
    where,
    include: [
      { model: Customer, as: 'customer' },
      { model: RentalOrder, as: 'order' }
    ],
    order: [['createdAt', 'DESC']],
    offset: (pageNum - 1) * size,
    limit: size
  });

  res.json(ApiResponse.successPage(rows, count, pageNum, size));
};

export const getIncomeStatistics = async (req: Request, res: Response) => {
  const { startDate, endDate, groupBy = 'day' } = req.query;

  if (!['day', 'month', 'year'].includes(groupBy as string)) {
    throw new BadRequestException('无效的统计分组类型');
  }

  const where: any = {};
  if (startDate && endDate) {
    where.createdAt = {
      [Op.between]: [new Date(startDate as string), new Date(endDate as string)]
    };
  }

  let dateFormat: string;
  switch (groupBy) {
    case 'day':
      dateFormat = '%Y-%m-%d';
      break;
    case 'month':
      dateFormat = '%Y-%m';
      break;
    case 'year':
      dateFormat = '%Y';
      break;
    default:
      dateFormat = '%Y-%m-%d';
  }

  const results = await PaymentRecord.findAll({
    where,
    attributes: [
      [fn('DATE_FORMAT', col('createdAt'), dateFormat), 'date'],
      [fn('SUM', literal('CASE WHEN paymentType = "rent" THEN amount ELSE 0 END')), 'rentIncome'],
      [fn('SUM', literal('CASE WHEN paymentType = "deposit" THEN amount ELSE 0 END')), 'depositIncome'],
      [fn('SUM', literal('CASE WHEN paymentType = "overdue" THEN amount ELSE 0 END')), 'overdueIncome'],
      [fn('SUM', literal('CASE WHEN paymentType = "damage" THEN amount ELSE 0 END')), 'damageIncome'],
      [fn('SUM', col('amount')), 'totalIncome']
    ],
    group: [literal(`DATE_FORMAT(createdAt, '${dateFormat}')`)],
    order: [[literal('date'), 'DESC']],
    raw: true
  });

  res.json(ApiResponse.success(results));
};

export const getCustomerFinance = async (req: Request, res: Response) => {
  const { customerId } = req.params;

  const id = parseInt(customerId);
  if (isNaN(id)) {
    throw new BadRequestException('无效的客户ID');
  }

  const customer = await Customer.findByPk(id);
  if (!customer) {
    throw new NotFoundException('客户不存在');
  }

  const payments = await PaymentRecord.findAll({
    where: { customerId: id },
    include: [{ model: RentalOrder, as: 'order' }],
    order: [['createdAt', 'DESC']]
  });

  const totalRent = payments
    .filter(p => p.paymentType === 'rent')
    .reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0);

  const totalDeposit = payments
    .filter(p => p.paymentType === 'deposit')
    .reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0);

  const totalOverdue = payments
    .filter(p => p.paymentType === 'overdue')
    .reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0);

  const totalDamage = payments
    .filter(p => p.paymentType === 'damage')
    .reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0);

  const orderStats = await RentalOrder.findOne({
    where: { customerId: id },
    attributes: [
      [fn('COUNT', col('id')), 'totalOrders'],
      [fn('SUM', literal('CASE WHEN status = "completed" THEN 1 ELSE 0 END')), 'completedOrders'],
      [fn('SUM', literal('CASE WHEN status IN ("in_use", "overdue") THEN 1 ELSE 0 END')), 'activeOrders']
    ],
    raw: true
  });

  res.json(ApiResponse.success({
    customer,
    statistics: {
      totalRent,
      totalDeposit,
      totalOverdue,
      totalDamage,
      totalIncome: totalRent + totalOverdue + totalDamage,
      ...orderStats
    },
    paymentRecords: payments
  }));
};

export const getEquipmentFinance = async (req: Request, res: Response) => {
  const { equipmentId } = req.params;

  const id = parseInt(equipmentId);
  if (isNaN(id)) {
    throw new BadRequestException('无效的设备ID');
  }

  const equipment = await Equipment.findByPk(id);
  if (!equipment) {
    throw new NotFoundException('设备不存在');
  }

  const orders = await RentalOrder.findAll({
    where: { equipmentId: id, status: { [Op.ne]: 'cancelled' } },
    include: [{ model: Customer, as: 'customer' }],
    order: [['createdAt', 'DESC']]
  });

  const totalRentIncome = orders.reduce((sum, o) => sum + parseFloat(o.totalAmount.toString()), 0);
  const totalOverdueIncome = orders.reduce((sum, o) => sum + parseFloat(o.overdueAmount.toString()), 0);
  const totalDamageIncome = orders.reduce((sum, o) => sum + parseFloat(o.damageAmount.toString()), 0);

  const completedCount = orders.filter(o => o.status === 'completed').length;
  const activeCount = orders.filter(o => ['in_use', 'overdue'].includes(o.status)).length;

  res.json(ApiResponse.success({
    equipment,
    statistics: {
      totalRentIncome,
      totalOverdueIncome,
      totalDamageIncome,
      totalIncome: totalRentIncome + totalOverdueIncome + totalDamageIncome,
      totalOrders: orders.length,
      completedOrders: completedCount,
      activeOrders: activeCount
    },
    orders
  }));
};

export const getMonthlyReport = async (req: Request, res: Response) => {
  const { year, month } = req.params;

  if (!year || !month) {
    throw new BadRequestException('请指定年份和月份');
  }

  const reportDate = `${year}-${month.padStart(2, '0')}`;

  const report = await FinancialReport.findOne({
    where: { reportDate, reportType: 'monthly' }
  });

  if (!report) {
    throw new NotFoundException('月度报表不存在，请先生成');
  }

  res.json(ApiResponse.success(report));
};

export const getReportList = async (req: Request, res: Response) => {
  const { reportType, startDate, endDate, page = 1, pageSize = 10 } = req.query;

  const pageNum = parseInt(page as string);
  const size = parseInt(pageSize as string);

  if (isNaN(pageNum) || pageNum < 1) {
    throw new BadRequestException('无效的页码');
  }
  if (isNaN(size) || size < 1 || size > 100) {
    throw new BadRequestException('无效的每页数量');
  }

  const where: any = {};
  if (reportType) {
    where.reportType = reportType;
  }
  if (startDate && endDate) {
    where.reportDate = { [Op.between]: [startDate, endDate] };
  }

  const { count, rows } = await FinancialReport.findAndCountAll({
    where,
    order: [['reportDate', 'DESC']],
    offset: (pageNum - 1) * size,
    limit: size
  });

  res.json(ApiResponse.successPage(rows, count, pageNum, size));
};

export const generateMonthlyReport = async (req: Request, res: Response) => {
  const { year, month } = req.body;

  if (!year || !month) {
    throw new BadRequestException('请指定年份和月份');
  }

  const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
  const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);

  if (endDate > new Date()) {
    throw new BadRequestException('不能生成未来月份的报表');
  }

  const payments = await PaymentRecord.findAll({
    where: {
      createdAt: { [Op.between]: [startDate, endDate] }
    }
  });

  const totalRentIncome = payments
    .filter(p => p.paymentType === 'rent')
    .reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0);

  const totalDepositIncome = payments
    .filter(p => p.paymentType === 'deposit')
    .reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0);

  const totalOverdueIncome = payments
    .filter(p => p.paymentType === 'overdue')
    .reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0);

  const totalDamageIncome = payments
    .filter(p => p.paymentType === 'damage')
    .reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0);

  const totalIncome = totalRentIncome + totalOverdueIncome + totalDamageIncome;

  const orderCount = await RentalOrder.count({
    where: {
      createdAt: { [Op.between]: [startDate, endDate] },
      status: 'completed'
    }
  });

  const equipmentCount = await Equipment.count({
    where: { status: ['in_stock', 'rented'] }
  });

  const customerCount = await Customer.count({ where: { status: 1 } });

  const reportDate = `${year}-${month.toString().padStart(2, '0')}`;

  const [report, created] = await FinancialReport.findOrCreate({
    where: { reportDate, reportType: 'monthly' },
    defaults: {
      reportDate,
      reportType: 'monthly',
      totalRentIncome,
      totalDepositIncome,
      totalDepositRefund: 0,
      totalOverdueIncome,
      totalDamageIncome,
      totalMaintenanceCost: 0,
      totalIncome,
      totalExpense: 0,
      netProfit: totalIncome,
      orderCount,
      equipmentCount,
      customerCount
    }
  });

  if (!created) {
    await report.update({
      totalRentIncome,
      totalDepositIncome,
      totalOverdueIncome,
      totalDamageIncome,
      totalIncome,
      netProfit: totalIncome,
      orderCount,
      equipmentCount,
      customerCount
    });
  }

  res.json(ApiResponse.success(report, '月度报表生成成功'));
};

export const getDashboardStats = async (req: Request, res: Response) => {
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const totalCustomers = await Customer.count({ where: { status: 1 } });
  const totalEquipments = await Equipment.count();
  const activeEquipments = await Equipment.count({ where: { status: 'rented' } });
  const totalOrders = await RentalOrder.count();
  const activeOrders = await RentalOrder.count({
    where: { status: { [Op.in]: ['in_use', 'overdue'] } }
  });

  const thisMonthPayments = await PaymentRecord.findAll({
    where: {
      createdAt: { [Op.between]: [thisMonthStart, thisMonthEnd] }
    }
  });

  const thisMonthIncome = thisMonthPayments
    .filter(p => p.paymentType !== 'deposit')
    .reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0);

  const overdueOrders = await RentalOrder.count({
    where: {
      endDate: { [Op.lt]: now },
      status: { [Op.in]: ['in_use', 'overdue'] }
    }
  });

  const maintenanceDue = await Equipment.count({
    where: {
      nextMaintenanceDate: { [Op.lt]: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) },
      status: { [Op.ne]: 'scrapped' }
    }
  });

  res.json(ApiResponse.success({
    summary: {
      totalCustomers,
      totalEquipments,
      activeEquipments,
      totalOrders,
      activeOrders,
      thisMonthIncome,
      overdueOrders,
      maintenanceDue
    },
    recentOrders: await RentalOrder.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']],
      include: [{ model: Customer, as: 'customer' }]
    })
  }));
};
