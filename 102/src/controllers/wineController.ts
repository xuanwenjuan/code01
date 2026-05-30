import { Response, NextFunction } from 'express';
import { Op, Transaction } from 'sequelize';
import Wine from '../models/Wine';
import WorkOrder from '../models/WorkOrder';
import ResponseUtil from '../utils/response';
import { BadRequestError, NotFoundError } from '../utils/errors';
import { AuthRequest } from '../middleware/auth';
import sequelize from '../database';
import dayjs from 'dayjs';
import { WineStatus } from '../constants';

export const getWineList = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { 
      page = 1, 
      pageSize = 10, 
      status, 
      vintageYear,
      vintageStartYear,
      vintageEndYear,
      origin,
      keyword,
      expiringSoon,
      expired,
      sortBy = 'id',
      sortOrder = 'DESC'
    } = req.query;
    
    const where: any = {};
    
    if (status) where.status = status;
    if (vintageYear) where.vintageYear = Number(vintageYear);
    if (vintageStartYear || vintageEndYear) {
      where.vintageYear = {};
      if (vintageStartYear) where.vintageYear[Op.gte] = Number(vintageStartYear);
      if (vintageEndYear) where.vintageYear[Op.lte] = Number(vintageEndYear);
    }
    if (origin) where.origin = { [Op.like]: `%${origin}%` };
    if (keyword) {
      where[Op.or] = [
        { name: { [Op.like]: `%${keyword}%` } },
        { batchNo: { [Op.like]: `%${keyword}%` } },
        { flavorProfile: { [Op.like]: `%${keyword}%` } },
        { description: { [Op.like]: `%${keyword}%` } },
      ];
    }

    const now = new Date();
    if (expiringSoon === 'true') {
      const soonDate = dayjs().add(3, 'month').toDate();
      where.bestDrinkEndDate = { [Op.lte]: soonDate, [Op.gte]: now };
    }
    if (expired === 'true') {
      where.bestDrinkEndDate = { [Op.lt]: now };
    }

    const order: any[] = [];
    if (sortBy && sortOrder) {
      order.push([sortBy as string, sortOrder as string]);
    }
    order.push(['id', 'DESC']);

    const { count, rows } = await Wine.findAndCountAll({
      where,
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize),
      order,
    });

    ResponseUtil.pagination(
      res,
      {
        list: rows,
        total: count,
        page: Number(page),
        pageSize: Number(pageSize),
      },
      '查询成功'
    );
  } catch (error) {
    next(error);
  }
};

export const getWineById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const wine = await Wine.findByPk(id, {
      include: [
        {
          model: WorkOrder,
          as: 'workOrders',
          attributes: ['id', 'orderNo', 'name', 'status', 'currentStage'],
        },
      ],
    });

    if (!wine) {
      throw new NotFoundError('酒品不存在');
    }

    const wineData: any = wine.toJSON();
    const now = new Date();
    wineData.drinkStatus = 'normal';
    
    if (wineData.bestDrinkEndDate) {
      if (wineData.bestDrinkEndDate < now) {
        wineData.drinkStatus = 'expired';
      } else if (dayjs(wineData.bestDrinkEndDate).diff(now, 'month') <= 3) {
        wineData.drinkStatus = 'expiring_soon';
      }
    }

    ResponseUtil.success(res, wineData);
  } catch (error) {
    next(error);
  }
};

export const getWineByBatchNo = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { batchNo } = req.params;
    const wine = await Wine.findOne({ 
      where: { batchNo },
      include: [
        {
          model: WorkOrder,
          as: 'workOrders',
          attributes: ['id', 'orderNo', 'name', 'status'],
        },
      ],
    });

    if (!wine) {
      throw new NotFoundError('酒品不存在');
    }

    ResponseUtil.success(res, wine);
  } catch (error) {
    next(error);
  }
};

