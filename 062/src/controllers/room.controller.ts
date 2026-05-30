import { Response, NextFunction } from 'express';
import { Room, RoomStatus, RoomOrientation } from '../models/Room';
import { RoomType } from '../models/RoomType';
import { AuthRequest } from '../middleware/auth.middleware';
import { ResponseUtil } from '../utils/response';
import { BadRequestException, NotFoundException, ConflictException } from '../exceptions/HttpException';
import { OperationLogger } from '../utils/logger';
import { Op, Transaction, fn, col } from 'sequelize';
import sequelize from '../config/database';
import { CheckInRecord } from '../models/CheckInRecord';
import { Reservation } from '../models/Reservation';
import { Guest } from '../models/Guest';
import { RoomStatusService } from '../services/roomStatus.service';
import { RoomStatusChangeType } from '../models/RoomStatusHistory';

export class RoomController {
  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { roomNumber, roomTypeId, floor, orientation, facilities, remark } = req.body;

      if (!roomNumber || !roomTypeId) {
        throw new BadRequestException('房间号和房型不能为空');
      }

      const roomType = await RoomType.findByPk(roomTypeId);
      if (!roomType) {
        throw new NotFoundException('房型不存在');
      }

      const existing = await Room.findOne({ where: { roomNumber } });
      if (existing) {
        throw new ConflictException('房间号已存在');
      }

      const room = await Room.create({
        roomNumber,
        roomTypeId,
        floor: floor || 1,
        orientation: orientation || null,
        facilities: facilities ? JSON.stringify(facilities) : null,
        remark,
        status: RoomStatus.VACANT
      } as any);

      await OperationLogger.createLog('客房管理', `创建客房: ${roomNumber}`, req, room);

