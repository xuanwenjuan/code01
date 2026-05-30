import { Request, Response, NextFunction } from 'express';
import { Settlement, SettlementItem, OrderItem, Order, Artist, User } from '../models';
import { ResponseUtil } from '../utils/response';
import { AppError } from '../middleware/errorHandler';
import { SettlementStatus, PaginatedResult, OrderStatus, ArtistStatus } from '../types';
import { sequelize } from '../database';
import { Op } from 'sequelize';

const PLATFORM_FEE_RATE = 0.1;

export const generateSettlement = async (req: Request, res: Response, next: NextFunction) => {
  const t = await sequelize.transaction();
  
  try {
    const { month, artistId } = req.body;

    if (!month) {
      throw new AppError('请指定结算月份', 400, 400);
    }

    const startDate = new Date(`${month}-01`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    const artistWhere: any = {};
    if (artistId) {
      artistWhere.id = artistId;
    } else {
      artistWhere.status = ArtistStatus.APPROVED;
    }

    const artists = await Artist.findAll({ where: artistWhere, transaction: t });

    if (artists.length === 0) {
      throw new AppError('未找到符合条件的艺术家', 400, 400);
    }

    const results: any[] = [];

    for (const artist of artists) {
      const existingSettlement = await Settlement.findOne({
        where: { artistId: artist.id, month, status: { [Op.ne]: SettlementStatus.CANCELLED } },
        transaction: t
      });

      if (existingSettlement) {
        continue;
      }

      const completedOrderItems = await OrderItem.findAll({
        include: [
          {
            model: Order,
            as: 'order',
            where: {
              status: OrderStatus.COMPLETED,
              createdAt: {
                [Op.between]: [startDate, endDate]
              }
            },
            required: true
          }
        ],
        where: { artistId: artist.id },
        transaction: t
      });

      if (completedOrderItems.length === 0) {
        continue;
      }

      let totalAmount = 0;
      let platformFee = 0;
      let artistAmount = 0;

      const settlementItems: any[] = [];

      for (const item of completedOrderItems) {
        const itemAmount = Number(item.subtotal);
        const fee = itemAmount * PLATFORM_FEE_RATE;
        const artistShare = itemAmount - fee;

        totalAmount += itemAmount;
        platformFee += fee;
        artistAmount += artistShare;

        settlementItems.push({
          orderItemId: item.id,
          orderNo: (item as any).order.orderNo,
          productName: item.productName,
          orderAmount: itemAmount,
          platformFee: fee,
          artistAmount: artistShare
        });
      }

      const settlementNo = generateSettlementNo();

      const settlement = await Settlement.create(
        {
          settlementNo,
          artistId: artist.id,
          month,
          totalOrders: completedOrderItems.length,
          totalAmount,
          platformFee,
          artistAmount,
          status: SettlementStatus.PENDING
        },
        { transaction: t }
      );

      for (const si of settlementItems) {
        si.settlementId = settlement.id;
        await SettlementItem.create(si, { transaction: t });
      }

      results.push(settlement);
    }

    await t.commit();
    res.json(ResponseUtil.success(results, `生成 ${results.length} 条结算记录`));
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

export const getSettlements = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, pageSize = 10, status, artistId, month, startDate, endDate } = req.query;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (artistId) {
      where.artistId = artistId;
    }

    if (month) {
      where.month = month;
    }

    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate as string), new Date(endDate as string)]
      };
    }

    const { count, rows } = await Settlement.findAndCountAll({
      where,
      include: [
        { model: Artist, as: 'artist' },
        { model: User, as: 'payer', attributes: { exclude: ['password'] } }
      ],
      order: [['createdAt', 'DESC']],
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize)
    });

    const result: PaginatedResult<Settlement> = {
      list: rows,
      total: count,
      page: Number(page),
      pageSize: Number(pageSize)
    };

    res.json(ResponseUtil.success(result));
  } catch (error) {
    next(error);
  }
};

export const getSettlementById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const settlement = await Settlement.findByPk(id, {
      include: [
        { model: SettlementItem, as: 'items' },
        { model: Artist, as: 'artist' },
        { model: User, as: 'payer', attributes: { exclude: ['password'] } }
      ]
    });

    if (!settlement) {
      throw new AppError('结算记录不存在', 404, 404);
    }

    res.json(ResponseUtil.success(settlement));
  } catch (error) {
    next(error);
  }
};

