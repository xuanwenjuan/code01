import { Response } from 'express';
import { ApiResponse } from '../utils/response';
import { Settlement, Order, sequelize, OperationLog } from '../models';
import { AuthRequest } from '../middleware/auth';
import { SettlementStatus, SettlementType, PLATFORM_COMMISSION_RATE, SERVICE_PROVIDER_SHARE_RATE } from '../utils/constants';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { Op } from 'sequelize';

const generateSettlementNo = () => {
  const date = new Date();
  const timestamp = date.getTime().toString().slice(-8);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `SET${timestamp}${random}`;
};

export const getSettlementList = async (req: AuthRequest, res: Response) => {
  try {
    const { 
      page = 1, 
      pageSize = 10, 
      status, 
      type, 
      startDate, 
      endDate,
      keyword
    } = req.query;
    
    const where: any = {};
    if (status && status !== 'all') {
      where.status = status;
    }
    if (type && type !== 'all') {
      where.type = type;
    }
    
    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate as string), new Date(endDate as string)],
      };
    }

    let orderWhere: any = {};
    if (keyword) {
      orderWhere = {
        orderNo: { [Op.like]: `%${keyword}%` },
      };
    }

    const { count, rows } = await Settlement.findAndCountAll({
      where,
      offset: (Number(page) - 1) * Number(pageSize),
      limit: Number(pageSize),
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Order,
          as: 'order',
          attributes: ['id', 'orderNo', 'title', 'budget'],
          where: Object.keys(orderWhere).length > 0 ? orderWhere : undefined,
          required: false,
        },
      ],
    });

    return ApiResponse.paginated(res, rows, count, Number(page), Number(pageSize));
  } catch (error) {
    return ApiResponse.error(res, '获取结算列表失败');
  }
};

export const getSettlementById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const settlement = await Settlement.findByPk(id, {
      include: [
        {
          model: Order,
          as: 'order',
          attributes: ['id', 'orderNo', 'title', 'budget'],
        },
      ],
    });

    if (!settlement) {
      throw new NotFoundError('结算不存在');
    }

    return ApiResponse.success(res, settlement);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return ApiResponse.notFound(res, error.message);
    }
    return ApiResponse.error(res, '获取结算失败');
  }
};

export const createSettlementByOrderId = async (req: AuthRequest, res: Response) => {
  const t = await sequelize.transaction();
  
  try {
    const { orderId } = req.params;

    const order = await Order.findByPk(orderId, { transaction: t });
    if (!order) {
      throw new NotFoundError('订单不存在');
    }

    if (order.status !== 'completed') {
      throw new BadRequestError('订单未完成，无法创建结算');
    }

    const existingSettlement = await Settlement.findOne({
      where: { orderId },
      transaction: t,
    });

    if (existingSettlement) {
      throw new BadRequestError('该订单已创建结算');
    }

    const budget = parseFloat(order.budget as any);
    const platformCommission = budget * PLATFORM_COMMISSION_RATE;
    const serviceProviderShare = budget * SERVICE_PROVIDER_SHARE_RATE;
    const influencerEarning = budget - platformCommission - serviceProviderShare;

    const settlements = await Settlement.bulkCreate(
      [
        {
          settlementNo: generateSettlementNo(),
          orderId: order.id,
          userId: order.influencerId,
          type: SettlementType.INFLUENCER_EARNING,
          amount: influencerEarning,
          rate: 1 - PLATFORM_COMMISSION_RATE - SERVICE_PROVIDER_SHARE_RATE,
          status: SettlementStatus.PENDING,
          remark: '手动创建达人收益',
        },
        {
          settlementNo: generateSettlementNo(),
          orderId: order.id,
          userId: null,
          type: SettlementType.PLATFORM_COMMISSION,
          amount: platformCommission,
          rate: PLATFORM_COMMISSION_RATE,
          status: SettlementStatus.PENDING,
          remark: '手动创建平台佣金',
        },
        {
          settlementNo: generateSettlementNo(),
          orderId: order.id,
          userId: null,
          type: SettlementType.SERVICE_PROVIDER_SHARE,
          amount: serviceProviderShare,
          rate: SERVICE_PROVIDER_SHARE_RATE,
          status: SettlementStatus.PENDING,
          remark: '手动创建服务商分成',
        },
      ],
      { transaction: t }
    );

    await OperationLog.create(
      {
        userId: req.user!.id,
        username: req.user!.username,
        module: 'settlement',
        operation: 'create',
        method: 'POST',
        url: `/api/settlements/order/${orderId}`,
        params: { orderId },
        result: { count: settlements.length },
        status: true,
      },
      { transaction: t }
    );

    await t.commit();

    return ApiResponse.created(res, settlements, '结算创建成功');
  } catch (error) {
    await t.rollback();
    if (error instanceof NotFoundError) {
      return ApiResponse.notFound(res, error.message);
    }
    if (error instanceof BadRequestError) {
      return ApiResponse.badRequest(res, error.message);
    }
    return ApiResponse.error(res, '创建结算失败');
  }
};

