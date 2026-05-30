import { Equipment, Order, OrderItem } from '../models';
import { OrderStatus } from '../common/enums';
import sequelize from '../config/database';
import { EquipmentScheduleParams, EquipmentAvailability } from '../types';

const { Op } = sequelize.Sequelize;

export class EquipmentScheduleService {
  static async checkScheduleConflict(
    params: EquipmentScheduleParams
  ): Promise<{ hasConflict: boolean; conflicts: EquipmentAvailability[] }> {
    const { equipmentIds, startTime, endTime, excludeOrderId } = params;
    const start = new Date(startTime);
    const end = new Date(endTime);

    const conflicts: EquipmentAvailability[] = [];

    for (const equipmentId of equipmentIds) {
      const equipment = await Equipment.findByPk(equipmentId);
      if (!equipment) continue;

      const whereClause: any = {
        status: {
          [Op.notIn]: [OrderStatus.CANCELLED, OrderStatus.COMPLETED],
        },
        [Op.or]: [
          {
            startTime: { [Op.between]: [start, end] },
          },
          {
            endTime: { [Op.between]: [start, end] },
          },
          {
            [Op.and]: [
              { startTime: { [Op.lte]: start } },
              { endTime: { [Op.gte]: end } },
            ],
          },
        ],
      };

      if (excludeOrderId) {
        whereClause.id = { [Op.ne]: excludeOrderId };
      }

      const conflictingOrders = await Order.findAll({
        where: whereClause,
        include: [
          {
            model: OrderItem,
            as: 'items',
            where: { equipmentId },
            attributes: ['quantity', 'unitPrice'],
          },
        ],
        attributes: ['id', 'orderNo', 'startTime', 'endTime', 'status'],
      });

      if (conflictingOrders.length > 0) {
        conflicts.push({
          equipmentId: equipment.id,
          equipmentName: equipment.name,
          assetNo: equipment.assetNo,
          isAvailable: false,
          conflictingOrders: conflictingOrders.map((order: any) => ({
            orderId: order.id,
            orderNo: order.orderNo,
            startTime: order.startTime,
            endTime: order.endTime,
            status: order.status,
          })),
        });
      }
    }

    return {
      hasConflict: conflicts.length > 0,
      conflicts,
    };
  }

  static async getEquipmentSchedule(
    equipmentId: number,
    startDate?: string,
    endDate?: string
  ): Promise<any[]> {
    const whereClause: any = {};

    if (startDate && endDate) {
      whereClause[Op.or] = [
        {
          startTime: { [Op.between]: [new Date(startDate), new Date(endDate)] },
        },
        {
          endTime: { [Op.between]: [new Date(startDate), new Date(endDate)] },
        },
        {
          [Op.and]: [
            { startTime: { [Op.lte]: new Date(startDate) } },
            { endTime: { [Op.gte]: new Date(endDate) } },
          ],
        },
      ];
    }

    whereClause.status = {
      [Op.notIn]: [OrderStatus.CANCELLED, OrderStatus.COMPLETED],
    };

    const orders = await Order.findAll({
      where: whereClause,
      include: [
        {
          model: OrderItem,
          as: 'items',
          where: { equipmentId },
          attributes: ['quantity', 'unitPrice'],
        },
      ],
      attributes: ['id', 'orderNo', 'eventName', 'startTime', 'endTime', 'status'],
      order: [['startTime', 'ASC']],
    });

    return orders;
  }

  static async getAvailableEquipments(
    categoryId: number,
    startTime: string,
    endTime: string
  ): Promise<any[]> {
    const start = new Date(startTime);
    const end = new Date(endTime);

    const equipments = await Equipment.findAll({
      where: {
        categoryId,
        status: 'IN_STOCK',
      },
      include: [
        {
          model: OrderItem,
          as: 'orderItems',
          include: [
            {
              model: Order,
              as: 'order',
              where: {
                status: {
                  [Op.notIn]: [OrderStatus.CANCELLED, OrderStatus.COMPLETED],
                },
                [Op.or]: [
                  {
                    startTime: { [Op.between]: [start, end] },
                  },
                  {
                    endTime: { [Op.between]: [start, end] },
                  },
                  {
                    [Op.and]: [
                      { startTime: { [Op.lte]: start } },
                      { endTime: { [Op.gte]: end } },
                    ],
                  },
                ],
              },
              required: false,
              attributes: ['id', 'orderNo', 'startTime', 'endTime', 'status'],
            },
          ],
          required: false,
        },
      ],
    });

    return equipments.filter(
      (eq: any) => !eq.orderItems || eq.orderItems.length === 0
    );
  }
}