import { Response, NextFunction } from 'express';
import { Reservation, ReservationStatus, ReservationSource } from '../models/Reservation';
import { Room, RoomStatus } from '../models/Room';
import { RoomType, RoomTypeStatus } from '../models/RoomType';
import { Guest } from '../models/Guest';
import { CheckInRecord } from '../models/CheckInRecord';
import { Payment, PaymentMethod, PaymentType } from '../models/Payment';
import { AuthRequest } from '../middleware/auth.middleware';
import { ResponseUtil } from '../utils/response';
import { BadRequestException, NotFoundException, ConflictException } from '../exceptions/HttpException';
import { OperationLogger } from '../utils/logger';
import sequelize from '../config/database';
import { Op } from 'sequelize';
import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import { OperationType } from '../models/OperationLog';
import { ReservationStatusService } from '../services/reservationStatus.service';
import { RoomStatusService } from '../services/roomStatus.service';

export class ReservationController {
  static generateOrderNo(): string {
    const date = moment().format('YYYYMMDD');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `HT${date}${random}`;
  }

  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const {
        roomTypeId,
        guestName,
        guestPhone,
        guestIdCard,
        guestCount,
        checkInDate,
        checkOutDate,
        deposit,
        source,
        remark
      } = req.body;

      if (!roomTypeId || !guestName || !guestPhone || !checkInDate || !checkOutDate) {
        throw new BadRequestException('必填项不能为空');
      }

      const roomType = await RoomType.findByPk(roomTypeId);
      if (!roomType) {
        throw new NotFoundException('房型不存在');
      }

      if (roomType.status !== RoomTypeStatus.ON_SHELF) {
        throw new ConflictException('该房型已下架，无法预订');
      }

      const startDate = moment(checkInDate);
      const endDate = moment(checkOutDate);
      const nights = endDate.diff(startDate, 'days');

      if (nights <= 0) {
        throw new BadRequestException('离店日期必须晚于入住日期');
      }

      const totalPrice = Number(roomType.basePrice) * nights;

      const orderNo = this.generateOrderNo();

      const reservation = await Reservation.create({
        orderNo,
        roomTypeId,
        guestName,
        guestPhone,
        guestIdCard: guestIdCard || null,
        guestCount: guestCount || 1,
        checkInDate: startDate.toDate(),
        checkOutDate: endDate.toDate(),
        nights,
        totalPrice,
        deposit: deposit || 0,
        source: source || ReservationSource.OFFLINE,
        status: ReservationStatus.CONFIRMED,
        handledBy: req.user?.id,
        remark
      } as any);

      reservation.setDataValue('validTransitions' as any, ReservationStatusService.getValidTransitions(reservation.status));

      await OperationLogger.createLog('预订管理', `创建预订: ${orderNo}`, req, reservation);

