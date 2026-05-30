import { Response, NextFunction } from 'express';
import { RoomType, RoomTypeStatus } from '../models/RoomType';
import { AuthRequest } from '../middleware/auth.middleware';
import { ResponseUtil } from '../utils/response';
import { BadRequestException, NotFoundException, ConflictException } from '../exceptions/HttpException';
import { OperationLogger } from '../utils/logger';
import sequelize from '../config/database';
import { Op } from 'sequelize';

export class RoomTypeController {
  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { name, description, facilities, basePrice, weekendPrice, holidayPrice, maxGuests, bedCount, area, parentId, sortOrder } = req.body;

      if (!name || !basePrice) {
        throw new BadRequestException('房型名称和基础价格不能为空');
      }

      const existing = await RoomType.findOne({ where: { name } });
      if (existing) {
        throw new ConflictException('房型名称已存在');
      }

      const roomType = await RoomType.create({
        name,
        description,
        facilities: facilities ? JSON.stringify(facilities) : null,
        basePrice,
        weekendPrice,
        holidayPrice,
        maxGuests: maxGuests || 0,
        bedCount: bedCount || 0,
        area: area || 0,
        parentId: parentId || null,
        sortOrder: sortOrder || 0,
        status: RoomTypeStatus.ON_SHELF
      } as any);

      await OperationLogger.createLog('房型管理', `创建房型: ${name}`, req, roomType);

      return ResponseUtil.success(res, roomType, '创建成功');
    } catch (error) {
      next(error);
    }
  }

  static async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { name, description, facilities, basePrice, weekendPrice, holidayPrice, maxGuests, bedCount, area, parentId, sortOrder } = req.body;

      const roomType = await RoomType.findByPk(id);
      if (!roomType) {
        throw new NotFoundException('房型不存在');
      }

      if (name && name !== roomType.name) {
        const existing = await RoomType.findOne({ where: { name, id: { [Op.ne]: id } } });
        if (existing) {
          throw new ConflictException('房型名称已存在');
        }
      }

      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (facilities !== undefined) updateData.facilities = JSON.stringify(facilities);
      if (basePrice !== undefined) updateData.basePrice = basePrice;
      if (weekendPrice !== undefined) updateData.weekendPrice = weekendPrice;
      if (holidayPrice !== undefined) updateData.holidayPrice = holidayPrice;
      if (maxGuests !== undefined) updateData.maxGuests = maxGuests;
      if (bedCount !== undefined) updateData.bedCount = bedCount;
      if (area !== undefined) updateData.area = area;
      if (parentId !== undefined) updateData.parentId = parentId;
      if (sortOrder !== undefined) updateData.sortOrder = sortOrder;

      await roomType.update(updateData);

      await OperationLogger.updateLog('房型管理', `更新房型: ${roomType.name}`, req, updateData);

      return ResponseUtil.success(res, roomType, '更新成功');
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const roomType = await RoomType.findByPk(id);
      if (!roomType) {
        throw new NotFoundException('房型不存在');
      }

      const hasRooms = await roomType.$count('rooms');
      if (hasRooms > 0) {
        throw new ConflictException('该房型下存在客房，无法删除');
      }

      await roomType.destroy();

      await OperationLogger.deleteLog('房型管理', `删除房型: ${roomType.name}`, req);

      return ResponseUtil.success(res, null, '删除成功');
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const roomType = await RoomType.findByPk(id, {
        include: [{ association: 'rooms', limit: 10 }]
      });
      if (!roomType) {
        throw new NotFoundException('房型不存在');
      }

      return ResponseUtil.success(res, roomType);
    } catch (error) {
      next(error);
    }
  }

  static async getList(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { name, status, page = 1, pageSize = 10 } = req.query;

      const where: any = {};
      if (name) where.name = { [Op.like]: `%${name}%` };
      if (status) where.status = status;

      const { count, rows } = await RoomType.findAndCountAll({
        where,
        order: [['sortOrder', 'ASC'], ['createdAt', 'DESC']],
        offset: (Number(page) - 1) * Number(pageSize),
        limit: Number(pageSize)
      });

      return ResponseUtil.page(res, rows, count, Number(page), Number(pageSize));
    } catch (error) {
      next(error);
    }
  }

  static async getTree(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { includeOffline = 'false' } = req.query;
      
      const where: any = {};
      if (includeOffline !== 'true') {
        where.status = RoomTypeStatus.ON_SHELF;
      }

      const allTypes = await RoomType.findAll({
        where,
        order: [['sortOrder', 'ASC'], ['createdAt', 'DESC']],
        include: [
          {
            association: 'rooms',
            attributes: ['id', 'roomNumber', 'status', 'floor'],
            required: false
          }
        ]
      });

      const buildTree = (parentId: number | null = null, level: number = 0): any[] => {
        return allTypes
          .filter(t => t.parentId === parentId)
          .map(t => ({
            id: t.id,
            parentId: t.parentId,
            name: t.name,
            description: t.description,
            basePrice: t.basePrice,
            weekendPrice: t.weekendPrice,
            holidayPrice: t.holidayPrice,
            maxGuests: t.maxGuests,
            bedCount: t.bedCount,
            area: t.area,
            facilities: t.facilities ? JSON.parse(t.facilities) : null,
            status: t.status,
            sortOrder: t.sortOrder,
            level,
            roomCount: t.rooms?.length || 0,
            rooms: t.rooms?.map((r: any) => ({
              id: r.id,
              roomNumber: r.roomNumber,
              status: r.status,
              floor: r.floor
            })) || [],
            children: buildTree(t.id, level + 1)
          }));
      };

      const tree = buildTree(null);

      const flattenTree = (nodes: any[]): any[] => {
        return nodes.reduce((acc, node) => {
          const { children, ...rest } = node;
          return [...acc, rest, ...flattenTree(children || [])];
        }, []);
      };

      return ResponseUtil.success(res, {
        tree,
        flatList: flattenTree(tree),
        totalCount: allTypes.length
      });
    } catch (error) {
      next(error);
    }
  }

  static async toggleStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const roomType = await RoomType.findByPk(id);
      if (!roomType) {
        throw new NotFoundException('房型不存在');
      }

      const newStatus = roomType.status === RoomTypeStatus.ON_SHELF 
        ? RoomTypeStatus.OFF_SHELF 
        : RoomTypeStatus.ON_SHELF;

      await roomType.update({ status: newStatus });

      await OperationLogger.statusChangeLog('房型管理', `房型 ${roomType.name} ${newStatus === RoomTypeStatus.ON_SHELF ? '上架' : '下架'}`, req);

      return ResponseUtil.success(res, { status: newStatus }, '状态更新成功');
    } catch (error) {
      next(error);
    }
  }

  static async getAvailable(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const roomTypes = await RoomType.findAll({
        where: { status: RoomTypeStatus.ON_SHELF },
        order: [['sortOrder', 'ASC']]
      });

      return ResponseUtil.success(res, roomTypes);
    } catch (error) {
      next(error);
    }
  }
}
