import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { Op, Transaction } from 'sequelize';
import Auction, { AuctionStatus } from '../models/Auction';
import Equipment, { EquipmentStatus } from '../models/Equipment';
import Bid from '../models/Bid';
import User from '../models/User';
import Category from '../models/Category';
import { ApiResponse } from '../utils/response';
import { validateRequest } from '../middlewares/validateRequest';
import { AppError, NotFoundError } from '../exceptions/AppError';
import { UserRole } from '../models';
import dayjs from 'dayjs';
import sequelize from '../config/database';
import { createOrderFromAuction } from './orderController';

const createAuctionSchema = Joi.object({
  equipmentId: Joi.number().integer().required(),
  startPrice: Joi.number().positive().required(),
  reservePrice: Joi.number().positive().optional(),
  bidIncrement: Joi.number().positive().default(100),
  startTime: Joi.date().iso().required(),
  endTime: Joi.date().iso().greater(Joi.ref('startTime')).required(),
  extendTime: Joi.number().integer().min(0).default(300),
});

const bidSchema = Joi.object({
  bidPrice: Joi.number().positive().required(),
});

const generateAuctionNo = (): string => {
  const timestamp = dayjs().format('YYYYMMDDHHmmss');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `AU${timestamp}${random}`;
};

export const createAuction = [
  validateRequest(createAuctionSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    const t = await sequelize.transaction();
    try {
      const { equipmentId, startPrice, reservePrice, bidIncrement, startTime, endTime, extendTime } = req.body;
      
      const equipment = await Equipment.findByPk(equipmentId, { transaction: t });
      if (!equipment || equipment.isDeleted) {
        throw new NotFoundError('设备不存在');
      }
      
      if (equipment.sellerId !== req.user!.userId && req.user!.role !== UserRole.ADMIN) {
        throw new AppError('无权发布此设备的竞拍', 403);
      }
      
      if (equipment.status === EquipmentStatus.IN_AUCTION) {
        throw new AppError('该设备正在竞拍中', 400);
      }
      
      if (equipment.status === EquipmentStatus.SOLD) {
        throw new AppError('该设备已售出', 400);
      }
      
      const auctionNo = generateAuctionNo();
      
      const auction = await Auction.create(
        {
          auctionNo,
          equipmentId,
          sellerId: equipment.sellerId,
          startPrice,
          currentPrice: startPrice,
          reservePrice,
          bidIncrement,
          startTime,
          endTime,
          extendTime,
          status: AuctionStatus.PENDING,
          bidCount: 0,
        },
        { transaction: t }
      );
      
      await equipment.update({ status: EquipmentStatus.IN_AUCTION }, { transaction: t });
      
      await t.commit();
      
      ApiResponse.success(res, auction, '创建竞拍成功', 201);
    } catch (error) {
      await t.rollback();
      next(error);
    }
  },
];

export const placeBid = [
  validateRequest(bidSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    const t = await sequelize.transaction();
    try {
      const { id } = req.params;
      const { bidPrice } = req.body;
      const userId = req.user!.userId;
      
      const auction = await Auction.findByPk(id, { transaction: t });
      if (!auction) {
        throw new NotFoundError('竞拍不存在');
      }
      
      const now = dayjs();
      const startTime = dayjs(auction.startTime);
      const endTime = dayjs(auction.endTime);
      
      if (now.isBefore(startTime)) {
        throw new AppError('竞拍尚未开始', 400);
      }
      
      if (now.isAfter(endTime)) {
        throw new AppError('竞拍已结束', 400);
      }
      
      if (auction.status !== AuctionStatus.ONGOING && auction.status !== AuctionStatus.PENDING) {
        throw new AppError('竞拍状态异常', 400);
      }
      
      if (auction.sellerId === userId) {
        throw new AppError('卖家不能参与竞拍', 400);
      }
      
      const minBidPrice = auction.currentPrice + auction.bidIncrement;
      if (bidPrice < minBidPrice) {
        throw new AppError(`出价必须大于等于 ${minBidPrice}`, 400);
      }
      
      const latestBid = await Bid.findOne({
        where: { auctionId: id },
        order: [['bidPrice', 'DESC']],
        transaction: t,
      });
      
      if (latestBid && latestBid.bidPrice >= bidPrice) {
        throw new AppError('已存在更高或相等的出价', 400);
      }
      
      await Bid.create(
        {
          auctionId: id,
          userId,
          bidPrice,
          bidTime: new Date(),
          isAutoBid: false,
        },
        { transaction: t }
      );
      
      let newEndTime = auction.endTime;
      const timeLeft = endTime.diff(now, 'second');
      if (timeLeft < 300 && auction.extendTime > 0) {
        newEndTime = endTime.add(auction.extendTime, 'second').toDate();
      }
      
      await auction.update(
        {
          currentPrice: bidPrice,
          bidCount: auction.bidCount + 1,
          endTime: newEndTime,
          status: AuctionStatus.ONGOING,
        },
        { transaction: t }
      );
      
      await t.commit();
      
      ApiResponse.success(res, { bidPrice, auctionId: id }, '出价成功');
    } catch (error) {
      await t.rollback();
      next(error);
    }
  },
];

