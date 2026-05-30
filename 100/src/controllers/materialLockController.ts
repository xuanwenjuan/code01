import { Request, Response } from 'express';
import { MaterialLock, MaterialStock, WorkOrder, sequelize } from '../models';
import { success, badRequest, notFound, forbidden } from '../utils/response';
import { generateLockNo } from '../utils/batchNo';
import { MaterialLockStatus, MaterialStatus, UserRole, WorkOrderStatus } from '../types';
import { Op } from 'sequelize';

export async function lockMaterialForOrder(req: Request, res: Response) {
  const { workOrderId, materialStockId, quantity, remark } = req.body;

  const order = await WorkOrder.findByPk(workOrderId);
  if (!order) {
    return res.status(404).json(notFound('工单不存在'));
  }

  if (order.status === WorkOrderStatus.COMPLETED || order.status === WorkOrderStatus.CANCELLED) {
    return res.status(400).json(badRequest('该工单已完成或已取消，无法锁定原料'));
  }

  const stock = await MaterialStock.findByPk(materialStockId);
  if (!stock) {
    return res.status(404).json(notFound('原料库存不存在'));
  }

  if (stock.status === MaterialStatus.EXPIRED || stock.status === MaterialStatus.DAMAGED) {
    return res.status(400).json(badRequest('该原料已过期或损坏，无法锁定'));
  }

  const lockedQuantity = await MaterialLock.sum('quantity', {
    where: {
      materialStockId,
      status: MaterialLockStatus.LOCKED
    }
  }) || 0;

  const availableQuantity = Number(stock.quantity) - Number(lockedQuantity);

  if (availableQuantity < Number(quantity)) {
    return res.status(400).json(badRequest(`库存不足，可用数量: ${availableQuantity}，需要: ${quantity}`));
  }

  const t = await sequelize.transaction();

  try {
    const lockNo = generateLockNo();

    const lock = await MaterialLock.create({
      lockNo,
      workOrderId,
      materialStockId,
      quantity,
      unit: stock.unit,
      status: MaterialLockStatus.LOCKED,
      lockedById: req.user!.userId,
      lockedAt: new Date(),
      remark
    }, { transaction: t });

    const newLockedQuantity = Number(lockedQuantity) + Number(quantity);
    if (Number(stock.quantity) - newLockedQuantity <= 0) {
      await stock.update({ status: MaterialStatus.LOCKED }, { transaction: t });
    }

    await t.commit();
    res.json(success(lock, '原料锁定成功'));
  } catch (error) {
    await t.rollback();
    throw error;
  }
}

export async function releaseMaterialLock(req: Request, res: Response) {
  const { id } = req.params;
  const { remark } = req.body;

  const lock = await MaterialLock.findByPk(id);
  if (!lock) {
    return res.status(404).json(notFound('锁定记录不存在'));
  }

  if (lock.status === MaterialLockStatus.RELEASED || lock.status === MaterialLockStatus.CONSUMED) {
    return res.status(400).json(badRequest('该锁定已释放或已消耗'));
  }

  const t = await sequelize.transaction();

  try {
    await lock.update({
      status: MaterialLockStatus.RELEASED,
      releasedAt: new Date(),
      remark: remark ? `${lock.remark || ''}; ${remark}` : lock.remark
    }, { transaction: t });

    const stock = await MaterialLock.findByPk(lock.materialStockId, { transaction: t });
    if (stock) {
      const lockedQuantity = await MaterialLock.sum('quantity', {
        where: {
          materialStockId: lock.materialStockId,
          status: MaterialLockStatus.LOCKED
        },
        transaction: t
      }) || 0;

      if (lockedQuantity <= 0) {
        await MaterialStock.update(
          { status: MaterialStatus.SUFFICIENT },
          { where: { id: lock.materialStockId }, transaction: t }
        );
      }
    }

    await t.commit();
    res.json(success(null, '原料锁定已释放'));
  } catch (error) {
    await t.rollback();
    throw error;
  }
}

export async function getMaterialLocks(req: Request, res: Response) {
  const { workOrderId, materialStockId, status, page = 1, pageSize = 10 } = req.query;

  const where: any = {};
  if (workOrderId) where.workOrderId = workOrderId;
  if (materialStockId) where.materialStockId = materialStockId;
  if (status) where.status = status;

  const { count, rows } = await MaterialLock.findAndCountAll({
    where,
    include: [
      { model: MaterialStock, attributes: ['name', 'batchNo', 'origin'] },
      { model: WorkOrder, attributes: ['orderNo', 'bookName'] }
    ],
    order: [['createdAt', 'DESC']],
    limit: Number(pageSize),
    offset: (Number(page) - 1) * Number(pageSize)
  });

  res.json(success({
    list: rows,
    total: count,
    page: Number(page),
    pageSize: Number(pageSize)
  }));
}

export async function getLockDetail(req: Request, res: Response) {
  const { id } = req.params;

  const lock = await MaterialLock.findByPk(id, {
    include: [
      { model: MaterialStock },
      { model: WorkOrder }
    ]
  });

  if (!lock) {
    return res.status(404).json(notFound('锁定记录不存在'));
  }

  res.json(success(lock));
}
