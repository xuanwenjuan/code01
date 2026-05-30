import { Room, RoomStatus } from '../models/Room';
import { RoomStatusHistory, RoomStatusChangeType } from '../models/RoomStatusHistory';
import { CheckInRecord } from '../models/CheckInRecord';
import { AuthRequest } from '../middleware/auth.middleware';
import { ConflictException, NotFoundException, BadRequestException } from '../exceptions/HttpException';
import { Transaction, Op } from 'sequelize';
import sequelize from '../config/database';

export class RoomStatusService {
  static async changeStatus(
    roomId: number,
    newStatus: RoomStatus,
    changeType: RoomStatusChangeType,
    req?: AuthRequest,
    remark?: string,
    transaction?: Transaction
  ): Promise<Room> {
    const t = transaction || (await sequelize.transaction());

    try {
      const room = await Room.findByPk(roomId, { transaction: t });
      if (!room) {
        throw new NotFoundException('客房不存在');
      }

      if (room.isLocked && newStatus !== RoomStatus.MAINTENANCE) {
        throw new ConflictException('该客房已被锁定，无法变更状态');
      }

      const oldStatus = room.status;

      await room.update({ status: newStatus }, { transaction: t });

      await RoomStatusHistory.create(
        {
          roomId,
          oldStatus: String(oldStatus),
          newStatus: String(newStatus),
          changeType,
          operatorId: req?.user?.id || null,
          operatorName: String(req?.user?.username || ''),
          remark: String(remark || '')
        } as any,
        { transaction: t }
      );

      if (!transaction) {
        await t.commit();
      }

      return room;
    } catch (error) {
      if (!transaction) {
        await t.rollback();
      }
      throw error;
    }
  }

  static async lockRoom(
    roomId: number,
    reason: string,
    lockedUntil?: Date,
    req?: AuthRequest
  ): Promise<Room> {
    const t = await sequelize.transaction();

    try {
      const room = await Room.findByPk(roomId, { transaction: t });
      if (!room) {
        throw new NotFoundException('客房不存在');
      }

      if (room.status === RoomStatus.OCCUPIED) {
        throw new ConflictException('客房正在入住中，无法锁定');
      }

      if (room.isLocked) {
        throw new ConflictException('客房已处于锁定状态');
      }

      const oldStatus = room.status;

      await room.update(
        {
          isLocked: true,
          lockReason: reason,
          lockedUntil: lockedUntil || null
        },
        { transaction: t }
      );

      await RoomStatusHistory.create(
        {
          roomId,
          oldStatus: String(oldStatus),
          newStatus: String(oldStatus),
          changeType: RoomStatusChangeType.LOCK,
          operatorId: req?.user?.id || null,
          operatorName: String(req?.user?.username || ''),
          remark: reason
        } as any,
        { transaction: t }
      );

      await t.commit();

      return room;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  static async unlockRoom(roomId: number, req?: AuthRequest, remark?: string): Promise<Room> {
    const t = await sequelize.transaction();

    try {
      const room = await Room.findByPk(roomId, { transaction: t });
      if (!room) {
        throw new NotFoundException('客房不存在');
      }

      if (!room.isLocked) {
        throw new BadRequestException('客房未处于锁定状态');
      }

      const oldStatus = room.status;

      await room.update(
        {
          isLocked: false,
          lockReason: null,
          lockedUntil: null
        },
        { transaction: t }
      );

      await RoomStatusHistory.create(
        {
          roomId,
          oldStatus: String(oldStatus),
          newStatus: String(oldStatus),
          changeType: RoomStatusChangeType.UNLOCK,
          operatorId: req?.user?.id || null,
          operatorName: String(req?.user?.username || ''),
          remark: String(remark || '')
        } as any,
        { transaction: t }
      );

      await t.commit();

      return room;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  static async onCheckIn(roomId: number, req?: AuthRequest, transaction?: Transaction): Promise<Room> {
    return this.changeStatus(
      roomId,
      RoomStatus.OCCUPIED,
      RoomStatusChangeType.CHECK_IN,
      req,
      '办理入住自动变更',
      transaction
    );
  }

  static async onCheckOut(roomId: number, req?: AuthRequest, transaction?: Transaction): Promise<Room> {
    return this.changeStatus(
      roomId,
      RoomStatus.CLEANING,
      RoomStatusChangeType.CHECK_OUT,
      req,
      '办理退房自动转为清洁中',
      transaction
    );
  }

  static async completeCleaning(roomId: number, req?: AuthRequest): Promise<Room> {
    return this.changeStatus(
      roomId,
      RoomStatus.VACANT,
      RoomStatusChangeType.CLEAN_COMPLETE,
      req,
      '清洁完成转为空闲'
    );
  }

  static async startMaintenance(roomId: number, req?: AuthRequest, reason?: string): Promise<Room> {
    return this.changeStatus(
      roomId,
      RoomStatus.MAINTENANCE,
      RoomStatusChangeType.MAINTENANCE_START,
      req,
      reason || '开始维护'
    );
  }

  static async endMaintenance(roomId: number, req?: AuthRequest): Promise<Room> {
    return this.changeStatus(
      roomId,
      RoomStatus.VACANT,
      RoomStatusChangeType.MAINTENANCE_END,
      req,
      '维护完成转为空闲'
    );
  }

  static async checkAndReleaseExpiredLocks(): Promise<number> {
    const now = new Date();
    const t = await sequelize.transaction();

    try {
      const lockedRooms = await Room.findAll({
        where: {
          isLocked: true,
          lockedUntil: {
            [Op.ne]: null,
            [Op.lte]: now
          }
        },
        transaction: t
      });

      let releasedCount = 0;

      for (const room of lockedRooms) {
        const oldStatus = room.status;

        await room.update(
          {
            isLocked: false,
            lockReason: null,
            lockedUntil: null
          },
          { transaction: t }
        );

        await RoomStatusHistory.create(
          {
            roomId: room.id,
            oldStatus: String(oldStatus),
            newStatus: String(oldStatus),
            changeType: RoomStatusChangeType.UNLOCK,
            operatorId: null,
            operatorName: 'System',
            remark: '锁定时间到期自动解锁'
          } as any,
          { transaction: t }
        );

        releasedCount++;
      }

      await t.commit();

      return releasedCount;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  static async getStatusHistory(roomId: number, limit: number = 50): Promise<RoomStatusHistory[]> {
    return RoomStatusHistory.findAll({
      where: { roomId },
      order: [['createdAt', 'DESC']],
      limit
    });
  }
}
