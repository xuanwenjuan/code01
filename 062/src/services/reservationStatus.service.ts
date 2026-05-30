import { Reservation, ReservationStatus } from '../models/Reservation';
import { OperationType } from '../models/OperationLog';
import { BadRequestException, NotFoundException, ConflictException } from '../exceptions/HttpException';
import { OperationLogger } from '../utils/logger';
import { AuthRequest } from '../middleware/auth.middleware';

export interface StatusTransition {
  from: ReservationStatus[];
  to: ReservationStatus;
  allowedRoles: string[];
  description: string;
}

export const STATUS_TRANSITIONS: StatusTransition[] = [
  {
    from: [ReservationStatus.PENDING],
    to: ReservationStatus.CONFIRMED,
    allowedRoles: ['admin', 'manager', 'receptionist'],
    description: '确认预订'
  },
  {
    from: [ReservationStatus.CONFIRMED],
    to: ReservationStatus.CHECKED_IN,
    allowedRoles: ['admin', 'manager', 'receptionist'],
    description: '办理入住'
  },
  {
    from: [ReservationStatus.CHECKED_IN],
    to: ReservationStatus.CHECKED_OUT,
    allowedRoles: ['admin', 'manager', 'receptionist'],
    description: '办理退房'
  },
  {
    from: [ReservationStatus.CONFIRMED, ReservationStatus.PENDING],
    to: ReservationStatus.CANCELLED,
    allowedRoles: ['admin', 'manager', 'receptionist'],
    description: '取消预订'
  },
  {
    from: [ReservationStatus.CONFIRMED],
    to: ReservationStatus.NO_SHOW,
    allowedRoles: ['admin', 'manager', 'system'],
    description: '标记未到店'
  }
];

export class ReservationStatusService {
  static canTransition(currentStatus: ReservationStatus, targetStatus: ReservationStatus): boolean {
    const transition = STATUS_TRANSITIONS.find(t => t.to === targetStatus);
    if (!transition) return false;
    return transition.from.includes(currentStatus);
  }

  static getValidTransitions(currentStatus: ReservationStatus): ReservationStatus[] {
    return STATUS_TRANSITIONS
      .filter(t => t.from.includes(currentStatus))
      .map(t => t.to);
  }

  static getTransitionDescription(targetStatus: ReservationStatus): string {
    const transition = STATUS_TRANSITIONS.find(t => t.to === targetStatus);
    return transition?.description || '状态变更';
  }

  static async transition(
    reservationId: number,
    targetStatus: ReservationStatus,
    req?: AuthRequest,
    remark?: string
  ): Promise<Reservation> {
    const reservation = await Reservation.findByPk(reservationId);
    if (!reservation) {
      throw new NotFoundException('预订不存在');
    }

    if (reservation.status === targetStatus) {
      throw new BadRequestException('订单已是目标状态');
    }

    if (!this.canTransition(reservation.status, targetStatus)) {
      const validTransitions = this.getValidTransitions(reservation.status);
      throw new ConflictException(
        `无法从 ${reservation.status} 状态变更为 ${targetStatus}。` +
        `允许的目标状态: ${validTransitions.join(', ') || '无'}`
      );
    }

    const oldStatus = reservation.status;
    await reservation.update({
      status: targetStatus,
      remark: remark ? `${reservation.remark || ''}\n${remark}`.trim() : reservation.remark
    });

    const description = this.getTransitionDescription(targetStatus);
    await OperationLogger.log(
      '预订管理',
      OperationType.STATUS_CHANGE,
      `${description}: 订单 ${reservation.orderNo} 从 ${oldStatus} 变更为 ${targetStatus}`,
      req
    );

    return reservation;
  }

  static async confirm(reservationId: number, req?: AuthRequest): Promise<Reservation> {
    return this.transition(reservationId, ReservationStatus.CONFIRMED, req, '系统自动确认');
  }

  static async cancel(reservationId: number, reason?: string, req?: AuthRequest): Promise<Reservation> {
    return this.transition(reservationId, ReservationStatus.CANCELLED, req, `取消原因: ${reason || '未说明'}`);
  }

  static async markNoShow(reservationId: number, req?: AuthRequest): Promise<Reservation> {
    return this.transition(reservationId, ReservationStatus.NO_SHOW, req, '系统自动标记未到店');
  }
}