      return ResponseUtil.success(res, room, '创建成功');
    } catch (error) {
      next(error);
    }
  }

  static async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { roomNumber, roomTypeId, floor, orientation, facilities, remark } = req.body;

      const room = await Room.findByPk(id);
      if (!room) {
        throw new NotFoundException('客房不存在');
      }

      if (roomNumber && roomNumber !== room.roomNumber) {
        const existing = await Room.findOne({ where: { roomNumber, id: { [Op.ne]: id } } });
        if (existing) {
          throw new ConflictException('房间号已存在');
        }
      }

      if (roomTypeId && roomTypeId !== room.roomTypeId) {
        const roomType = await RoomType.findByPk(roomTypeId);
        if (!roomType) {
          throw new NotFoundException('房型不存在');
        }
      }

      const updateData: any = {};
      if (roomNumber !== undefined) updateData.roomNumber = roomNumber;
      if (roomTypeId !== undefined) updateData.roomTypeId = roomTypeId;
      if (floor !== undefined) updateData.floor = floor;
      if (orientation !== undefined) updateData.orientation = orientation;
      if (facilities !== undefined) updateData.facilities = JSON.stringify(facilities);
      if (remark !== undefined) updateData.remark = remark;

      await room.update(updateData);

      await OperationLogger.updateLog('客房管理', `更新客房: ${room.roomNumber}`, req, updateData);

      return ResponseUtil.success(res, room, '更新成功');
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const room = await Room.findByPk(id);
      if (!room) {
        throw new NotFoundException('客房不存在');
      }

      if (room.status === RoomStatus.OCCUPIED) {
        throw new ConflictException('客房正在入住中，无法删除');
      }

      await room.destroy();

      await OperationLogger.deleteLog('客房管理', `删除客房: ${room.roomNumber}`, req);

      return ResponseUtil.success(res, null, '删除成功');
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const room = await Room.findByPk(id, {
        include: [{ model: RoomType, as: 'roomType' }]
      });
      if (!room) {
        throw new NotFoundException('客房不存在');
      }

      return ResponseUtil.success(res, room);
    } catch (error) {
      next(error);
    }
  }

  static async getList(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { roomNumber, roomTypeId, floor, status, page = 1, pageSize = 20 } = req.query;

      const where: any = {};
      if (roomNumber) where.roomNumber = { [Op.like]: `%${roomNumber}%` };
      if (roomTypeId) where.roomTypeId = roomTypeId;
      if (floor) where.floor = floor;
      if (status) where.status = status;

      const { count, rows } = await Room.findAndCountAll({
        where,
        include: [{ model: RoomType, as: 'roomType' }],
        order: [['floor', 'ASC'], ['roomNumber', 'ASC']],
        offset: (Number(page) - 1) * Number(pageSize),
        limit: Number(pageSize)
      });

      return ResponseUtil.page(res, rows, count, Number(page), Number(pageSize));
    } catch (error) {
      next(error);
    }
  }

  static async updateStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status, remark } = req.body;

      if (!status || !Object.values(RoomStatus).includes(status)) {
        throw new BadRequestException('无效的房间状态');
      }

      const room = await RoomStatusService.changeStatus(
        Number(id),
        status,
        RoomStatusChangeType.MANUAL,
        req,
        remark
      );

      await OperationLogger.statusChangeLog('客房管理', `客房 ${room.roomNumber} 状态变更为 ${status}`, req);

      return ResponseUtil.success(res, room, '状态更新成功');
    } catch (error) {
      next(error);
    }
  }

  static async lockRoom(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { reason, lockedUntil } = req.body;

      if (!reason) {
        throw new BadRequestException('锁定原因不能为空');
      }

      const room = await RoomStatusService.lockRoom(
        Number(id),
        reason,
        lockedUntil ? new Date(lockedUntil) : undefined,
        req
      );

      await OperationLogger.statusChangeLog('客房管理', `锁定客房 ${room.roomNumber}: ${reason}`, req);

      return ResponseUtil.success(res, room, '锁定成功');
    } catch (error) {
      next(error);
    }
  }

  static async unlockRoom(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { remark } = req.body;

      const room = await RoomStatusService.unlockRoom(Number(id), req, remark);

      await OperationLogger.statusChangeLog('客房管理', `解锁客房 ${room.roomNumber}`, req);

      return ResponseUtil.success(res, room, '解锁成功');
    } catch (error) {
      next(error);
    }
  }

  static async completeCleaning(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const room = await RoomStatusService.completeCleaning(Number(id), req);

      await OperationLogger.statusChangeLog('客房管理', `客房 ${room.roomNumber} 清洁完成`, req);

      return ResponseUtil.success(res, room, '清洁完成');
    } catch (error) {
      next(error);
    }
  }

  static async startMaintenance(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const room = await RoomStatusService.startMaintenance(Number(id), req, reason);

      await OperationLogger.statusChangeLog('客房管理', `开始维护客房 ${room.roomNumber}`, req);

      return ResponseUtil.success(res, room, '开始维护');
    } catch (error) {
      next(error);
    }
  }

  static async endMaintenance(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const room = await RoomStatusService.endMaintenance(Number(id), req);

      await OperationLogger.statusChangeLog('客房管理', `客房 ${room.roomNumber} 维护完成`, req);

      return ResponseUtil.success(res, room, '维护完成');
    } catch (error) {
      next(error);
    }
  }

  static async getStatusHistory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { limit = 50 } = req.query;

      const history = await RoomStatusService.getStatusHistory(Number(id), Number(limit));

      return ResponseUtil.success(res, history);
    } catch (error) {
      next(error);
    }
  }

  static async batchUpdateStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { ids, status, remark } = req.body;

      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        throw new BadRequestException('请选择要操作的客房');
      }

      if (!status || !Object.values(RoomStatus).includes(status)) {
        throw new BadRequestException('无效的房间状态');
      }

      const t = await sequelize.transaction();

      try {
        await Room.update(
          { status, remark },
          { where: { id: { [Op.in]: ids } }, transaction: t }
        );

        await t.commit();

        await OperationLogger.statusChangeLog('客房管理', `批量更新 ${ids.length} 间客房状态为 ${status}`, req);

        return ResponseUtil.success(res, { updated: ids.length }, '批量更新成功');
      } catch (error) {
        await t.rollback();
        throw error;
      }
    } catch (error) {
      next(error);
    }
  }

  static async getRoomStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const total = await Room.count();
      const vacant = await Room.count({ where: { status: RoomStatus.VACANT } });
      const occupied = await Room.count({ where: { status: RoomStatus.OCCUPIED } });
      const cleaning = await Room.count({ where: { status: RoomStatus.CLEANING } });
      const maintenance = await Room.count({ where: { status: RoomStatus.MAINTENANCE } });

      return ResponseUtil.success(res, {
        total,
        vacant,
        occupied,
        cleaning,
        maintenance,
        occupancyRate: total > 0 ? ((occupied / total) * 100).toFixed(2) : '0.00'
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAvailableRooms(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { roomTypeId, startDate, endDate } = req.query;

      const where: any = { status: RoomStatus.VACANT };
      if (roomTypeId) where.roomTypeId = roomTypeId;

      if (startDate && endDate) {
        const start = new Date(startDate as string);
        const end = new Date(endDate as string);

        const busyRooms = await CheckInRecord.findAll({
          where: {
            isCheckedOut: false,
            checkInDate: { [Op.lte]: end },
            [Op.or]: [
              { checkOutDate: { [Op.gte]: start } },
              { checkOutDate: null }
            ]
          },
          attributes: ['roomId']
        });

        const busyRoomIds = busyRooms.map(record => record.roomId);
        if (busyRoomIds.length > 0) {
          where.id = { [Op.notIn]: busyRoomIds };
        }
      }

      const rooms = await Room.findAll({
        where,
        include: [{ model: RoomType, as: 'roomType' }],
        order: [['floor', 'ASC'], ['roomNumber', 'ASC']]
      });

      return ResponseUtil.success(res, rooms);
    } catch (error) {
      next(error);
    }
  }

  static async getRoomDetail(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const room = await Room.findByPk(id, {
        include: [
          { model: RoomType, as: 'roomType' }
        ]
      });

      if (!room) {
        throw new NotFoundException('客房不存在');
      }

      const currentCheckIn = await CheckInRecord.findOne({
        where: {
          roomId: id,
          isCheckedOut: false
        },
        include: [
          { model: Reservation, as: 'reservation' },
          { model: Guest, as: 'guest' }
        ],
        order: [['checkInDate', 'DESC']]
      });

      const recentCheckIns = await CheckInRecord.findAll({
        where: { roomId: id },
        include: [
          { model: Reservation, as: 'reservation' },
          { model: Guest, as: 'guest' }
        ],
        order: [['checkInDate', 'DESC']],
        limit: 10
      });

      const statusHistory = await RoomStatusService.getStatusHistory(Number(id), 20);

      return ResponseUtil.success(res, {
        room,
        currentCheckIn,
        recentCheckIns,
        statusHistory
      });
    } catch (error) {
      next(error);
    }
  }

  static async getRoomCalendar(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate, roomTypeId } = req.query;

      const start = startDate ? new Date(startDate as string) : new Date();
      const end = endDate ? new Date(endDate as string) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      const roomWhere: any = {};
      if (roomTypeId) roomWhere.roomTypeId = roomTypeId;

      const rooms = await Room.findAll({
        where: roomWhere,
        include: [{ model: RoomType, as: 'roomType' }],
        order: [['floor', 'ASC'], ['roomNumber', 'ASC']]
      });

      const checkIns = await CheckInRecord.findAll({
        where: {
          checkInDate: { [Op.lte]: end },
          [Op.or]: [
            { checkOutDate: { [Op.gte]: start } },
            { checkOutDate: null }
          ]
        },
        include: [
          { model: Reservation, as: 'reservation' },
          { model: Guest, as: 'guest' }
        ]
      });

      const calendar = rooms.map(room => {
        const roomCheckIns = checkIns.filter(c => c.roomId === room.id);
        return {
          room,
          bookings: roomCheckIns.map(c => ({
            id: c.id,
            reservationId: c.reservationId,
            guestName: c.guest?.name,
            checkInDate: c.checkInDate,
            checkOutDate: c.checkOutDate,
            nights: c.nights,
            status: c.isCheckedOut ? 'checked_out' : 'checked_in'
          }))
        };
      });

      return ResponseUtil.success(res, {
        startDate: start,
        endDate: end,
        calendar
      });
    } catch (error) {
      next(error);
    }
  }

  static async getFloorRooms(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { floor } = req.params;

      const rooms = await Room.findAll({
        where: { floor: Number(floor) },
        include: [{ model: RoomType, as: 'roomType' }],
        order: [['roomNumber', 'ASC']]
      });

      const stats = {
        total: rooms.length,
        vacant: rooms.filter(r => r.status === RoomStatus.VACANT).length,
        occupied: rooms.filter(r => r.status === RoomStatus.OCCUPIED).length,
        cleaning: rooms.filter(r => r.status === RoomStatus.CLEANING).length,
        maintenance: rooms.filter(r => r.status === RoomStatus.MAINTENANCE).length
      };

      return ResponseUtil.success(res, { rooms, stats });
    } catch (error) {
      next(error);
    }
  }

  static async getAvailableFloors(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const floors = await Room.findAll({
        attributes: [[fn('DISTINCT', col('floor')), 'floor']],
        order: [[col('floor'), 'ASC']],
        raw: true
      });

      return ResponseUtil.success(res, floors.map(f => f.floor));
    } catch (error) {
      next(error);
    }
  }

  static async batchCreate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { rooms } = req.body;

      if (!rooms || !Array.isArray(rooms) || rooms.length === 0) {
        throw new BadRequestException('请提供客房数据');
      }

      const t = await sequelize.transaction();

      try {
        const createdRooms = [];
        for (const roomData of rooms) {
          const existing = await Room.findOne({ where: { roomNumber: roomData.roomNumber }, transaction: t });
          if (existing) {
            throw new ConflictException(`房间号 ${roomData.roomNumber} 已存在`);
          }

          const room = await Room.create({
            ...roomData,
            status: RoomStatus.VACANT
          } as any, { transaction: t });
          createdRooms.push(room);
        }

        await t.commit();

        await OperationLogger.createLog('客房管理', `批量创建 ${createdRooms.length} 间客房`, req);

        return ResponseUtil.success(res, createdRooms, '批量创建成功');
      } catch (error) {
        await t.rollback();
        throw error;
      }
    } catch (error) {
      next(error);
    }
  }
}
