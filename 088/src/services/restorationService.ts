import { Restoration, Collection, sequelize } from '../models';
import { AppError } from '../middleware/errorHandler';
import { RestorationStatus, CollectionStatus } from '../types';
import { Op } from 'sequelize';

const validateStatusTransition = (currentStatus: RestorationStatus, targetStatus: RestorationStatus): boolean => {
  const validTransitions: Record<RestorationStatus, RestorationStatus[]> = {
    [RestorationStatus.SUBMITTED]: [RestorationStatus.PLAN_APPROVED],
    [RestorationStatus.PLAN_APPROVED]: [RestorationStatus.IN_PROGRESS],
    [RestorationStatus.IN_PROGRESS]: [RestorationStatus.COMPLETED],
    [RestorationStatus.COMPLETED]: [RestorationStatus.RETURNED],
    [RestorationStatus.RETURNED]: []
  };

  return validTransitions[currentStatus]?.includes(targetStatus) ?? false;
};

const getCollectionStatusForRestoration = (restorationStatus: RestorationStatus): CollectionStatus | null => {
  const statusMap: Record<RestorationStatus, CollectionStatus | null> = {
    [RestorationStatus.SUBMITTED]: CollectionStatus.NEEDS_RESTORATION,
    [RestorationStatus.PLAN_APPROVED]: CollectionStatus.NEEDS_RESTORATION,
    [RestorationStatus.IN_PROGRESS]: CollectionStatus.UNDER_RESTORATION,
    [RestorationStatus.COMPLETED]: CollectionStatus.UNDER_RESTORATION,
    [RestorationStatus.RETURNED]: CollectionStatus.INTACT
  };

  return statusMap[restorationStatus] ?? null;
};

