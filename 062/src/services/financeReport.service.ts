import sequelize from '../config/database';
import { CheckInRecord } from '../models/CheckInRecord';
import { Payment, PaymentType, PaymentMethod } from '../models/Payment';
import { Reservation, ReservationSource } from '../models/Reservation';
import { RoomType } from '../models/RoomType';
import { fn, col, Op, literal } from 'sequelize';
import moment from 'moment';

export interface DailyStats {
  date: string;
  checkInCount: number;
  checkOutCount: number;
  totalRevenue: number;
  roomRevenue: number;
  extraRevenue: number;
  avgPrice: number;
  occupancyRate: number;
}

export interface PaymentStats {
  type: string;
  method: string;
  count: number;
  amount: number;
}

export interface RoomTypeStats {
  roomTypeId: number;
  roomTypeName: string;
  checkInCount: number;
  totalRevenue: number;
  avgPrice: number;
}

export interface SourceStats {
  source: string;
  count: number;
  revenue: number;
  percentage: number;
}

export interface FinanceReport {
  period: {
    startDate: string;
    endDate: string;
  };
  summary: {
    totalCheckIns: number;
    totalCheckOuts: number;
    totalRevenue: number;
    totalRefunds: number;
    netRevenue: number;
    avgDailyRate: number;
    avgOccupancyRate: number;
  };
  dailyStats: DailyStats[];
  paymentStats: PaymentStats[];
  roomTypeStats: RoomTypeStats[];
  sourceStats: SourceStats[];
}

export class FinanceReportService {
  static async generateReport(startDate: Date, endDate: Date): Promise<FinanceReport> {
    const [
      dailyStats,
      paymentStats,
      roomTypeStats,
      sourceStats,
      summary
    ] = await Promise.all([
      this.getDailyStats(startDate, endDate),
      this.getPaymentStats(startDate, endDate),
      this.getRoomTypeStats(startDate, endDate),
      this.getSourceStats(startDate, endDate),
      this.getSummary(startDate, endDate)
    ]);

    return {
      period: {
        startDate: moment(startDate).format('YYYY-MM-DD'),
        endDate: moment(endDate).format('YYYY-MM-DD')
      },
      summary,
      dailyStats,
      paymentStats,
      roomTypeStats,
      sourceStats
    };
  }

  private static async getDailyStats(startDate: Date, endDate: Date): Promise<DailyStats[]> {
    const days = moment(endDate).diff(moment(startDate), 'days') + 1;
    const result: DailyStats[] = [];

    for (let i = 0; i < days; i++) {
      const date = moment(startDate).add(i, 'days').startOf('day');
      const dateStr = date.format('YYYY-MM-DD');
      const nextDay = date.clone().add(1, 'days').toDate();

      const checkIns = await CheckInRecord.count({
        where: {
          checkInDate: {
            [Op.between]: [date.toDate(), nextDay]
          }
        }
      });

      const checkOuts = await CheckInRecord.count({
        where: {
          isCheckedOut: true,
          checkOutDate: {
            [Op.between]: [date.toDate(), nextDay]
          }
        }
      });

      const payments = await Payment.findAll({
        where: {
          type: {
            [Op.ne]: PaymentType.REFUND
          },
          createdAt: {
            [Op.between]: [date, nextDay]
          }
        },
        attributes: [
          [fn('SUM', col('amount')), 'total'],
          [fn('COUNT', col('id')), 'count']
        ],
        raw: true
      });

      const totalRevenue = Number((payments as any)[0].total || 0);

      const roomRevenue = await CheckInRecord.findAll({
        where: {
          isCheckedOut: true,
          checkOutDate: {
            [Op.between]: [date.toDate(), nextDay]
          }
        },
        attributes: [[fn('SUM', col('roomPrice')), 'total']],
        raw: true
      });

      const extraRevenue = await CheckInRecord.findAll({
        where: {
          isCheckedOut: true,
          checkOutDate: {
            [Op.between]: [date.toDate(), nextDay]
          }
        },
        attributes: [[fn('SUM', col('extraCharges')), 'total']],
        raw: true
      });

      result.push({
        date: dateStr,
        checkInCount: checkIns,
        checkOutCount: checkOuts,
        totalRevenue,
        roomRevenue: Number((roomRevenue as any)[0].total || 0),
        extraRevenue: Number((extraRevenue as any)[0].total || 0),
        avgPrice: checkOuts > 0 ? totalRevenue / checkOuts : 0,
        occupancyRate: 0
      });
    }

    return result;
  }

  private static async getPaymentStats(startDate: Date, endDate: Date): Promise<PaymentStats[]> {
    const payments = await Payment.findAll({
      where: {
        type: {
          [Op.ne]: PaymentType.REFUND
        },
        createdAt: {
          [Op.between]: [startDate, endDate]
        }
      },
      attributes: [
        'method',
        [fn('COUNT', col('id')), 'count'],
        [fn('SUM', col('amount')), 'amount']
      ],
      group: ['method'],
      order: [[col('amount'), 'DESC']],
      raw: true
    });

    return payments.map((p: any) => ({
      type: 'payment',
      method: p.method,
      count: Number(p.count),
      amount: Number(p.amount)
    }));
  }