export const getAuctionById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const auction = await Auction.findByPk(id, {
      include: [
        {
          model: Equipment,
          as: 'equipment',
          include: [
            {
              model: Category,
              as: 'category',
              attributes: ['id', 'name'],
            },
          ],
        },
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'username', 'phone', 'realName'],
        },
      ],
    });
    
    if (!auction) {
      throw new NotFoundError('竞拍不存在');
    }
    
    const bids = await Bid.findAll({
      where: { auctionId: id },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username'],
        },
      ],
      order: [['bidPrice', 'DESC']],
      limit: 10,
    });
    
    ApiResponse.success(res, { ...auction.toJSON(), bids });
  } catch (error) {
    next(error);
  }
};

export const getAuctionList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      page = 1,
      pageSize = 10,
      status,
      categoryId,
      keyword,
      sortBy = 'endTime',
      sortOrder = 'ASC',
    } = req.query;
    
    const whereCondition: any = {};
    
    if (status) {
      whereCondition.status = status;
    }
    
    const equipmentWhere: any = { isDeleted: false };
    if (categoryId) {
      equipmentWhere.categoryId = categoryId;
    }
    if (keyword) {
      equipmentWhere[Op.or] = [
        { name: { [Op.like]: `%${keyword}%` } },
        { brand: { [Op.like]: `%${keyword}%` } },
      ];
    }
    
    const { count, rows } = await Auction.findAndCountAll({
      where: whereCondition,
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize),
      order: [[sortBy as string, sortOrder as string]],
      include: [
        {
          model: Equipment,
          as: 'equipment',
          where: equipmentWhere,
          include: [
            {
              model: Category,
              as: 'category',
              attributes: ['id', 'name'],
            },
          ],
        },
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'username'],
        },
      ],
    });
    
    ApiResponse.page(res, {
      list: rows,
      total: count,
      page: Number(page),
      pageSize: Number(pageSize),
    });
  } catch (error) {
    next(error);
  }
};

export const getMyBids = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, pageSize = 10 } = req.query;
    const userId = req.user!.userId;
    
    const { count, rows } = await Bid.findAndCountAll({
      where: { userId },
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize),
      order: [['bidTime', 'DESC']],
      include: [
        {
          model: Auction,
          as: 'auction',
          include: [
            {
              model: Equipment,
              as: 'equipment',
              attributes: ['id', 'name', 'brand'],
            },
          ],
        },
      ],
    });
    
    ApiResponse.page(res, {
      list: rows,
      total: count,
      page: Number(page),
      pageSize: Number(pageSize),
    });
  } catch (error) {
    next(error);
  }
};