export const createRestoration = async (
  collectionId: number,
  submittedBy: number,
  damageDescription?: string
): Promise<Restoration> => {
  const collection = await Collection.findByPk(collectionId);

  if (!collection) {
    throw new AppError('藏品不存在', 404);
  }

  if (collection.isLocked) {
    throw new AppError('该藏品已被锁定，无法创建修复记录', 400);
  }

  const activeRestoration = await Restoration.findOne({
    where: {
      collectionId,
      status: {
        [Op.notIn]: [RestorationStatus.RETURNED, RestorationStatus.CANCELLED]
      }
    }
  });

  if (activeRestoration) {
    throw new AppError('该藏品已有进行中的修复记录', 400);
  }

  if (collection.status === CollectionStatus.ARCHIVED) {
    throw new AppError('该藏品已封存，无法创建修复记录', 400);
  }

  const transaction = await sequelize.transaction();

  try {
    const restoration = await Restoration.create(
      {
        collectionId,
        submittedBy,
        submissionDate: new Date(),
        damageDescription,
        status: RestorationStatus.SUBMITTED
      },
      { transaction }
    );

    const targetCollectionStatus = getCollectionStatusForRestoration(RestorationStatus.SUBMITTED);
    if (targetCollectionStatus) {
      await collection.update(
        {
          status: targetCollectionStatus,
          isLocked: true,
          lockReason: '送修中',
          lockedBy: submittedBy,
          lockedAt: new Date()
        },
        { transaction }
      );
    }

    await transaction.commit();
    return restoration;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const getAllRestorations = async (
  page: number = 1,
  pageSize: number = 10,
  status?: RestorationStatus
): Promise<{ data: Restoration[]; total: number; page: number; pageSize: number }> => {
  const where: any = {};
  if (status) {
    where.status = status;
  }

  const { count, rows } = await Restoration.findAndCountAll({
    where,
    offset: (page - 1) * pageSize,
    limit: pageSize,
    include: [
      { association: 'collection', attributes: ['id', 'collectionNo', 'name', 'status'] },
      { association: 'submitter', attributes: ['id', 'realName', 'username'] },
      { association: 'technician', attributes: ['id', 'realName', 'username'] }
    ],
    order: [['createdAt', 'DESC']]
  });

  return {
    data: rows,
    total: count,
    page,
    pageSize
  };
};

export const getRestorationById = async (id: number): Promise<Restoration> => {
  const restoration = await Restoration.findByPk(id, {
    include: [
      { association: 'collection' },
      { association: 'submitter', attributes: ['id', 'realName', 'username'] },
      { association: 'technician', attributes: ['id', 'realName', 'username'] }
    ]
  });

  if (!restoration) {
    throw new AppError('修复记录不存在', 404);
  }

  return restoration;
};

export const approvePlan = async (
  id: number,
  approvedBy: number,
  restorationPlan: string
): Promise<Restoration> => {
  const restoration = await getRestorationById(id);

  if (!validateStatusTransition(restoration.status, RestorationStatus.PLAN_APPROVED)) {
    throw new AppError(`无法从当前状态 ${restoration.status} 变更为方案已审批`, 400);
  }

  await restoration.update({
    restorationPlan,
    planApprovedBy: approvedBy,
    planApprovedDate: new Date(),
    status: RestorationStatus.PLAN_APPROVED
  });

  return restoration;
};

export const startRestoration = async (id: number, technicianId: number): Promise<Restoration> => {
  const restoration = await getRestorationById(id);
  const collection = await Collection.findByPk(restoration.collectionId);

  if (!collection) {
    throw new AppError('藏品不存在', 404);
  }

  if (!validateStatusTransition(restoration.status, RestorationStatus.IN_PROGRESS)) {
    throw new AppError(`无法从当前状态 ${restoration.status} 变更为修复中`, 400);
  }

  const transaction = await sequelize.transaction();

  try {
    await restoration.update(
      {
        technicianId,
        startDate: new Date(),
        status: RestorationStatus.IN_PROGRESS
      },
      { transaction }
    );

    const targetCollectionStatus = getCollectionStatusForRestoration(RestorationStatus.IN_PROGRESS);
    if (targetCollectionStatus) {
      await collection.update({ status: targetCollectionStatus }, { transaction });
    }

    await transaction.commit();
    return restoration;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const completeRestoration = async (
  id: number,
  restorationNotes: string,
  cost?: number
): Promise<Restoration> => {
  const restoration = await getRestorationById(id);

  if (!validateStatusTransition(restoration.status, RestorationStatus.COMPLETED)) {
    throw new AppError(`无法从当前状态 ${restoration.status} 变更为修复完成`, 400);
  }

  await restoration.update({
    restorationNotes,
    cost,
    endDate: new Date(),
    status: RestorationStatus.COMPLETED
  });

  return restoration;
};

export const acceptRestoration = async (
  id: number,
  acceptedBy: number,
  acceptanceNotes?: string
): Promise<Restoration> => {
  const restoration = await getRestorationById(id);
  const collection = await Collection.findByPk(restoration.collectionId);

  if (!collection) {
    throw new AppError('藏品不存在', 404);
  }

  if (!validateStatusTransition(restoration.status, RestorationStatus.RETURNED)) {
    throw new AppError(`无法从当前状态 ${restoration.status} 变更为已验收`, 400);
  }

  const transaction = await sequelize.transaction();

  try {
    await restoration.update(
      {
        inspectorId: acceptedBy,
        inspectionNotes: acceptanceNotes,
        inspectionDate: new Date(),
        status: RestorationStatus.RETURNED
      },
      { transaction }
    );

    const targetCollectionStatus = getCollectionStatusForRestoration(RestorationStatus.RETURNED);
    if (targetCollectionStatus) {
      await collection.update(
        {
          status: targetCollectionStatus,
          isLocked: false,
          lockReason: null,
          lockedBy: null,
          lockedAt: null
        },
        { transaction }
      );
    }

    await transaction.commit();
    return restoration;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const cancelRestoration = async (
  id: number,
  cancelledBy: number,
  cancelReason?: string
): Promise<Restoration> => {
  const restoration = await getRestorationById(id);
  const collection = await Collection.findByPk(restoration.collectionId);

  if (!collection) {
    throw new AppError('藏品不存在', 404);
  }

  if (restoration.status === RestorationStatus.RETURNED) {
    throw new AppError('该修复记录已完成，无法取消', 400);
  }

  const transaction = await sequelize.transaction();

  try {
    await restoration.update(
      {
        inspectorId: cancelledBy,
        inspectionNotes: cancelReason,
        inspectionDate: new Date(),
        status: RestorationStatus.CANCELLED
      },
      { transaction }
    );

    await collection.update(
      {
        status: CollectionStatus.INTACT,
        isLocked: false,
        lockReason: null,
        lockedBy: null,
        lockedAt: null
      },
      { transaction }
    );

    await transaction.commit();
    return restoration;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const getRestorationStatusFlow = (): Record<string, string[]> => {
  return {
    [RestorationStatus.SUBMITTED]: ['审批方案'],
    [RestorationStatus.PLAN_APPROVED]: ['开始修复'],
    [RestorationStatus.IN_PROGRESS]: ['完成修复'],
    [RestorationStatus.COMPLETED]: ['验收归库'],
    [RestorationStatus.RETURNED]: []
  };
};