export const processSettlement = async (req: AuthRequest, res: Response) => {
  const t = await sequelize.transaction();
  
  try {
    const { id } = req.params;

    const settlement = await Settlement.findByPk(id, { transaction: t });
    if (!settlement) {
      throw new NotFoundError('结算不存在');
    }

    if (settlement.status !== SettlementStatus.PENDING) {
      throw new BadRequestError('当前状态不允许处理');
    }

    await settlement.update(
      {
        status: SettlementStatus.PROCESSING,
      },
      { transaction: t }
    );

    await OperationLog.create(
      {
        userId: req.user!.id,
        username: req.user!.username,
        module: 'settlement',
        operation: 'process',
        method: 'PUT',
        url: `/api/settlements/${id}/process`,
        params: { settlementId: id },
        result: { settlementNo: settlement.settlementNo },
        status: true,
      },
      { transaction: t }
    );

    await t.commit();

    return ApiResponse.success(res, null, '结算处理中');
  } catch (error) {
    await t.rollback();
    if (error instanceof NotFoundError) {
      return ApiResponse.notFound(res, error.message);
    }
    if (error instanceof BadRequestError) {
      return ApiResponse.badRequest(res, error.message);
    }
    return ApiResponse.error(res, '处理结算失败');
  }
};

export const completeSettlement = async (req: AuthRequest, res: Response) => {
  const t = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { transactionId, remark } = req.body;

    const settlement = await Settlement.findByPk(id, { transaction: t });
    if (!settlement) {
      throw new NotFoundError('结算不存在');
    }

    if (settlement.status !== SettlementStatus.PROCESSING) {
      throw new BadRequestError('当前状态不允许完成');
    }

    await settlement.update(
      {
        status: SettlementStatus.SETTLED,
        transactionId,
        remark,
        settlementTime: new Date(),
      },
      { transaction: t }
    );

    await OperationLog.create(
      {
        userId: req.user!.id,
        username: req.user!.username,
        module: 'settlement',
        operation: 'complete',
        method: 'PUT',
        url: `/api/settlements/${id}/complete`,
        params: { settlementId: id },
        result: { settlementNo: settlement.settlementNo, amount: settlement.amount },
        status: true,
      },
      { transaction: t }
    );

    await t.commit();

    return ApiResponse.success(res, null, '结算完成');
  } catch (error) {
    await t.rollback();
    if (error instanceof NotFoundError) {
      return ApiResponse.notFound(res, error.message);
    }
    if (error instanceof BadRequestError) {
      return ApiResponse.badRequest(res, error.message);
    }
    return ApiResponse.error(res, '完成结算失败');
  }
};

export const batchProcessSettlements = async (req: AuthRequest, res: Response) => {
  const t = await sequelize.transaction();
  
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      throw new BadRequestError('请选择要处理的结算');
    }

    const settlements = await Settlement.findAll({
      where: { 
        id: { [Op.in]: ids },
        status: SettlementStatus.PENDING,
      },
      transaction: t,
    });

    if (settlements.length !== ids.length) {
      throw new BadRequestError('部分结算状态不允许处理');
    }

    await Settlement.update(
      { status: SettlementStatus.PROCESSING },
      { 
        where: { id: { [Op.in]: ids } },
        transaction: t,
      }
    );

    await OperationLog.create(
      {
        userId: req.user!.id,
        username: req.user!.username,
        module: 'settlement',
        operation: 'batch_process',
        method: 'PUT',
        url: '/api/settlements/batch-process',
        params: { ids },
        result: { count: settlements.length },
        status: true,
      },
      { transaction: t }
    );

    await t.commit();

    return ApiResponse.success(res, { processed: settlements.length }, '批量处理成功');
  } catch (error) {
    await t.rollback();
    if (error instanceof BadRequestError) {
      return ApiResponse.badRequest(res, error.message);
    }
    return ApiResponse.error(res, '批量处理失败');
  }
};

export const getStatistics = async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate, categoryId, type } = req.query;

    const where: any = {
      status: SettlementStatus.SETTLED,
    };

    if (startDate && endDate) {
      where.settlementTime = {
        [Op.between]: [new Date(startDate as string), new Date(endDate as string)],
      };
    }

    if (type && type !== 'all') {
      where.type = type;
    }

    const settlements = await Settlement.findAll({
      where,
      include: [
        {
          model: Order,
          as: 'order',
          attributes: ['id', 'categoryId'],
          where: categoryId ? { categoryId } : undefined,
          required: true,
        },
      ],
    });

    const totalAmount = settlements.reduce((sum, s) => sum + parseFloat(s.amount as any), 0);
    const influencerEarning = settlements
      .filter(s => s.type === SettlementType.INFLUENCER_EARNING)
      .reduce((sum, s) => sum + parseFloat(s.amount as any), 0);
    const platformCommission = settlements
      .filter(s => s.type === SettlementType.PLATFORM_COMMISSION)
      .reduce((sum, s) => sum + parseFloat(s.amount as any), 0);
    const serviceProviderShare = settlements
      .filter(s => s.type === SettlementType.SERVICE_PROVIDER_SHARE)
      .reduce((sum, s) => sum + parseFloat(s.amount as any), 0);

    return ApiResponse.success(res, {
      totalAmount,
      influencerEarning,
      platformCommission,
      serviceProviderShare,
      count: settlements.length,
    });
  } catch (error) {
    return ApiResponse.error(res, '获取统计失败');
  }
};
