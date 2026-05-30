import { Request, Response } from 'express';
import { Room, RoomCategory, Order } from '../models';
import { ResponseUtil } from '../utils/response';
import { RoomStatus, OrderStatus } from '../constants';
import { RoomFilterParams, PaginationResult, RoomEntity } from '../types';
import { Op, Transaction } from 'sequelize';
import sequelize from '../config/database';

export const createRoom = async (req: Request, res: Response) => {
  const { roomNo, categoryId, building, floor, bedCount, maxGuests, area, facilities, images, peakPrice, normalPrice, lowPrice, description } = req.body;
  const t = await sequelize.transaction();
  try {
    const existingRoom = await Room.findOne({ where: { roomNo }, transaction: t });
    if (existingRoom) {
      await t.rollback();
      return res.status(400).json(ResponseUtil.badRequest('房间号已存在'));
    }
    const category = await RoomCategory.findByPk(categoryId, { transaction: t });
    if (!category) {
      await t.rollback();
      return res.status(400).json(ResponseUtil.badRequest('房型分类不存在'));
    }
    if (!category.status) {
      await t.rollback();
      return res.status(400).json(ResponseUtil.badRequest('该房型分类已下架'));
    }
    const room = await Room.create({
      roomNo, categoryId, building, floor, bedCount, maxGuests, area,
      facilities: typeof facilities === 'string' ? facilities : JSON.stringify(facilities),
      images: typeof images === 'string' ? images : JSON.stringify(images || []),
      peakPrice, normalPrice, lowPrice, status: RoomStatus.VACANT, description
    }, { transaction: t });
    await t.commit();
    res.status(201).json(ResponseUtil.success(room, '创建房源成功'));
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

export const getRoomList = async (req: Request, res: Response) => {
  const {
    page = 1, pageSize = 10, status, building, categoryId, minGuests, maxGuests,
    minPrice, maxPrice, facilities, checkInDate, checkOutDate, keyword
  } = req.query as RoomFilterParams;
  const where: any = {};
  if (status) where.status = status;
  if (building) where.building = building;
  if (categoryId) where.categoryId = categoryId;
  if (minGuests !== undefined) where.maxGuests = { [Op.gte]: minGuests };
  if (maxGuests !== undefined) where.maxGuests = { ...where.maxGuests, [Op.lte]: maxGuests };
  if (minPrice !== undefined || maxPrice !== undefined) {
    const priceCondition: any = {};
    if (minPrice !== undefined) priceCondition[Op.gte] = minPrice;
    if (maxPrice !== undefined) priceCondition[Op.lte] = maxPrice;
    where[Op.or] = [
      { peakPrice: priceCondition },
      { normalPrice: priceCondition },
      { lowPrice: priceCondition }
    ];
  }
  if (facilities) {
    const facilityList = Array.isArray(facilities) ? facilities : [facilities];
    for (const facility of facilityList) {
      where.facilities = { [Op.like]: `%${facility}%` };
    }
  }
  if (keyword) {
    where[Op.or] = [
      ...(where[Op.or] || []),
      { roomNo: { [Op.like]: `%${keyword}%` } },
      { building: { [Op.like]: `%${keyword}%` } },
      { floor: { [Op.like]: `%${keyword}%` } }
    ];
  }
  let availableRoomIds: number[] | undefined;
  if (checkInDate && checkOutDate) {
    const conflictingOrders = await Order.findAll({
      where: {
        status: { [Op.in]: [OrderStatus.PENDING_PAYMENT, OrderStatus.PAID, OrderStatus.CHECKED_IN] },
        [Op.or]: [
          { checkInDate: { [Op.between]: [new Date(checkInDate), new Date(checkOutDate)] } },
          { checkOutDate: { [Op.between]: [new Date(checkInDate), new Date(checkOutDate)] } },
          {
            [Op.and]: [
              { checkInDate: { [Op.lte]: new Date(checkOutDate) } },
              { checkOutDate: { [Op.gte]: new Date(checkInDate) } }
            ]
          }
        ]
      },
      attributes: ['roomId']
    });
    const occupiedRoomIds = conflictingOrders.map(o => o.roomId);
    availableRoomIds = occupiedRoomIds.length > 0 ? occupiedRoomIds : undefined;
  }
  const whereClause = availableRoomIds ? { ...where, id: { [Op.notIn]: availableRoomIds } } : where;
  const { count, rows } = await Room.findAndCountAll({
    where: whereClause,
    include: [{ model: RoomCategory, as: 'category', attributes: ['id', 'name', 'level'] }],
    offset: (Number(page) - 1) * Number(pageSize),
    limit: Number(pageSize),
    order: [['building', 'ASC'], ['floor', 'ASC'], ['roomNo', 'ASC']]
  });
  const result: PaginationResult<RoomEntity> = {
    list: rows as unknown as RoomEntity[],
    total: count,
    page: Number(page),
    pageSize: Number(pageSize)
  };
  res.json(ResponseUtil.success(result));
};

export const getRoomById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const room = await Room.findByPk(id, {
    include: [{ model: RoomCategory, as: 'category' }]
  });
  if (!room) return res.status(404).json(ResponseUtil.notFound('房源不存在'));
  res.json(ResponseUtil.success(room));
};

export const updateRoom = async (req: Request, res: Response) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { categoryId, facilities, images, ...updateData } = req.body;
    const room = await Room.findByPk(id, { transaction: t });
    if (!room) {
      await t.rollback();
      return res.status(404).json(ResponseUtil.notFound('房源不存在'));
    }
    if (categoryId !== undefined) {
      const category = await RoomCategory.findByPk(categoryId, { transaction: t });
      if (!category) {
        await t.rollback();
        return res.status(400).json(ResponseUtil.badRequest('房型分类不存在'));
      }
      if (!category.status) {
        await t.rollback();
        return res.status(400).json(ResponseUtil.badRequest('该房型分类已下架'));
      }
      room.categoryId = categoryId;
    }
    if (facilities !== undefined) {
      room.facilities = typeof facilities === 'string' ? facilities : JSON.stringify(facilities);
    }
    if (images !== undefined) {
      room.images = typeof images === 'string' ? images : JSON.stringify(images);
    }
    Object.assign(room, updateData);
    await room.save({ transaction: t });
    await t.commit();
    res.json(ResponseUtil.success(room, '更新房源成功'));
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

export const deleteRoom = async (req: Request, res: Response) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const room = await Room.findByPk(id, { transaction: t });
    if (!room) {
      await t.rollback();
      return res.status(404).json(ResponseUtil.notFound('房源不存在'));
    }
    const activeOrder = await Order.findOne({
      where: {
        roomId: id,
        status: { [Op.in]: [OrderStatus.PENDING_PAYMENT, OrderStatus.PAID, OrderStatus.CHECKED_IN] }
      },
      transaction: t
    });
    if (activeOrder) {
      await t.rollback();
      return res.status(400).json(ResponseUtil.badRequest('该房源有活跃订单，无法删除'));
    }
    await room.destroy({ transaction: t });
    await t.commit();
    res.json(ResponseUtil.success(null, '删除房源成功'));
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

export const updateRoomStatus = async (req: Request, res: Response) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { status } = req.body;
    const room = await Room.findByPk(id, { transaction: t });
    if (!room) {
      await t.rollback();
      return res.status(404).json(ResponseUtil.notFound('房源不存在'));
    }
    const previousStatus = room.status;
    room.status = status;
    await room.save({ transaction: t });
    await t.commit();
    const statusText: Record<string, string> = {
      [RoomStatus.VACANT]: '空闲',
      [RoomStatus.BOOKED]: '已预订',
      [RoomStatus.CHECKED_IN]: '已入住',
      [RoomStatus.MAINTENANCE]: '维护中',
      [RoomStatus.LOCKED]: '已锁定'
    };
    res.json(ResponseUtil.success({ previousStatus, currentStatus: status }, `房源状态已更新为${statusText[status]}`));
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

export const getMaintenanceRooms = async (req: Request, res: Response) => {
  const today = new Date();
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  const rooms = await Room.findAll({
    where: {
      nextMaintenanceDate: { [Op.between]: [today, nextWeek] }
    },
    include: [{ model: RoomCategory, as: 'category', attributes: ['name'] }],
    order: [['nextMaintenanceDate', 'ASC']]
  });
  res.json(ResponseUtil.success(rooms));
};

export const updateMaintenanceDate = async (req: Request, res: Response) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { lastMaintenanceDate, nextMaintenanceDate } = req.body;
    const room = await Room.findByPk(id, { transaction: t });
    if (!room) {
      await t.rollback();
      return res.status(404).json(ResponseUtil.notFound('房源不存在'));
    }
    if (lastMaintenanceDate) room.lastMaintenanceDate = new Date(lastMaintenanceDate);
    if (nextMaintenanceDate) room.nextMaintenanceDate = new Date(nextMaintenanceDate);
    await room.save({ transaction: t });
    await t.commit();
    res.json(ResponseUtil.success(null, '维保日期更新成功'));
  } catch (error) {
    await t.rollback();
    throw error;
  }
};