      return ResponseUtil.success(res, reservation, '预订成功');
    } catch (error) {
      next(error);
    }
  }

  static async checkIn(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { reservationId, roomId, guestName, guestPhone, guestIdCard, checkInDate, remark } = req.body;

      if (!reservationId || !roomId || !guestName || !guestPhone || !guestIdCard) {
        throw new BadRequestException('必填项不能为空');
      }

      const t = await sequelize.transaction();

      try {
        const reservation = await Reservation.findByPk(reservationId, { transaction: t });
        if (!reservation) {
          throw new NotFoundException('预订不存在');
        }

        if (reservation.status !== ReservationStatus.CONFIRMED) {
          throw new ConflictException('该预订状态不允许办理入住');
        }

        const room = await Room.findByPk(roomId, { transaction: t });
        if (!room) {
          throw new NotFoundException('客房不存在');
        }

        if (room.status !== RoomStatus.VACANT) {
          throw new ConflictException('该客房当前不可用');
        }

        let guest = await Guest.findOne({ where: { idCard: guestIdCard }, transaction: t });
        if (!guest) {
          guest = await Guest.create({
            name: guestName,
            idCard: guestIdCard,
            phone: guestPhone
          } as any, { transaction: t });
        }

        const checkInRecord = await CheckInRecord.create({
          reservationId,
          roomId,
          guestId: guest.id,
          checkInDate: checkInDate ? moment(checkInDate).toDate() : new Date(),
          nights: reservation.nights,
          roomPrice: reservation.totalPrice,
          extraCharges: 0,
          totalAmount: reservation.totalPrice,
          paidAmount: reservation.deposit,
          isCheckedOut: false,
          checkedInBy: req.user?.id,
          remark
        } as any, { transaction: t });

        await reservation.update({
          roomId,
          status: ReservationStatus.CHECKED_IN,
          checkInTime: new Date(),
          guestName,
          guestPhone,
          guestIdCard
        }, { transaction: t });

        reservation.setDataValue('validTransitions' as any, ReservationStatusService.getValidTransitions(ReservationStatus.CHECKED_IN));

        await RoomStatusService.onCheckIn(roomId, req, t);

        await t.commit();

        await OperationLogger.checkInLog('入住管理', `办理入住: ${room.roomNumber}`, req, checkInRecord);

        return ResponseUtil.success(res, checkInRecord, '办理入住成功');
      } catch (error) {
        await t.rollback();
        throw error;
      }
    } catch (error) {
      next(error);
    }
  }

  static async checkOut(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { checkInRecordId, extraCharges, paymentMethod, remark } = req.body;

      if (!checkInRecordId || !paymentMethod) {
        throw new BadRequestException('必填项不能为空');
      }

      const t = await sequelize.transaction();

      try {
        const checkInRecord = await CheckInRecord.findByPk(checkInRecordId, {
          include: [
            { model: Reservation, as: 'reservation' },
            { model: Room, as: 'room' }
          ],
          transaction: t
        });

        if (!checkInRecord) {
          throw new NotFoundException('入住记录不存在');
        }

        if (checkInRecord.isCheckedOut) {
          throw new ConflictException('该订单已退房');
        }

        const totalAmount = Number(checkInRecord.roomPrice) + Number(extraCharges || 0);
        const remainingAmount = totalAmount - Number(checkInRecord.paidAmount);

        const paymentNo = `PAY${moment().format('YYYYMMDDHHmmss')}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

        await Payment.create({
          paymentNo,
          reservationId: checkInRecord.reservationId,
          type: PaymentType.ROOM_CHARGE,
          amount: remainingAmount > 0 ? remainingAmount : 0,
          method: paymentMethod,
          handledBy: req.user?.id
        } as any, { transaction: t });

        await checkInRecord.update({
          checkOutDate: new Date(),
          extraCharges: extraCharges || 0,
          totalAmount,
          paidAmount: totalAmount,
          isCheckedOut: true,
          checkedOutBy: req.user?.id,
          remark
        }, { transaction: t });

        const updatedReservation = await checkInRecord.reservation.update({
          status: ReservationStatus.CHECKED_OUT,
          checkOutTime: new Date()
        }, { transaction: t });

        updatedReservation.setDataValue('validTransitions' as any, ReservationStatusService.getValidTransitions(ReservationStatus.CHECKED_OUT));

        await RoomStatusService.onCheckOut(checkInRecord.roomId, req, t);

        await t.commit();

        await OperationLogger.checkOutLog('入住管理', `办理退房: ${checkInRecord.room.roomNumber}`, req);

        return ResponseUtil.success(res, { checkInRecord, totalAmount, paidAmount: totalAmount }, '退房成功');
      } catch (error) {
        await t.rollback();
        throw error;
      }
    } catch (error) {
      next(error);
    }
  }

  static async getGuestList(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { name, phone, idCard, page = 1, pageSize = 20 } = req.query;

      const where: any = {};
      if (name) where.name = { [Op.like]: `%${name}%` };
      if (phone) where.phone = { [Op.like]: `%${phone}%` };
      if (idCard) where.idCard = { [Op.like]: `%${idCard}%` };

      const { count, rows } = await Guest.findAndCountAll({
        where,
        order: [['createdAt', 'DESC']],
        offset: (Number(page) - 1) * Number(pageSize),
        limit: Number(pageSize)
      });

      return ResponseUtil.page(res, rows, count, Number(page), Number(pageSize));
    } catch (error) {
      next(error);
    }
  }

  static async getGuestDetail(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const guest = await Guest.findByPk(id);
      if (!guest) {
        throw new NotFoundException('宾客不存在');
      }

      const checkIns = await CheckInRecord.findAll({
        where: { guestId: id },
        include: [
          { model: Room, as: 'room' },
          { model: Reservation, as: 'reservation' }
        ],
        order: [['checkInDate', 'DESC']],
        limit: 20
      });

      const totalNights = checkIns.reduce((sum, c) => sum + c.nights, 0);
      const totalSpent = checkIns.reduce((sum, c) => sum + Number(c.totalAmount), 0);

      return ResponseUtil.success(res, {
        guest,
        stats: {
          totalStays: checkIns.length,
          totalNights,
          totalSpent
        },
        recentStays: checkIns
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateGuest(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { name, phone, idCard, gender, address, remark } = req.body;

      const guest = await Guest.findByPk(id);
      if (!guest) {
        throw new NotFoundException('宾客不存在');
      }

      if (idCard && idCard !== guest.idCard) {
        const existing = await Guest.findOne({ where: { idCard } });
        if (existing) {
          throw new ConflictException('身份证号已存在');
        }
      }

      await guest.update({
        name: name || guest.name,
        phone: phone || guest.phone,
        idCard: idCard || guest.idCard,
        gender: gender || guest.gender,
        address: address !== undefined ? address : guest.address,
        remark: remark !== undefined ? remark : guest.remark
      });

      await OperationLogger.updateLog('宾客管理', `更新宾客信息: ${guest.name}`, req);

      return ResponseUtil.success(res, guest, '更新成功');
    } catch (error) {
      next(error);
    }
  }

  static async getReservationStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query;

      const start = startDate ? new Date(startDate as string) : new Date(new Date().setDate(new Date().getDate() - 30));
      const end = endDate ? new Date(endDate as string) : new Date();

      const reservations = await Reservation.findAll({
        where: {
          createdAt: { [Op.between]: [start, end] }
        },
        attributes: ['status', 'source', 'totalPrice']
      });

      const statusStats = {} as any;
      const sourceStats = {} as any;
      let totalRevenue = 0;

      reservations.forEach(r => {
        statusStats[r.status] = (statusStats[r.status] || 0) + 1;
        sourceStats[r.source] = (sourceStats[r.source] || 0) + 1;
        totalRevenue += Number(r.totalPrice);
      });

      return ResponseUtil.success(res, {
        period: { start, end },
        totalReservations: reservations.length,
        totalRevenue,
        statusStats,
        sourceStats
      });
    } catch (error) {
      next(error);
    }
  }

  static async batchCheckIn(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { reservations, operatorId } = req.body;

      if (!reservations || !Array.isArray(reservations) || reservations.length === 0) {
        throw new BadRequestException('请提供入住数据');
      }

      const t = await sequelize.transaction();
      const results = [];

      try {
        for (const item of reservations) {
          const reservation = await Reservation.findByPk(item.reservationId, { transaction: t });
          if (!reservation) {
            throw new NotFoundException(`预订 ${item.reservationId} 不存在`);
          }

          if (reservation.status !== ReservationStatus.CONFIRMED) {
            throw new ConflictException(`预订 ${item.reservationId} 状态不允许入住`);
          }

          const room = await Room.findByPk(item.roomId, { transaction: t });
          if (!room) {
            throw new NotFoundException(`房间 ${item.roomId} 不存在`);
          }

          if (room.status !== RoomStatus.VACANT) {
            throw new ConflictException(`房间 ${room.roomNumber} 不可用`);
          }

          let guest = await Guest.findOne({ where: { idCard: item.guestIdCard }, transaction: t });
          if (!guest) {
            guest = await Guest.create({
              name: item.guestName,
              idCard: item.guestIdCard,
              phone: item.guestPhone
            } as any, { transaction: t });
          }

          const checkInRecord = await CheckInRecord.create({
            reservationId: item.reservationId,
            roomId: item.roomId,
            guestId: guest.id,
            checkInDate: new Date(),
            nights: reservation.nights,
            roomPrice: reservation.totalPrice,
            extraCharges: 0,
            totalAmount: reservation.totalPrice,
            paidAmount: reservation.deposit,
            isCheckedOut: false,
            checkedInBy: operatorId || req.user?.id
          } as any, { transaction: t });

          await reservation.update({
            roomId: item.roomId,
            status: ReservationStatus.CHECKED_IN,
            checkInTime: new Date(),
            guestName: item.guestName,
            guestPhone: item.guestPhone,
            guestIdCard: item.guestIdCard
          }, { transaction: t });

          await room.update({ status: RoomStatus.OCCUPIED }, { transaction: t });

          results.push(checkInRecord);
        }

        await t.commit();

        await OperationLogger.createLog('入住管理', `批量办理 ${results.length} 间入住`, req);

        return ResponseUtil.success(res, results, '批量办理入住成功');
      } catch (error) {
        await t.rollback();
        throw error;
      }
    } catch (error) {
      next(error);
    }
  }

  static async cancel(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const reservation = await ReservationStatusService.cancel(Number(id), reason, req);
      reservation.setDataValue('validTransitions' as any, ReservationStatusService.getValidTransitions(reservation.status));

      return ResponseUtil.success(res, reservation, '取消成功');
    } catch (error) {
      next(error);
    }
  }

  static async getStatusTransitions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const reservation = await Reservation.findByPk(id);
      if (!reservation) {
        throw new NotFoundException('预订不存在');
      }

      const validTransitions = ReservationStatusService.getValidTransitions(reservation.status);
      const transitionsWithDesc = validTransitions.map(status => ({
        status,
        description: ReservationStatusService.getTransitionDescription(status)
      }));

      return ResponseUtil.success(res, {
        currentStatus: reservation.status,
        validTransitions: transitionsWithDesc
      });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const reservation = await Reservation.findByPk(id, {
        include: [
          { model: RoomType, as: 'roomType' },
          { model: Room, as: 'room' }
        ]
      });

      if (!reservation) {
        throw new NotFoundException('预订不存在');
      }

      return ResponseUtil.success(res, reservation);
    } catch (error) {
      next(error);
    }
  }

  static async getList(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { orderNo, guestName, status, source, startDate, endDate, page = 1, pageSize = 20 } = req.query;

      const where: any = {};
      if (orderNo) where.orderNo = { [Op.like]: `%${orderNo}%` };
      if (guestName) where.guestName = { [Op.like]: `%${guestName}%` };
      if (status) where.status = status;
      if (source) where.source = source;
      if (startDate && endDate) {
        where.createdAt = {
          [Op.between]: [moment(startDate as string).startOf('day').toDate(), moment(endDate as string).endOf('day').toDate()]
        };
      }

      const { count, rows } = await Reservation.findAndCountAll({
        where,
        include: [
          { model: RoomType, as: 'roomType' },
          { model: Room, as: 'room' }
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

  static async getCheckInRecords(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { roomNumber, guestName, isCheckedOut, page = 1, pageSize = 20 } = req.query;

      const where: any = {};
      if (isCheckedOut !== undefined) where.isCheckedOut = isCheckedOut === 'true';

      const include: any[] = [
        { model: Reservation, as: 'reservation' },
        { model: Room, as: 'room', where: {} },
        { model: Guest, as: 'guest' }
      ];

      if (roomNumber) {
        include[1].where.roomNumber = { [Op.like]: `%${roomNumber}%` };
      }

      if (guestName) {
        include[2].where = { name: { [Op.like]: `%${guestName}%` } };
      }

      const { count, rows } = await CheckInRecord.findAndCountAll({
        where,
        include,
        order: [['checkInDate', 'DESC']],
        offset: (Number(page) - 1) * Number(pageSize),
        limit: Number(pageSize)
      });

      return ResponseUtil.page(res, rows, count, Number(page), Number(pageSize));
    } catch (error) {
      next(error);
    }
  }

  static async renew(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { checkInRecordId, days, roomPrice } = req.body;

      if (!checkInRecordId || !days || days <= 0) {
        throw new BadRequestException('参数错误');
      }

      const t = await sequelize.transaction();

      try {
        const checkInRecord = await CheckInRecord.findByPk(checkInRecordId, {
          include: [{ model: Reservation, as: 'reservation' }],
          transaction: t
        });

        if (!checkInRecord || checkInRecord.isCheckedOut) {
          throw new NotFoundException('入住记录不存在或已退房');
        }

        const pricePerDay = roomPrice || (Number(checkInRecord.roomPrice) / checkInRecord.nights);
        const addPrice = pricePerDay * days;

        await checkInRecord.update({
          nights: checkInRecord.nights + days,
          roomPrice: Number(checkInRecord.roomPrice) + addPrice,
          totalAmount: Number(checkInRecord.totalAmount) + addPrice
        }, { transaction: t });

        const newCheckOutDate = moment(checkInRecord.reservation.checkOutDate).add(days, 'days');
        await checkInRecord.reservation.update({
          nights: checkInRecord.reservation.nights + days,
          totalPrice: Number(checkInRecord.reservation.totalPrice) + addPrice,
          checkOutDate: newCheckOutDate.toDate()
        }, { transaction: t });

        await t.commit();

        await OperationLogger.updateLog('入住管理', `续房: ${days} 天`, req);

        return ResponseUtil.success(res, { checkInRecord, addPrice }, '续房成功');
      } catch (error) {
        await t.rollback();
        throw error;
      }
    } catch (error) {
      next(error);
    }
  }
}