  private static async getRoomTypeStats(startDate: Date, endDate: Date): Promise<RoomTypeStats[]> {
    const stats = await CheckInRecord.findAll({
      where: {
        isCheckedOut: true,
        checkOutDate: {
          [Op.between]: [startDate, endDate]
        }
      },
      include: [
        {
          model: Reservation,
          as: 'reservation',
          required: true,
          include: [{ model: RoomType, as: 'roomType', required: true }]
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

    return stats.map((s: any) => ({
      roomTypeId: Number(s.roomTypeId),
      roomTypeName: s.roomTypeName,
      checkInCount: Number(s.checkInCount),
      totalRevenue: Number(s.totalRevenue),
      avgPrice: Number(s.checkInCount) > 0 ? Number(s.totalRevenue) / Number(s.checkInCount) : 0
    }));
  }

  private static async getSourceStats(startDate: Date, endDate: Date): Promise<SourceStats[]> {
    const stats = await Reservation.findAll({
      where: {
        createdAt: {
          [Op.between]: [startDate, endDate]
        },
        status: {
          [Op.ne]: 'cancelled'
        }
      },
      attributes: [
        'source',
        [fn('COUNT', col('id')), 'count'],
        [fn('SUM', col('totalPrice')), 'revenue']
      ],
      group: ['source'],
      order: [[fn('COUNT', col('id')), 'DESC']],
      raw: true
    });

    const total = stats.reduce((sum, s: any) => sum + Number(s.count), 0);

    return stats.map((s: any) => ({
      source: s.source,
      count: Number(s.count),
      revenue: Number(s.revenue),
      percentage: total > 0 ? (Number(s.count) / total) * 100 : 0
    }));
  }

  private static async getSummary(startDate: Date, endDate: Date) {
    const [checkInRecords, paymentRecords, refundRecords] = await Promise.all([
      CheckInRecord.findAll({
        where: {
          isCheckedOut: true,
          checkOutDate: {
            [Op.between]: [startDate, endDate]
          }
        }
      }),
      Payment.findAll({
        where: {
          type: { [Op.ne]: PaymentType.REFUND },
          createdAt: {
            [Op.between]: [startDate, endDate]
          }
        },
        attributes: [[fn('SUM', col('amount')), 'total']],
        raw: true
      }),
      Payment.findAll({
        where: {
          type: PaymentType.REFUND,
          createdAt: {
            [Op.between]: [startDate, endDate]
          }
        },
        attributes: [[fn('SUM', col('amount')), 'total']],
        raw: true
      })
    ]);

    const totalRevenue = Number((paymentRecords as any)[0].total || 0);
    const totalRefunds = Number((refundRecords as any)[0].total || 0);
    const days = moment(endDate).diff(moment(startDate), 'days') + 1;

    return {
      totalCheckIns: checkInRecords.length,
      totalCheckOuts: checkInRecords.length,
      totalRevenue,
      totalRefunds,
      netRevenue: totalRevenue - totalRefunds,
      avgDailyRate: days > 0 ? totalRevenue / days : 0,
      avgOccupancyRate: 0
    };
  }

  static async getRealtimeDashboard() {
    const today = moment().startOf('day');
    const tomorrow = today.clone().add(1, 'days');

    const [
      todayCheckIns,
      todayCheckOuts,
      todayPayments,
      todayRefunds,
      pendingReservations,
      checkedInGuests
    ] = await Promise.all([
      CheckInRecord.count({
        where: {
          checkInDate: {
            [Op.between]: [today.toDate(), tomorrow.toDate()]
          }
        }
      }),
      CheckInRecord.count({
        where: {
          isCheckedOut: true,
          checkOutDate: {
            [Op.between]: [today.toDate(), tomorrow.toDate()]
          }
        }
      }),
      Payment.findAll({
        where: {
          type: { [Op.ne]: PaymentType.REFUND },
          createdAt: {
            [Op.between]: [today.toDate(), tomorrow.toDate()]
          }
        },
        attributes: [[fn('SUM', col('amount')), 'total']],
        raw: true
      }),
      Payment.findAll({
        where: {
          type: PaymentType.REFUND,
          createdAt: {
            [Op.between]: [today.toDate(), tomorrow.toDate()]
          }
        },
        attributes: [[fn('SUM', col('amount')), 'total']],
        raw: true
      }),
      Reservation.count({
        where: { status: 'confirmed' }
      }),
      CheckInRecord.count({
        where: { isCheckedOut: false }
      })
    ]);

    const todayRevenue = Number((todayPayments as any)[0].total || 0);
    const todayRefundAmount = Number((todayRefunds as any)[0].total || 0);

    return {
      today: {
        checkIns: todayCheckIns,
        checkOuts: todayCheckOuts,
        revenue: todayRevenue,
        refunds: todayRefundAmount,
        netRevenue: todayRevenue - todayRefundAmount
      },
      reservations: {
        pending: pendingReservations
      },
      guests: {
        inHouse: checkedInGuests
      }
    };
  }

  static async reconcileDaily(date: Date) {
    const start = moment(date).startOf('day').toDate();
    const end = moment(date).endOf('day').toDate();

    const checkOutRecords = await CheckInRecord.findAll({
      where: {
        isCheckedOut: true,
        checkOutDate: { [Op.between]: [start, end] }
      },
      include: [
        {
          model: Payment,
          as: 'payments',
          where: { type: { [Op.ne]: PaymentType.REFUND } },
          required: false
        }
      ]
    });

    const discrepancies = [];

    for (const record of checkOutRecords) {
      const totalPaid = (record as any).payments?.reduce(
        (sum: number, p: Payment) => sum + Number(p.amount), 0
      ) || 0;

      if (Math.abs(totalPaid - Number(record.totalAmount)) > 0.01) {
        discrepancies.push({
          checkInRecordId: record.id,
          reservationId: record.reservationId,
          expectedAmount: Number(record.totalAmount),
          actualPaid: totalPaid,
          difference: totalPaid - Number(record.totalAmount)
        });
      }
    }

    return {
      date: moment(date).format('YYYY-MM-DD'),
      totalCheckOuts: checkOutRecords.length,
      discrepancies,
      hasDiscrepancies: discrepancies.length > 0
    };
  }
}
