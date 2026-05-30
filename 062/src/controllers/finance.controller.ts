import { Response, NextFunction } from 'express';
import { Reservation, ReservationStatus } from '../models/Reservation';
import { CheckInRecord } from '../models/CheckInRecord';
import { Payment, PaymentType, PaymentMethod } from '../models/Payment';
import { RoomType } from '../models/RoomType';
import { Room, RoomStatus } from '../models/Room';
import { Guest } from '../models/Guest';
import { AuthRequest } from '../middleware/auth.middleware';
import { ResponseUtil } from '../utils/response';
import { NotFoundException, BadRequestException } from '../exceptions/HttpException';
import sequelize from '../config/database';
import { Op, fn, col, literal } from 'sequelize';
import moment from 'moment';
import { FinanceReportService } from '../services/financeReport.service';
import { TaskSchedulerService } from '../services/taskScheduler.service';

export class FinanceController {
  static async getDailyStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query;

      const start = startDate ? moment(startDate as string).startOf('day').toDate() : moment().subtract(30, 'days').startOf('day').toDate();
      const end = endDate ? moment(endDate as string).endOf('day').toDate() : moment().endOf('day').toDate();

      const dailyStats = await CheckInRecord.findAll({
        where: {
          checkInDate: { [Op.between]: [start, end] },
          isCheckedOut: true
        },
        attributes: [
          [fn('DATE', col('checkInDate')), 'date'],
          [fn('COUNT', col('id')), 'checkInCount'],
          [fn('SUM', col('totalAmount')), 'totalRevenue'],
          [fn('SUM', col('roomPrice')), 'roomRevenue'],
          [fn('SUM', col('extraCharges')), 'extraRevenue']
        ],
        group: [fn('DATE', col('checkInDate'))],
        order: [[fn('DATE', col('checkInDate')), 'DESC']],
        raw: true
      });

