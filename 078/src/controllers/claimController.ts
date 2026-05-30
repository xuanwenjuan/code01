import { Response } from 'express';
import { Op, Transaction, fn, col } from 'sequelize';
import sequelize from '../config/database';
import BenefitClaim, { ClaimStatus } from '../models/BenefitClaim';
import BenefitBatch from '../models/BenefitBatch';
import BenefitProduct from '../models/BenefitProduct';
import BenefitCategory from '../models/BenefitCategory';
import User, { UserRole } from '../models/User';
import Department from '../models/Department';
import { AuthRequest } from '../middleware/auth';
import { ResponseUtil } from '../utils/response';
import { AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';

const generateClaimNo = () => {
  const date = new Date();
  const timestamp = date.getFullYear().toString() +
    (date.getMonth() + 1).toString().padStart(2, '0') +
    date.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `CL${timestamp}${random}`;
};

const validateStatusTransition = (currentStatus: ClaimStatus, targetStatus: ClaimStatus, userRole: string): boolean => {
  const validTransitions: Record<ClaimStatus, ClaimStatus[]> = {
    [ClaimStatus.PENDING]: [ClaimStatus.APPROVED, ClaimStatus.REJECTED, ClaimStatus.CANCELLED],
    [ClaimStatus.APPROVED]: [ClaimStatus.SHIPPED, ClaimStatus.CANCELLED],
    [ClaimStatus.REJECTED]: [],
    [ClaimStatus.SHIPPED]: [ClaimStatus.RECEIVED],
    [ClaimStatus.RECEIVED]: [],
    [ClaimStatus.CANCELLED]: []
  };

  const canTransition = validTransitions[currentStatus]?.includes(targetStatus);
  if (!canTransition) return false;

  const adminRoles = [UserRole.SUPER_ADMIN, UserRole.ADMIN];
  if ((targetStatus === ClaimStatus.APPROVED || targetStatus === ClaimStatus.REJECTED) && 
      ![...adminRoles, UserRole.MANAGER].includes(userRole as UserRole)) {
    return false;
  }

  if (targetStatus === ClaimStatus.SHIPPED && !adminRoles.includes(userRole as UserRole)) {
    return false;
  }

  return true;
};

export const getClaimList = async (req: AuthRequest, res: Response) => {
  const { 
    batchId, 
    productId, 
    status, 
    userId,
    departmentId,
    startDate,
    endDate,
    claimNo,
    page = 1, 
    pageSize = 10 
  } = req.query;
  const user = req.user!;

  const where: any = {};
  if (batchId) {
    where.batchId = batchId;
  }
  if (productId) {
    where.productId = productId;
  }
  if (status) {
    where.status = status;
  }
  if (userId && [UserRole.ADMIN, UserRole.MANAGER].includes(user.role)) {
    where.userId = userId;
  }
  if (departmentId && user.role === UserRole.ADMIN) {
    where.departmentId = departmentId;
  }
  if (claimNo) {
    where.claimNo = { [Op.like]: `%${claimNo}%` };
  }
  if (startDate && endDate) {
    where.createdAt = {
      [Op.between]: [new Date(startDate as string), new Date(endDate as string)]
    };
  }

  const adminRoles = [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FINANCE];
  if (user.role === UserRole.EMPLOYEE) {
    where.userId = user.id;
  } else if (user.role === UserRole.MANAGER && user.departmentId) {
    where.departmentId = user.departmentId;
  }

  const { count, rows } = await BenefitClaim.findAndCountAll({
    where,
    include: [
      { model: User, as: 'user', attributes: ['id', 'username', 'realName', 'phone'] },
      { model: Department, as: 'department', attributes: ['id', 'name'] },
      { model: BenefitBatch, as: 'batch', attributes: ['id', 'name', 'festival'] },
      { model: BenefitProduct, as: 'product', attributes: ['id', 'name', 'image', 'price'] },
      { model: User, as: 'approver', attributes: ['id', 'realName'] }
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

export const getClaimById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const user = req.user!;

  const claim = await BenefitClaim.findByPk(id, {
    include: [
      { model: User, as: 'user', attributes: ['id', 'username', 'realName', 'phone'] },
      { model: Department, as: 'department', attributes: ['id', 'name'] },
      { model: BenefitBatch, as: 'batch' },
      { model: BenefitProduct, as: 'product', include: [{ model: BenefitCategory, as: 'category' }] },
      { model: User, as: 'approver', attributes: ['id', 'realName'] },
      { model: BenefitClaim, as: 'originalClaim' }
    ]
  });

  if (!claim) {
    throw new AppError('申领单不存在', 404);
  }

  const adminRoles = [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FINANCE];
  if (user.role === UserRole.EMPLOYEE && claim.userId !== user.id) {
    throw new AppError('无权查看此申领单', 403);
  }

  if (user.role === UserRole.MANAGER && user.departmentId && claim.departmentId !== user.departmentId) {
    throw new AppError('无权查看此申领单', 403);
  }

  res.json(ResponseUtil.success(claim));
};

export const createClaim = async (req: AuthRequest, res: Response) => {
  const t: Transaction = await sequelize.transaction();
  
  try {
    const { batchId, productId, quantity = 1, receiverName, receiverPhone, receiverAddress, remark } = req.body;
    const user = req.user!;

    const batch = await BenefitBatch.findByPk(batchId, { transaction: t });
    if (!batch) {
      await t.rollback();
      throw new AppError('发放批次不存在', 400);
    }

    if (batch.isArchived === 1) {
      await t.rollback();
      throw new AppError('该批次已归档，不能再申领', 400);
    }

    const today = new Date();
    if (today < batch.startDate || today > batch.endDate) {
      await t.rollback();
      throw new AppError('不在当前批次申领时间范围内', 400);
    }

    const product = await BenefitProduct.findByPk(productId, { transaction: t });
    if (!product) {
      await t.rollback();
      throw new AppError('商品不存在', 400);
    }

    if (product.status !== 1) {
      await t.rollback();
      throw new AppError('该商品已下架', 400);
    }

    if (product.stock < quantity) {
      await t.rollback();
      throw new AppError('库存不足', 400);
    }

    const existingClaims = await BenefitClaim.findAll({
      where: {
        userId: user.id,
        batchId,
        status: { [Op.ne]: ClaimStatus.CANCELLED }
      },
      transaction: t
    });

    const usedQuota = existingClaims.reduce((sum, claim) => sum + claim.quantity, 0);
    if (usedQuota + quantity > batch.quotaPerPerson) {
      await t.rollback();
      throw new AppError(`该批次每人限领${batch.quotaPerPerson}份，您已申领${usedQuota}份，超额${usedQuota + quantity - batch.quotaPerPerson}份`, 400);
    }

    const claimNo = generateClaimNo();
    const totalAmount = Number(product.price) * Number(quantity);

    const claim = await BenefitClaim.create({
      claimNo,
      userId: user.id,
      departmentId: user.departmentId,
      batchId,
      productId,
      quantity,
      unitPrice: product.price,
      totalAmount,
      status: ClaimStatus.PENDING,
      receiverName,
      receiverPhone,
      receiverAddress,
      remark,
      createdBy: user.id
    }, { transaction: t });

    await product.decrement('stock', { by: quantity, transaction: t });

    await t.commit();

    logger.info(`申领单创建成功: ID=${claim.id}, 编号=${claimNo}, 商品=${product.name}, 数量=${quantity}, 申领人=${user.username}`);
    res.json(ResponseUtil.success(claim, '申领成功'));
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

export const approveClaim = async (req: AuthRequest, res: Response) => {
  const t: Transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { status, remark } = req.body;
    const user = req.user!;

    const claim = await BenefitClaim.findByPk(id, { transaction: t });
    if (!claim) {
      await t.rollback();
      throw new AppError('申领单不存在', 404);
    }

    const targetStatus = status === 'approved' ? ClaimStatus.APPROVED : ClaimStatus.REJECTED;
    if (!validateStatusTransition(claim.status, targetStatus, user.role)) {
      await t.rollback();
      throw new AppError(`无法从${claim.status}状态变更为${targetStatus}状态`, 400);
    }

    if (user.role === UserRole.MANAGER && user.departmentId && claim.departmentId !== user.departmentId) {
      await t.rollback();
      throw new AppError('只能审批本部门的申领单', 403);
    }

    if (targetStatus === ClaimStatus.REJECTED) {
      const product = await BenefitProduct.findByPk(claim.productId, { transaction: t });
      if (product) {
        await product.increment('stock', { by: claim.quantity, transaction: t });
      }
    }

    await claim.update({
      status: targetStatus,
      approvedBy: user.id,
      approvedAt: new Date()
    }, { transaction: t });

    await t.commit();

    logger.info(`申领单审批: ID=${id}, 状态=${targetStatus}, 审批人=${user.username}, 备注=${remark}`);
    res.json(ResponseUtil.success(null, status === 'approved' ? '审批通过' : '已拒绝'));
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

export const shipClaim = async (req: AuthRequest, res: Response) => {
  const t: Transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { logisticsNo, logisticsCompany } = req.body;
    const user = req.user!;

    const claim = await BenefitClaim.findByPk(id, { transaction: t });
    if (!claim) {
      await t.rollback();
      throw new AppError('申领单不存在', 404);
    }

    if (!validateStatusTransition(claim.status, ClaimStatus.SHIPPED, user.role)) {
      await t.rollback();
      throw new AppError(`无法从${claim.status}状态变更为已发货状态`, 400);
    }

    await claim.update({
      status: ClaimStatus.SHIPPED,
      logisticsNo,
      logisticsCompany,
      shippedBy: user.id,
      shippedAt: new Date()
    }, { transaction: t });

    await t.commit();

    logger.info(`申领单发货: ID=${id}, 物流单号=${logisticsNo}, 操作人=${user.username}`);
    res.json(ResponseUtil.success(null, '已发货'));
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

export const receiveClaim = async (req: AuthRequest, res: Response) => {
  const t: Transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const user = req.user!;

    const claim = await BenefitClaim.findByPk(id, { transaction: t });
    if (!claim) {
      await t.rollback();
      throw new AppError('申领单不存在', 404);
    }

    if (!validateStatusTransition(claim.status, ClaimStatus.RECEIVED, user.role)) {
      await t.rollback();
      throw new AppError(`无法从${claim.status}状态变更为已签收状态`, 400);
    }

    const adminRoles = [UserRole.SUPER_ADMIN, UserRole.ADMIN];
    if (claim.userId !== user.id && !adminRoles.includes(user.role)) {
      await t.rollback();
      throw new AppError('无权签收此申领单', 403);
    }

    await claim.update({
      status: ClaimStatus.RECEIVED,
      receivedAt: new Date()
    }, { transaction: t });

    await t.commit();

    logger.info(`申领单签收: ID=${id}, 签收人=${user.username}`);
    res.json(ResponseUtil.success(null, '已签收'));
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

export const cancelClaim = async (req: AuthRequest, res: Response) => {
  const t: Transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const user = req.user!;

    const claim = await BenefitClaim.findByPk(id, { transaction: t });
    if (!claim) {
      await t.rollback();
      throw new AppError('申领单不存在', 404);
    }

    if (!validateStatusTransition(claim.status, ClaimStatus.CANCELLED, user.role)) {
      await t.rollback();
      throw new AppError(`无法从${claim.status}状态变更为已取消状态`, 400);
    }

    const adminRoles = [UserRole.SUPER_ADMIN, UserRole.ADMIN];
    if (claim.userId !== user.id && !adminRoles.includes(user.role)) {
      await t.rollback();
      throw new AppError('无权取消此申领单', 403);
    }

    if (user.role === UserRole.MANAGER && user.departmentId && claim.departmentId !== user.departmentId) {
      await t.rollback();
      throw new AppError('只能取消本部门的申领单', 403);
    }

    await claim.update({ status: ClaimStatus.CANCELLED }, { transaction: t });

    const product = await BenefitProduct.findByPk(claim.productId, { transaction: t });
    if (product) {
      await product.increment('stock', { by: claim.quantity, transaction: t });
    }

    await t.commit();

    logger.info(`申领单取消: ID=${id}, 操作人=${user.username}`);
    res.json(ResponseUtil.success(null, '已取消'));
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

export const reissueClaim = async (req: AuthRequest, res: Response) => {
  const t: Transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { remark, receiverName, receiverPhone, receiverAddress } = req.body;
    const user = req.user!;

    const originalClaim = await BenefitClaim.findByPk(id, { transaction: t });
    if (!originalClaim) {
      await t.rollback();
      throw new AppError('原申领单不存在', 404);
    }

    if (originalClaim.status !== ClaimStatus.RECEIVED) {
      await t.rollback();
      throw new AppError('只有已签收的申领单才能补发', 400);
    }

    const product = await BenefitProduct.findByPk(originalClaim.productId, { transaction: t });
    if (!product) {
      await t.rollback();
      throw new AppError('商品不存在', 400);
    }

    if (product.stock < originalClaim.quantity) {
      await t.rollback();
      throw new AppError('库存不足', 400);
    }

    const claimNo = generateClaimNo();

    const claim = await BenefitClaim.create({
      claimNo,
      userId: originalClaim.userId,
      departmentId: originalClaim.departmentId,
      batchId: originalClaim.batchId,
      productId: originalClaim.productId,
      quantity: originalClaim.quantity,
      unitPrice: originalClaim.unitPrice,
      totalAmount: originalClaim.totalAmount,
      status: ClaimStatus.PENDING,
      receiverName: receiverName || originalClaim.receiverName,
      receiverPhone: receiverPhone || originalClaim.receiverPhone,
      receiverAddress: receiverAddress || originalClaim.receiverAddress,
      remark,
      isReissue: 1,
      originalClaimId: originalClaim.id,
      createdBy: user.id
    }, { transaction: t });

    await product.decrement('stock', { by: originalClaim.quantity, transaction: t });

    await t.commit();

    logger.info(`补发申请创建: 原申领单ID=${id}, 新申领单ID=${claim.id}, 操作人=${user.username}`);
    res.json(ResponseUtil.success(claim, '补发申请已提交'));
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

export const getClaimStatistics = async (req: AuthRequest, res: Response) => {
  const { batchId, departmentId } = req.query;
  const user = req.user!;

  const where: any = {};
  if (batchId) {
    where.batchId = batchId;
  }
  const adminRoles = [UserRole.SUPER_ADMIN, UserRole.ADMIN];
  if (user.role === UserRole.MANAGER && user.departmentId) {
    where.departmentId = user.departmentId;
  } else if (departmentId && adminRoles.includes(user.role)) {
    where.departmentId = departmentId;
  }

  const stats = await BenefitClaim.findAll({
    where,
    attributes: [
      'status',
      [fn('COUNT', col('id')), 'count'],
      [fn('SUM', col('totalAmount')), 'amount']
    ],
    group: ['status'],
    raw: true
  });

  const totalStats = await BenefitClaim.findAll({
    where,
    attributes: [
      [fn('COUNT', col('id')), 'totalCount'],
      [fn('SUM', col('totalAmount')), 'totalAmount']
    ],
    raw: true
  }) as any[];

  res.json(ResponseUtil.success({
    byStatus: stats,
    total: {
      count: Number(totalStats[0]?.totalCount || 0),
      amount: Number(totalStats[0]?.totalAmount || 0)
    }
  }));
};

export const batchApprove = async (req: AuthRequest, res: Response) => {
  const t: Transaction = await sequelize.transaction();
  
  try {
    const { ids, status, remark } = req.body;
    const user = req.user!;

    if (!Array.isArray(ids) || ids.length === 0) {
      await t.rollback();
      throw new AppError('请选择要审批的申领单', 400);
    }

    const claims = await BenefitClaim.findAll({
      where: { id: { [Op.in]: ids } },
      transaction: t
    });

    const targetStatus = status === 'approved' ? ClaimStatus.APPROVED : ClaimStatus.REJECTED;
    const adminRoles = [UserRole.SUPER_ADMIN, UserRole.ADMIN];
    let successCount = 0;

    for (const claim of claims) {
      if (validateStatusTransition(claim.status, targetStatus, user.role)) {
        if (adminRoles.includes(user.role) || (user.role === UserRole.MANAGER && user.departmentId && claim.departmentId === user.departmentId)) {
          await claim.update({
            status: targetStatus,
            approvedBy: user.id,
            approvedAt: new Date()
          }, { transaction: t });

          if (targetStatus === ClaimStatus.REJECTED) {
            const product = await BenefitProduct.findByPk(claim.productId, { transaction: t });
            if (product) {
              await product.increment('stock', { by: claim.quantity, transaction: t });
            }
          }
          successCount++;
        }
      }
    }

    await t.commit();

    logger.info(`批量审批完成: 成功${successCount}/${claims.length}条, 操作人=${user.username}`);
    res.json(ResponseUtil.success({ successCount, totalCount: claims.length }, '批量审批完成'));
  } catch (error) {
    await t.rollback();
    throw error;
  }
};
