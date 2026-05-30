import { Response } from 'express';
import { Op, fn, col, literal } from 'sequelize';
import sequelize from '../config/database';
import BenefitSettlement from '../models/BenefitSettlement';
import BenefitClaim, { ClaimStatus } from '../models/BenefitClaim';
import BenefitBatch from '../models/BenefitBatch';
import Department from '../models/Department';
import User, { UserRole } from '../models/User';
import BenefitProduct from '../models/BenefitProduct';
import { AuthRequest } from '../middleware/auth';
import { ResponseUtil } from '../utils/response';
import { AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';

const generateSettlementNo = () => {
  const date = new Date();
  const timestamp = date.getFullYear().toString() +
    (date.getMonth() + 1).toString().padStart(2, '0') +
    date.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ST${timestamp}${random}`;
};

export const getSettlementList = async (req: AuthRequest, res: Response) => {
  const { batchId, departmentId, status, page = 1, pageSize = 10 } = req.query;
  const user = req.user!;

  const where: any = {};
  if (batchId) {
    where.batchId = batchId;
  }
  const adminRoles = [UserRole.SUPER_ADMIN, UserRole.ADMIN];
  if (departmentId && adminRoles.includes(user.role)) {
    where.departmentId = departmentId;
  }
  if (status !== undefined && status !== '') {
    where.status = status;
  }

  if (user.role === UserRole.MANAGER && user.departmentId) {
    where.departmentId = user.departmentId;
  }

  const { count, rows } = await BenefitSettlement.findAndCountAll({
    where,
    include: [
      { model: Department, as: 'department', attributes: ['id', 'name'] },
      { model: BenefitBatch, as: 'batch', attributes: ['id', 'name', 'festival', 'startDate', 'endDate'] }
    ],
    order: [['id', 'DESC']],
    limit: Number(pageSize),
    offset: (Number(page) - 1) * Number(pageSize)
  });

  res.json(ResponseUtil.success({
    list: rows,
    total: count,
    page: Number(page),
    pageSize: Number(pageSize)
  }));
};

export const getSettlementById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const user = req.user!;

  const settlement = await BenefitSettlement.findByPk(id, {
    include: [
      { model: Department, as: 'department' },
      { model: BenefitBatch, as: 'batch' }
    ]
  });

  if (!settlement) {
    throw new AppError('结算单不存在', 404);
  }

  if (user.role === UserRole.MANAGER && user.departmentId && settlement.departmentId !== user.departmentId) {
    throw new AppError('无权查看此结算单', 403);
  }

  const claims = await BenefitClaim.findAll({
    where: {
      batchId: settlement.batchId,
      departmentId: settlement.departmentId,
      status: { [Op.ne]: ClaimStatus.CANCELLED }
    },
    include: [
      { model: User, as: 'user', attributes: ['id', 'username', 'realName'] },
      { model: BenefitProduct, as: 'product', attributes: ['id', 'name', 'image'] }
    ],
    order: [['id', 'DESC']]
  });

  res.json(ResponseUtil.success({
    settlement,
    claims
  }));
};

export const createSettlement = async (req: AuthRequest, res: Response) => {
  const t = await sequelize.transaction();
  
  try {
    const { departmentId, batchId, remark } = req.body;
    const user = req.user!;

    const existingSettlement = await BenefitSettlement.findOne({
      where: { departmentId, batchId },
      transaction: t
    });
    if (existingSettlement) {
      await t.rollback();
      throw new AppError('该部门此批次已存在结算单', 400);
    }

    const department = await Department.findByPk(departmentId, { transaction: t });
    if (!department) {
      await t.rollback();
      throw new AppError('部门不存在', 400);
    }

    const batch = await BenefitBatch.findByPk(batchId, { transaction: t });
    if (!batch) {
      await t.rollback();
      throw new AppError('批次不存在', 400);
    }

    const claimStats = await BenefitClaim.findAll({
      where: {
        departmentId,
        batchId,
        status: { [Op.ne]: ClaimStatus.CANCELLED }
      },
      attributes: [
        [fn('COUNT', col('id')), 'claimedCount'],
        [fn('SUM', col('totalAmount')), 'actualAmount']
      ],
      raw: true,
      transaction: t
    }) as any[];

    const employeeCount = await User.count({
      where: { departmentId, status: 1 },
      transaction: t
    });

    const settlementNo = generateSettlementNo();

    const settlement = await BenefitSettlement.create({
      settlementNo,
      departmentId,
      batchId,
      totalEmployees: employeeCount,
      claimedCount: Number(claimStats[0]?.claimedCount || 0),
      unclaimedCount: employeeCount - Number(claimStats[0]?.claimedCount || 0),
      totalAmount: Number(batch.budget) * (claimStats[0]?.claimedCount || 0),
      actualAmount: Number(claimStats[0]?.actualAmount || 0),
      status: 0,
      remark,
      createdBy: user.id
    }, { transaction: t });

    await t.commit();

    logger.info(`结算单创建成功: ID=${settlement.id}, 编号=${settlementNo}, 部门=${department.name}, 创建人=${user.username}`);
    res.json(ResponseUtil.success(settlement, '结算单创建成功'));
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

export const confirmSettlement = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const user = req.user!;

  const settlement = await BenefitSettlement.findByPk(id);
  if (!settlement) {
    throw new AppError('结算单不存在', 404);
  }

  if (settlement.status === 1) {
    throw new AppError('结算单已确认', 400);
  }

  await settlement.update({
    status: 1,
    settledBy: user.id,
    settledAt: new Date()
  });

  logger.info(`结算单确认: ID=${id}, 操作人=${user.username}`);
  res.json(ResponseUtil.success(null, '结算已确认'));
};

export const getStatistics = async (req: AuthRequest, res: Response) => {
  const { batchId, departmentId, startDate, endDate } = req.query;
  const user = req.user!;

  const where: any = {};
  if (batchId) {
    where.batchId = batchId;
  }
  if (departmentId && user.role === UserRole.ADMIN) {
    where.departmentId = departmentId;
  }
  if (startDate && endDate) {
    where.createdAt = {
      [Op.between]: [new Date(startDate as string), new Date(endDate as string)]
    };
  }

  if (user.role === UserRole.MANAGER && user.departmentId) {
    where.departmentId = user.departmentId;
  }

  const stats = await BenefitSettlement.findAll({
    where,
    attributes: [
      [fn('COUNT', col('id')), 'totalSettlements'],
      [fn('SUM', col('totalEmployees')), 'totalEmployees'],
      [fn('SUM', col('claimedCount')), 'totalClaimed'],
      [fn('SUM', col('actualAmount')), 'totalAmount'],
      [fn('SUM', col('unclaimedCount')), 'totalUnclaimed']
    ],
    raw: true
  }) as any[];

  const deptStats = await BenefitSettlement.findAll({
    where,
    include: [{ model: Department, as: 'department', attributes: ['name'] }],
    attributes: [
      'departmentId',
      [fn('COUNT', col('id')), 'count'],
      [fn('SUM', col('claimedCount')), 'claimedCount'],
      [fn('SUM', col('actualAmount')), 'amount']
    ],
    group: ['departmentId'],
    raw: true
  });

  const pendingCount = await BenefitSettlement.count({ where: { ...where, status: 0 } });
  const confirmedCount = await BenefitSettlement.count({ where: { ...where, status: 1 } });

  res.json(ResponseUtil.success({
    summary: {
      totalSettlements: Number(stats[0]?.totalSettlements || 0),
      totalEmployees: Number(stats[0]?.totalEmployees || 0),
      totalClaimed: Number(stats[0]?.totalClaimed || 0),
      totalAmount: Number(stats[0]?.totalAmount || 0),
      totalUnclaimed: Number(stats[0]?.totalUnclaimed || 0),
      pendingCount,
      confirmedCount
    },
    byDepartment: deptStats
  }));
};

export const getLedger = async (req: AuthRequest, res: Response) => {
  const { batchId, departmentId, startDate, endDate, status, page = 1, pageSize = 10 } = req.query;
  const user = req.user!;

  const where: any = {
    status: { [Op.ne]: ClaimStatus.CANCELLED }
  };
  if (batchId) {
    where.batchId = batchId;
  }
  if (departmentId && user.role === UserRole.ADMIN) {
    where.departmentId = departmentId;
  }
  if (status) {
    where.status = status;
  }
  if (startDate && endDate) {
    where.createdAt = {
      [Op.between]: [new Date(startDate as string), new Date(endDate as string)]
    };
  }

  if (user.role === UserRole.MANAGER && user.departmentId) {
    where.departmentId = user.departmentId;
  }

  const { count, rows } = await BenefitClaim.findAndCountAll({
    where,
    include: [
      { model: User, as: 'user', attributes: ['id', 'username', 'realName', 'phone'] },
      { model: Department, as: 'department', attributes: ['id', 'name'] },
      { model: BenefitBatch, as: 'batch', attributes: ['id', 'name', 'festival'] },
      { model: BenefitProduct, as: 'product', attributes: ['id', 'name', 'code'] }
    ],
    order: [['id', 'DESC']],
    limit: Number(pageSize),
    offset: (Number(page) - 1) * Number(pageSize)
  });

  const totalAmount = await BenefitClaim.sum('totalAmount', { where });

  const summary = {
    totalCount: count,
    totalAmount: totalAmount || 0,
    pendingCount: await BenefitClaim.count({ where: { ...where, status: ClaimStatus.PENDING } }),
    approvedCount: await BenefitClaim.count({ where: { ...where, status: ClaimStatus.APPROVED } }),
    shippedCount: await BenefitClaim.count({ where: { ...where, status: ClaimStatus.SHIPPED } }),
    receivedCount: await BenefitClaim.count({ where: { ...where, status: ClaimStatus.RECEIVED } })
  };

  res.json(ResponseUtil.success({
    list: rows,
    summary,
    page: Number(page),
    pageSize: Number(pageSize)
  }));
};

export const exportLedger = async (req: AuthRequest, res: Response) => {
  const { batchId, departmentId, startDate, endDate } = req.query;
  const user = req.user!;

  const where: any = {
    status: { [Op.ne]: ClaimStatus.CANCELLED }
  };
  if (batchId) {
    where.batchId = batchId;
  }
  if (departmentId && user.role === UserRole.ADMIN) {
    where.departmentId = departmentId;
  }
  if (startDate && endDate) {
    where.createdAt = {
      [Op.between]: [new Date(startDate as string), new Date(endDate as string)]
    };
  }

  if (user.role === UserRole.MANAGER && user.departmentId) {
    where.departmentId = user.departmentId;
  }

  const claims = await BenefitClaim.findAll({
    where,
    include: [
      { model: User, as: 'user', attributes: ['id', 'username', 'realName', 'phone'] },
      { model: Department, as: 'department', attributes: ['id', 'name'] },
      { model: BenefitBatch, as: 'batch', attributes: ['id', 'name', 'festival'] },
      { model: BenefitProduct, as: 'product', attributes: ['id', 'name', 'code'] }
    ],
    order: [['id', 'DESC']]
  });

  logger.info(`台账导出: 导出${claims.length}条记录, 操作人=${user.username}`);
  res.json(ResponseUtil.success(claims, '导出成功'));
};

export const deleteSettlement = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const settlement = await BenefitSettlement.findByPk(id);
  if (!settlement) {
    throw new AppError('结算单不存在', 404);
  }

  if (settlement.status === 1) {
    throw new AppError('已确认的结算单不能删除', 400);
  }

  await settlement.destroy();

  logger.info(`结算单删除: ID=${id}, 操作人=${req.user?.username}`);
  res.json(ResponseUtil.success(null, '删除成功'));
};