export const confirmSettlement = async (req: Request, res: Response, next: NextFunction) => {
  const t = await sequelize.transaction();
  
  try {
    const { id } = req.params;

    const settlement = await Settlement.findByPk(id, { transaction: t });

    if (!settlement) {
      throw new AppError('结算记录不存在', 404, 404);
    }

    if (settlement.status !== SettlementStatus.PENDING) {
      throw new AppError('结算状态不正确，无法确认', 400, 400);
    }

    await settlement.update({
      status: SettlementStatus.SETTLED,
      confirmedAt: new Date()
    }, { transaction: t });

    await t.commit();
    res.json(ResponseUtil.success(settlement, '结算已确认'));
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

export const markAsPaid = async (req: Request, res: Response, next: NextFunction) => {
  const t = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const paidBy = req.user!.userId;
    const { remark, paymentMethod } = req.body;

    const settlement = await Settlement.findByPk(id, { transaction: t });

    if (!settlement) {
      throw new AppError('结算记录不存在', 404, 404);
    }

    if (settlement.status !== SettlementStatus.SETTLED) {
      throw new AppError('请先确认结算', 400, 400);
    }

    await settlement.update({
      status: SettlementStatus.PAID,
      paidBy,
      paidAt: new Date(),
      remark,
      paymentMethod: paymentMethod || 'bank_transfer'
    }, { transaction: t });

    await t.commit();
    res.json(ResponseUtil.success(settlement, '已标记为已打款'));
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

export const getMySettlements = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { page = 1, pageSize = 10, status, month } = req.query;

    const artist = await Artist.findOne({ where: { userId } });

    if (!artist) {
      throw new AppError('艺术家资料不存在', 404, 404);
    }

    const where: any = { artistId: artist.id };

    if (status) {
      where.status = status;
    }

    if (month) {
      where.month = month;
    }

    const { count, rows } = await Settlement.findAndCountAll({
      where,
      include: [{ model: SettlementItem, as: 'items' }],
      order: [['createdAt', 'DESC']],
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize)
    });

    const result: PaginatedResult<Settlement> = {
      list: rows,
      total: count,
      page: Number(page),
      pageSize: Number(pageSize)
    };

    res.json(ResponseUtil.success(result));
  } catch (error) {
    next(error);
  }
};

export const getSettlementStatistics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { artistId, month } = req.query;

    const where: any = {};

    if (artistId) {
      where.artistId = artistId;
    }

    if (month) {
      where.month = month;
    }

    const totalSettlements = await Settlement.count({ where });
    const pending = await Settlement.count({ where: { ...where, status: SettlementStatus.PENDING } });
    const settled = await Settlement.count({ where: { ...where, status: SettlementStatus.SETTLED } });
    const paid = await Settlement.count({ where: { ...where, status: SettlementStatus.PAID } });

    const totalAmount = await Settlement.sum('totalAmount', { where }) || 0;
    const totalPlatformFee = await Settlement.sum('platformFee', { where }) || 0;
    const totalArtistAmount = await Settlement.sum('artistAmount', { where }) || 0;

    res.json(ResponseUtil.success({
      totalSettlements,
      pending,
      settled,
      paid,
      totalAmount,
      totalPlatformFee,
      totalArtistAmount,
      platformFeeRate: PLATFORM_FEE_RATE
    }));
  } catch (error) {
    next(error);
  }
};

export const cancelSettlement = async (req: Request, res: Response, next: NextFunction) => {
  const t = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { cancelReason } = req.body;

    const settlement = await Settlement.findByPk(id, { transaction: t });

    if (!settlement) {
      throw new AppError('结算记录不存在', 404, 404);
    }

    if (settlement.status === SettlementStatus.PAID) {
      throw new AppError('已打款的结算无法取消', 400, 400);
    }

    await settlement.update({
      status: SettlementStatus.CANCELLED,
      remark: cancelReason || '取消结算'
    }, { transaction: t });

    await t.commit();
    res.json(ResponseUtil.success(settlement, '结算已取消'));
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

function generateSettlementNo(): string {
  const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, '').slice(0, 14);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `SET${timestamp}${random}`;
}