export const createWine = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const transaction: Transaction = await sequelize.transaction();
  
  try {
    const { batchNo } = req.body;

    const existingWine = await Wine.findOne({ where: { batchNo }, transaction });
    if (existingWine) {
      throw new BadRequestError('批次号已存在');
    }

    const wine = await Wine.create(req.body, { transaction });
    
    await transaction.commit();
    ResponseUtil.success(res, wine, '创建成功');
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

export const batchCreateWine = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const transaction: Transaction = await sequelize.transaction();
  
  try {
    const { items } = req.body;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new BadRequestError('酒品列表不能为空');
    }

    const batchNos = items.map((item: any) => item.batchNo);
    const duplicates = await Wine.findAll({
      where: { batchNo: { [Op.in]: batchNos } },
      attributes: ['batchNo'],
      transaction,
    });

    if (duplicates.length > 0) {
      const duplicateBatchNos = duplicates.map((d: any) => d.batchNo).join(', ');
      throw new BadRequestError(`批次号已存在: ${duplicateBatchNos}`);
    }

    const wines = await Wine.bulkCreate(items, { transaction, returning: true });
    
    await transaction.commit();
    ResponseUtil.success(res, {
      total: wines.length,
      items: wines,
    }, '批量创建成功');
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

export const updateWine = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const transaction: Transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { batchNo } = req.body;

    const wine = await Wine.findByPk(id, { transaction });
    if (!wine) {
      throw new NotFoundError('酒品不存在');
    }

    if (batchNo && batchNo !== wine.batchNo) {
      const existingWine = await Wine.findOne({ where: { batchNo }, transaction });
      if (existingWine) {
        throw new BadRequestError('批次号已存在');
      }
    }

    await wine.update(req.body, { transaction });
    
    await transaction.commit();
    ResponseUtil.success(res, wine, '更新成功');
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

export const deleteWine = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const transaction: Transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;

    const wine = await Wine.findByPk(id, { transaction });
    if (!wine) {
      throw new NotFoundError('酒品不存在');
    }

    const workOrderCount = await WorkOrder.count({ 
      where: { wineId: id },
      transaction,
    });
    if (workOrderCount > 0) {
      throw new BadRequestError('该酒品关联有工单，无法删除');
    }

    await wine.destroy({ transaction });
    
    await transaction.commit();
    ResponseUtil.success(res, null, '删除成功');
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

export const updateWineStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const transaction: Transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    if (!Object.values(WineStatus).includes(status)) {
      throw new BadRequestError('无效的酒品状态');
    }

    const wine = await Wine.findByPk(id, { transaction });
    if (!wine) {
      throw new NotFoundError('酒品不存在');
    }

    await wine.update({ status }, { transaction });
    
    await transaction.commit();
    ResponseUtil.success(res, wine, '状态更新成功');
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

export const batchUpdateWineStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const transaction: Transaction = await sequelize.transaction();
  
  try {
    const { ids, status, reason } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      throw new BadRequestError('酒品ID列表不能为空');
    }

    if (!Object.values(WineStatus).includes(status)) {
      throw new BadRequestError('无效的酒品状态');
    }

    const wines = await Wine.findAll({
      where: { id: { [Op.in]: ids } },
      transaction,
    });

    if (wines.length !== ids.length) {
      const foundIds = wines.map((w: any) => w.id);
      const missingIds = ids.filter((id: number) => !foundIds.includes(id));
      throw new BadRequestError(`部分酒品不存在: ${missingIds.join(', ')}`);
    }

    await Wine.update(
      { status },
      { where: { id: { [Op.in]: ids } }, transaction }
    );

    await transaction.commit();
    ResponseUtil.success(res, {
      updated: wines.length,
      status,
    }, '批量状态更新成功');
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

export const getWineStatistics = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { startDate, endDate, vintageYear } = req.query;
    const where: any = {};
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate as string);
      if (endDate) where.createdAt[Op.lte] = new Date(endDate as string);
    }
    if (vintageYear) where.vintageYear = Number(vintageYear);

    const statusCounts = await Wine.findAll({
      where,
      attributes: ['status', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['status'],
    });

    const statusMap: any = {};
    statusCounts.forEach((item: any) => {
      statusMap[item.status] = item.dataValues.count;
    });

    const totalCount = await Wine.count({ where });
    const totalQuantity = await Wine.sum('currentQuantity', { where }) || 0;
    const totalBottles = await Wine.sum('bottleCount', { where }) || 0;
    const avgAlcoholContent = await Wine.sum('alcoholContent', { where }) || 0;

    const now = new Date();
    const threeMonthsLater = dayjs().add(3, 'month').toDate();
    const expiringSoonCount = await Wine.count({
      where: {
        ...where,
        bestDrinkEndDate: { [Op.lte]: threeMonthsLater, [Op.gte]: now },
      },
    });
    const expiredCount = await Wine.count({
      where: {
        ...where,
        bestDrinkEndDate: { [Op.lt]: now },
      },
    });

    const vintageStats = await Wine.findAll({
      where,
      attributes: ['vintageYear', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['vintageYear'],
      order: [['vintageYear', 'DESC']],
      limit: 10,
    });

    ResponseUtil.success(res, {
      total: totalCount,
      byStatus: {
        brewing: statusMap.brewing || 0,
        cellaring: statusMap.cellaring || 0,
        finished: statusMap.finished || 0,
        sold: statusMap.sold || 0,
      },
      quantity: {
        total: Number(totalQuantity.toFixed(2)),
        totalBottles: Number(totalBottles),
      },
      drinkStatus: {
        expiringSoon: expiringSoonCount,
        expired: expiredCount,
      },
      avgAlcoholContent: totalCount > 0 ? Number((avgAlcoholContent / totalCount).toFixed(2)) : 0,
      vintageDistribution: vintageStats.map((v: any) => ({
        vintageYear: v.vintageYear,
        count: v.dataValues.count,
      })),
    });
  } catch (error) {
    next(error);
  }
};

export const getWineOrigins = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const origins = await Wine.findAll({
      attributes: ['origin', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['origin'],
      where: {
        origin: {
          [Op.ne]: '',
        },
      },
      order: [['count', 'DESC']],
    });

    ResponseUtil.success(res, origins.map((o: any) => ({
      origin: o.origin,
      count: o.dataValues.count,
    })));
  } catch (error) {
    next(error);
  }
};

export const getWineVintageYears = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const years = await Wine.findAll({
      attributes: ['vintageYear', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['vintageYear'],
      order: [['vintageYear', 'DESC']],
    });

    ResponseUtil.success(res, years.map((y: any) => ({
      vintageYear: y.vintageYear,
      count: y.dataValues.count,
    })));
  } catch (error) {
    next(error);
  }
};