      return ResponseUtil.success(res, dailyStats);
    } catch (error) {
      next(error);
    }
  }

  static async getRoomTypeStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query;

      const start = startDate ? moment(startDate as string).startOf('day').toDate() : moment().subtract(30, 'days').startOf('day').toDate();
      const end = endDate ? moment(endDate as string).endOf('day').toDate() : moment().endOf('day').toDate();

      const stats = await CheckInRecord.findAll({
        where: {
          checkInDate: { [Op.between]: [start, end] },
          isCheckedOut: true
        },
        include: [
          {
            model: Reservation,
            as: 'reservation',
            include: [{ model: RoomType, as: 'roomType' }],
            required: true
          }
        ],
        attributes: [
          [col('reservation.roomType.id'), 'roomTypeId'],
          [col('reservation.roomType.name'), 'roomTypeName'],
          [fn('COUNT', col('CheckInRecord.id')), 'checkInCount'],
          [fn('SUM', col('CheckInRecord.totalAmount')), 'totalRevenue']
        ],
        group: ['reservation.roomType.id'],
        order: [[fn('SUM', col('CheckInRecord.totalAmount')), 'DESC']],
        raw: true
      });

      return ResponseUtil.success(res, stats);
    } catch (error) {
      next(error);
    }
  }

  static async getPaymentList(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { paymentNo, type, method, startDate, endDate, page = 1, pageSize = 20 } = req.query;

      const where: any = {};
      if (paymentNo) where.paymentNo = { [Op.like]: `%${paymentNo}%` };
      if (type) where.type = type;
      if (method) where.method = method;
      if (startDate && endDate) {
        where.createdAt = {
          [Op.between]: [moment(startDate as string).startOf('day').toDate(), moment(endDate as string).endOf('day').toDate()]
        };
      }

      const { count, rows } = await Payment.findAndCountAll({
        where,
        include: [
          {
            model: Reservation,
            as: 'reservation',
            attributes: ['orderNo', 'guestName', 'guestPhone']
          }
        ],
        order: [['createdAt', 'DESC']],
        offset: (Number(page) - 1) * Number(pageSize),
        limit: Number(pageSize)
      });

      return ResponseUtil.page(res, rows, count, Number(page), Number(pageSize));
    } catch (error) {
      next(error);
    }
  }

  static async getSummary(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const today = moment().startOf('day');
      const thisMonth = moment().startOf('month');

      const todayRevenue = await CheckInRecord.findOne({
        where: {
          checkOutDate: { [Op.gte]: today.toDate() },
          isCheckedOut: true
        },
        attributes: [[fn('SUM', col('totalAmount')), 'total']],
        raw: true
      });

      const monthRevenue = await CheckInRecord.findOne({
        where: {
          checkOutDate: { [Op.gte]: thisMonth.toDate() },
          isCheckedOut: true
        },
        attributes: [[fn('SUM', col('totalAmount')), 'total']],
        raw: true
      });

      const todayCheckIns = await CheckInRecord.count({
        where: {
          checkInDate: { [Op.gte]: today.toDate() }
        }
      });

      const todayCheckOuts = await CheckInRecord.count({
        where: {
          checkOutDate: { [Op.gte]: today.toDate() },
          isCheckedOut: true
        }
      });

      const totalReservations = await Reservation.count();
      const totalRevenue = await CheckInRecord.findOne({
        where: { isCheckedOut: true },
        attributes: [[fn('SUM', col('totalAmount')), 'total']],
        raw: true
      });

      return ResponseUtil.success(res, {
        todayRevenue: Number((todayRevenue as any)?.total || 0),
        monthRevenue: Number((monthRevenue as any)?.total || 0),
        totalRevenue: Number((totalRevenue as any)?.total || 0),
        todayCheckIns,
        todayCheckOuts,
        totalReservations
      });
    } catch (error) {
      next(error);
    }
  }

  static async getRefunds(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { page = 1, pageSize = 20 } = req.query;

      const { count, rows } = await Payment.findAndCountAll({
        where: { type: PaymentType.REFUND },
        include: [
          {
            model: Reservation,
            as: 'reservation',
            attributes: ['orderNo', 'guestName', 'guestPhone']
          }
        ],
        order: [['createdAt', 'DESC']],
        offset: (Number(page) - 1) * Number(pageSize),
        limit: Number(pageSize)
      });

      return ResponseUtil.page(res, rows, count, Number(page), Number(pageSize));
    } catch (error) {
      next(error);
    }
  }

  static async createRefund(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { reservationId, amount, method, reason } = req.body;

      if (!reservationId || !amount || amount <= 0 || !method) {
        throw new Error('参数错误');
      }

      const reservation = await Reservation.findByPk(reservationId);
      if (!reservation) {
        throw new Error('预订不存在');
      }

      const paymentNo = `REF${moment().format('YYYYMMDDHHmmss')}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

      const refund = await Payment.create({
        paymentNo,
        reservationId,
        type: PaymentType.REFUND,
        amount: -Math.abs(amount),
        method,
        handledBy: req.user?.id,
        remark: reason
      } as any);

      return ResponseUtil.success(res, refund, '退款成功');
    } catch (error) {
      next(error);
    }
  }

  static async getMonthlyStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { year, month } = req.query;

      const targetYear = year ? Number(year) : new Date().getFullYear();
      const targetMonth = month ? Number(month) - 1 : new Date().getMonth();

      const startDate = new Date(targetYear, targetMonth, 1);
      const endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59);

      const dailyStats = await CheckInRecord.findAll({
        where: {
          checkOutDate: { [Op.between]: [startDate, endDate] },
          isCheckedOut: true
        },
        attributes: [
          [fn('DATE', col('checkOutDate')), 'date'],
          [fn('COUNT', col('id')), 'checkOutCount'],
          [fn('SUM', col('totalAmount')), 'totalRevenue'],
          [fn('SUM', col('roomPrice')), 'roomRevenue'],
          [fn('SUM', col('extraCharges')), 'extraRevenue']
        ],
        group: [fn('DATE', col('checkOutDate'))],
        order: [[fn('DATE', col('checkOutDate')), 'ASC']],
        raw: true
      });

      const totalRevenue = dailyStats.reduce((sum, d: any) => sum + Number(d.totalRevenue || 0), 0);
      const totalRoomRevenue = dailyStats.reduce((sum, d: any) => sum + Number(d.roomRevenue || 0), 0);
      const totalExtraRevenue = dailyStats.reduce((sum, d: any) => sum + Number(d.extraRevenue || 0), 0);
      const totalCheckOuts = dailyStats.reduce((sum, d: any) => sum + Number(d.checkOutCount || 0), 0);

      return ResponseUtil.success(res, {
        period: {
          year: targetYear,
          month: targetMonth + 1,
          startDate,
          endDate
        },
        summary: {
          totalRevenue,
          totalRoomRevenue,
          totalExtraRevenue,
          totalCheckOuts
        },
        dailyStats
      });
    } catch (error) {
      next(error);
    }
  }

  static async getRealtimeDashboard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const today = moment().startOf('day');

      const todayCheckIns = await CheckInRecord.count({
        where: { checkInDate: { [Op.gte]: today.toDate() } }
      });

      const todayCheckOuts = await CheckInRecord.count({
        where: {
          checkOutDate: { [Op.gte]: today.toDate() },
          isCheckedOut: true
        }
      });

      const todayRevenue = await CheckInRecord.findOne({
        where: {
          checkOutDate: { [Op.gte]: today.toDate() },
          isCheckedOut: true
        },
        attributes: [[fn('SUM', col('totalAmount')), 'total']],
        raw: true
      });

      const totalRooms = await Room.count();
      const occupiedRooms = await Room.count({ where: { status: RoomStatus.OCCUPIED } });
      const vacantRooms = await Room.count({ where: { status: RoomStatus.VACANT } });
      const cleaningRooms = await Room.count({ where: { status: RoomStatus.CLEANING } });
      const maintenanceRooms = await Room.count({ where: { status: RoomStatus.MAINTENANCE } });

      const inHouseGuests = await CheckInRecord.count({
        where: { isCheckedOut: false }
      });

      const pendingReservations = await Reservation.count({
        where: { status: ReservationStatus.CONFIRMED }
      });

      const occupancyRate = totalRooms > 0 ? ((occupiedRooms / totalRooms) * 100).toFixed(2) : '0.00';

      return ResponseUtil.success(res, {
        today: {
          checkIns: todayCheckIns,
          checkOuts: todayCheckOuts,
          revenue: Number((todayRevenue as any)?.total || 0)
        },
        rooms: {
          total: totalRooms,
          occupied: occupiedRooms,
          vacant: vacantRooms,
          cleaning: cleaningRooms,
          maintenance: maintenanceRooms,
          occupancyRate
        },
        guests: {
          inHouse: inHouseGuests
        },
        reservations: {
          pending: pendingReservations
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getPaymentSummary(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query;

      const start = startDate ? moment(startDate as string).startOf('day').toDate() : moment().subtract(30, 'days').startOf('day').toDate();
      const end = endDate ? moment(endDate as string).endOf('day').toDate() : moment().endOf('day').toDate();

      const payments = await Payment.findAll({
        where: {
          createdAt: { [Op.between]: [start, end] }
        },
        attributes: ['type', 'method', 'amount']
      });

      const summary = {
        total: 0,
        roomCharge: 0,
        deposit: 0,
        extra: 0,
        refund: 0,
        byMethod: {} as any
      };

      payments.forEach(p => {
        const amount = Number(p.amount);
        summary.total += amount;

        switch (p.type) {
          case PaymentType.ROOM_CHARGE:
            summary.roomCharge += amount;
            break;
          case PaymentType.DEPOSIT:
            summary.deposit += amount;
            break;
          case PaymentType.EXTRA:
            summary.extra += amount;
            break;
          case PaymentType.REFUND:
            summary.refund += Math.abs(amount);
            break;
        }

        summary.byMethod[p.method] = (summary.byMethod[p.method] || 0) + amount;
      });

      return ResponseUtil.success(res, {
        period: { start, end },
        summary
      });
    } catch (error) {
      next(error);
    }
  }

  static async generateBill(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { checkInRecordId } = req.params;

      const checkInRecord = await CheckInRecord.findByPk(checkInRecordId, {
        include: [
          { model: Room, as: 'room' },
          { model: Guest, as: 'guest' },
          { model: Reservation, as: 'reservation' }
        ]
      });

      if (!checkInRecord) {
        throw new NotFoundException('入住记录不存在');
      }

      const payments = await Payment.findAll({
        where: { reservationId: checkInRecord.reservationId }
      });

      const bill = {
        checkInRecord,
        guest: checkInRecord.guest,
        room: checkInRecord.room,
        reservation: checkInRecord.reservation,
        payments,
        summary: {
          roomPrice: Number(checkInRecord.roomPrice),
          extraCharges: Number(checkInRecord.extraCharges),
          totalAmount: Number(checkInRecord.totalAmount),
          paidAmount: Number(checkInRecord.paidAmount),
          balance: Number(checkInRecord.totalAmount) - Number(checkInRecord.paidAmount)
        }
      };

      return ResponseUtil.success(res, bill);
    } catch (error) {
      next(error);
    }
  }

  static async getTransactionDetail(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const payment = await Payment.findByPk(id, {
        include: [
          { model: Reservation, as: 'reservation' }
        ]
      });

      if (!payment) {
        throw new NotFoundException('交易记录不存在');
      }

      return ResponseUtil.success(res, payment);
    } catch (error) {
      next(error);
    }
  }

  static async getOccupancyTrend(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { days = 30 } = req.query;
      const numDays = Number(days);

      const trendData = [];

      for (let i = numDays - 1; i >= 0; i--) {
        const date = moment().subtract(i, 'days').startOf('day');
        const nextDate = moment(date).add(1, 'day');

        const occupiedRooms = await CheckInRecord.count({
          where: {
            checkInDate: { [Op.lt]: nextDate.toDate() },
            [Op.or]: [
              { checkOutDate: { [Op.gte]: date.toDate() } },
              { checkOutDate: null }
            ]
          }
        });

        const totalRooms = await Room.count();
        const occupancyRate = totalRooms > 0 ? ((occupiedRooms / totalRooms) * 100).toFixed(2) : '0.00';

        trendData.push({
          date: date.format('YYYY-MM-DD'),
          occupiedRooms,
          totalRooms,
          occupancyRate
        });
      }

      return ResponseUtil.success(res, trendData);
    } catch (error) {
      next(error);
    }
  }

  static async generateReport(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        throw new BadRequestException('开始日期和结束日期不能为空');
      }

      const start = moment(startDate as string).startOf('day').toDate();
      const end = moment(endDate as string).endOf('day').toDate();

      const report = await FinanceReportService.generateReport(start, end);

      return ResponseUtil.success(res, report);
    } catch (error) {
      next(error);
    }
  }

  static async getDashboard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const dashboard = await FinanceReportService.getRealtimeDashboard();

      return ResponseUtil.success(res, dashboard);
    } catch (error) {
      next(error);
    }
  }

  static async reconcileDaily(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { date } = req.query;

      const targetDate = date ? new Date(date as string) : new Date();

      const result = await FinanceReportService.reconcileDaily(targetDate);

      return ResponseUtil.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async cancelTimeoutReservations(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { timeoutMinutes = 30 } = req.body;

      const cancelled = await TaskSchedulerService.cancelTimeoutReservations(Number(timeoutMinutes));

      return ResponseUtil.success(res, { cancelled }, `已自动取消 ${cancelled} 个超时未支付的预订`);
    } catch (error) {
      next(error);
    }
  }

  static async getTaskStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const status = TaskSchedulerService.getTaskStatus();

      return ResponseUtil.success(res, status);
    } catch (error) {
      next(error);
    }
  }
}