export const cancelAuction = async (req: Request, res: Response, next: NextFunction) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    
    const auction = await Auction.findByPk(id, { transaction: t });
    if (!auction) {
      throw new NotFoundError('竞拍不存在');
    }
    
    if (auction.sellerId !== req.user!.userId && req.user!.role !== UserRole.ADMIN) {
      throw new AppError('无权取消此竞拍', 403);
    }
    
    if (auction.status === AuctionStatus.ENDED) {
      throw new AppError('已结束的竞拍不能取消', 400);
    }
    
    if (auction.bidCount > 0) {
      throw new AppError('已有出价的竞拍不能取消', 400);
    }
    
    await auction.update({ status: AuctionStatus.CANCELLED }, { transaction: t });
    
    const equipment = await Equipment.findByPk(auction.equipmentId, { transaction: t });
    if (equipment) {
      await equipment.update({ status: EquipmentStatus.OFF_SHELF }, { transaction: t });
    }
    
    await t.commit();
    
    ApiResponse.success(res, null, '取消竞拍成功');
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

export const endAuction = async (req: Request, res: Response, next: NextFunction) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    
    const auction = await Auction.findByPk(id, { transaction: t });
    if (!auction) {
      throw new NotFoundError('竞拍不存在');
    }
    
    if (auction.sellerId !== req.user!.userId && req.user!.role !== UserRole.ADMIN) {
      throw new AppError('无权结束此竞拍', 403);
    }
    
    if (auction.status === AuctionStatus.ENDED || auction.status === AuctionStatus.CANCELLED) {
      throw new AppError('此竞拍状态不允许结束', 400);
    }
    
    const now = new Date();
    const startTime = new Date(auction.startTime);
    
    if (now < startTime) {
      throw new AppError('竞拍尚未开始，不能提前结束', 400);
    }
    
    if (auction.bidCount === 0) {
      await auction.update({ status: AuctionStatus.FAILED }, { transaction: t });
      
      const equipment = await Equipment.findByPk(auction.equipmentId, { transaction: t });
      if (equipment) {
        await equipment.update({ status: EquipmentStatus.OFF_SHELF }, { transaction: t });
      }
      
      await t.commit();
      ApiResponse.success(res, null, '竞拍已流拍');
    } else {
      await t.commit();
      
      const order = await createOrderFromAuction(id);
      ApiResponse.success(res, { order }, '竞拍已结束，订单已生成');
    }
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

export const getAuctionBids = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { page = 1, pageSize = 20 } = req.query;
    
    const auction = await Auction.findByPk(id);
    if (!auction) {
      throw new NotFoundError('竞拍不存在');
    }
    
    const { count, rows } = await Bid.findAndCountAll({
      where: { auctionId: id },
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize),
      order: [['bidPrice', 'DESC']],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'avatar'],
        },
      ],
    });
    
    ApiResponse.page(res, {
      list: rows,
      total: count,
      page: Number(page),
      pageSize: Number(pageSize),
    });
  } catch (error) {
    next(error);
  }
};

export const getMyAuctions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, pageSize = 10, status } = req.query;
    const sellerId = req.user!.userId;
    
    const whereCondition: any = { sellerId };
    
    if (status) {
      whereCondition.status = status;
    }
    
    const { count, rows } = await Auction.findAndCountAll({
      where: whereCondition,
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize),
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Equipment,
          as: 'equipment',
          attributes: ['id', 'name', 'brand'],
        },
      ],
    });
    
    ApiResponse.page(res, {
      list: rows,
      total: count,
      page: Number(page),
      pageSize: Number(pageSize),
    });
  } catch (error) {
    next(error);
  }
};

export const getAuctionStatistics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sellerId = req.user!.userId;
    
    const statusCounts = await Auction.findAll({
      where: { sellerId },
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      group: ['status'],
    });
    
    const totalCount = await Auction.count({ where: { sellerId } });
    
    const totalBids = await Bid.count({
      include: [
        {
          model: Auction,
          as: 'auction',
          where: { sellerId },
        },
      ],
    });
    
    const statistics: Record<string, number> = {};
    Object.values(AuctionStatus).forEach(status => {
      statistics[status] = 0;
    });
    
    statusCounts.forEach((item: any) => {
      statistics[item.status] = item.getDataValue('count');
    });
    
    ApiResponse.success(res, {
      total: totalCount,
      totalBids,
      byStatus: statistics,
    });
  } catch (error) {
    next(error);
  }
};
