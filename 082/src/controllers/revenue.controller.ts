import { Request, Response } from 'express';
import { Order, Room, RevenueReport } from '../models';
import sequelize from '../config/database';
import { ResponseUtil } from '../utils/response';
import { OrderStatus, SeasonType } from '../constants';
import { Op, QueryTypes } from 'sequelize';

export const getRevenueStatistics = async (req: Request, res: Response) => {
  const { startDate, endDate, building, categoryId, seasonType } = req.query;
  const where: any = { status: OrderStatus.CHECKED_OUT };
  if (startDate && endDate) where.checkOutTime = { [Op.between]: [new Date(startDate as string), new Date(endDate as string)] };
  const orders = await Order.findAll({
    where,
    include: [{ model: Room, as: 'room', where: { ...(building && { building }), ...(categoryId && { categoryId }) } }]
  });
  const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.totalAmount as any), 0);
  const totalOrders = orders.length;
  const totalNights = orders.reduce((sum, order) => sum + order.totalDays, 0);
  const avgDailyRate = totalNights > 0 ? totalRevenue / totalNights : 0;
  const occupancyRate = await calculateOccupancyRate(startDate as string, endDate as string, building as string, categoryId as string);
  const seasonBreakdown = await getSeasonBreakdown(startDate as string, endDate as string);
  const buildingBreakdown = await getBuildingBreakdown(startDate as string, endDate as string);
  res.json(ResponseUtil.success({
    totalRevenue,
    totalOrders,
    totalNights,
    avgDailyRate,
    occupancyRate,
    seasonBreakdown,
    buildingBreakdown
  }, '营收统计查询成功'));
};

const calculateOccupancyRate = async (startDate?: string, endDate?: string, building?: string, categoryId?: string) => {
  const start = startDate ? new Date(startDate) : new Date(new Date().setDate(1));
  const end = endDate ? new Date(endDate) : new Date();
  const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const roomWhere: any = {};
  if (building) roomWhere.building = building;
  if (categoryId) roomWhere.categoryId = categoryId;
  const totalRooms = await Room.count({ where: roomWhere });
  if (totalRooms === 0) return 0;
  const occupiedNights = await sequelize.query(
    `SELECT COUNT(*) as count FROM orders WHERE status = :status AND checkInDate >= :start AND checkOutDate <= :end ${building ? 'AND roomId IN (SELECT id FROM rooms WHERE building = :building)' : ''}`,
    { replacements: { status: OrderStatus.CHECKED_OUT, start, end, building }, type: QueryTypes.SELECT }
  ) as any;
  const totalRoomNights = totalRooms * totalDays;
  return totalRoomNights > 0 ? ((parseInt(occupiedNights[0].count) / totalRoomNights) * 100).toFixed(2) : 0;
};

const getSeasonBreakdown = async (startDate?: string, endDate?: string) => {
  const where: any = { status: OrderStatus.CHECKED_OUT };
  if (startDate && endDate) where.checkOutTime = { [Op.between]: [new Date(startDate), new Date(endDate)] };
  const orders = await Order.findAll({ where, attributes: ['seasonType', 'totalAmount'] });
  const breakdown = { peak: { revenue: 0, orders: 0 }, normal: { revenue: 0, orders: 0 }, low: { revenue: 0, orders: 0 } };
  for (const order of orders) {
    const season = order.seasonType as SeasonType;
    if (breakdown[season]) {
      breakdown[season].revenue += parseFloat(order.totalAmount as any);
      breakdown[season].orders++;
    }
  }
  return breakdown;
};

const getBuildingBreakdown = async (startDate?: string, endDate?: string) => {
  const where: any = { status: OrderStatus.CHECKED_OUT };
  if (startDate && endDate) where.checkOutTime = { [Op.between]: [new Date(startDate), new Date(endDate)] };
  const orders = await Order.findAll({ where, include: [{ model: Room, as: 'room', attributes: ['building'] }] });
  const breakdown: Record<string, { revenue: number; orders: number }> = {};
  for (const order of orders) {
    const building = (order as any).room?.building || '未知';
    if (!breakdown[building]) breakdown[building] = { revenue: 0, orders: 0 };
    breakdown[building].revenue += parseFloat(order.totalAmount as any);
    breakdown[building].orders++;
  }
  return Object.entries(breakdown).map(([building, data]) => ({ building, ...data }));
};

export const getOrderDetails = async (req: Request, res: Response) => {
  const { page = 1, pageSize = 10, startDate, endDate, building } = req.query;
  const where: any = { status: OrderStatus.CHECKED_OUT };
  if (startDate && endDate) where.checkOutTime = { [Op.between]: [new Date(startDate as string), new Date(endDate as string)] };
  const roomWhere: any = {};
  if (building) roomWhere.building = building;
  const { count, rows } = await Order.findAndCountAll({
    where,
    include: [{ model: Room, as: 'room', where: roomWhere }],
    offset: (parseInt(page as string) - 1) * parseInt(pageSize as string),
    limit: parseInt(pageSize as string),
    order: [['checkOutTime', 'DESC']]
  });
  res.json(ResponseUtil.success({ list: rows, total: count, page: parseInt(page as string), pageSize: parseInt(pageSize as string) }));
};

export const generateDailyReport = async (req: Request, res: Response) => {
  const { date } = req.params;
  const reportDate = date ? new Date(date) : new Date();
  reportDate.setHours(0, 0, 0, 0);
  const nextDay = new Date(reportDate);
  nextDay.setDate(nextDay.getDate() + 1);
  const orders = await Order.findAll({
    where: { status: OrderStatus.CHECKED_OUT, checkOutTime: { [Op.between]: [reportDate, nextDay] } },
    include: [{ model: Room, as: 'room' }]
  });
  const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.totalAmount as any), 0);
  const totalOrders = orders.length;
  const totalRooms = await Room.count();
  const avgDailyRate = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const buildingStats: Record<string, { revenue: number; orders: number }> = {};
  for (const order of orders) {
    const building = (order as any).room?.building || '未知';
    if (!buildingStats[building]) buildingStats[building] = { revenue: 0, orders: 0 };
    buildingStats[building].revenue += parseFloat(order.totalAmount as any);
    buildingStats[building].orders++;
  }
  const report = await RevenueReport.create({
    reportDate,
    totalOrders,
    checkInCount: orders.filter(o => o.checkInTime && o.checkInTime >= reportDate && o.checkInTime < nextDay).length,
    checkOutCount: totalOrders,
    occupancyRate: parseFloat(((totalOrders / Math.max(totalRooms, 1)) * 100).toFixed(2)),
    totalRevenue,
    maintenanceCost: 0,
    netProfit: totalRevenue,
    avgDailyRate: parseFloat(avgDailyRate.toFixed(2))
  });
  res.json(ResponseUtil.success({ report, buildingStats }, '日报生成成功'));
};

export const getReportsList = async (req: Request, res: Response) => {
  const { page = 1, pageSize = 10, startDate, endDate } = req.query;
  const where: any = {};
  if (startDate && endDate) {
    where.reportDate = { [Op.between]: [new Date(startDate as string), new Date(endDate as string)] };
  }
  const { count, rows } = await RevenueReport.findAndCountAll({
    where,
    offset: (parseInt(page as string) - 1) * parseInt(pageSize as string),
    limit: parseInt(pageSize as string),
    order: [['reportDate', 'DESC']]
  });
  res.json(ResponseUtil.success({ list: rows, total: count, page: parseInt(page as string), pageSize: parseInt(pageSize as string) }));
};
