import { Collection, MaintenanceRecord, sequelize, Category, Restoration } from '../models';
import { AppError } from '../middleware/errorHandler';
import { CollectionStatus, RestorationStatus } from '../types';
import { Op } from 'sequelize';

export const generateCollectionNo = async (categoryId: number): Promise<string> => {
  const count = await Collection.count({ where: { categoryId } });
  return `COL-${categoryId}-${String(count + 1).padStart(6, '0')}`;
};

const checkCategoryArchived = async (categoryId: number): Promise<void> => {
  const category = await Category.findByPk(categoryId);
  if (!category) {
    throw new AppError('类目不存在', 404);
  }
  if (category.isArchived) {
    throw new AppError('该类目已封存，无法挂靠藏品', 400);
  }
};

export const createCollection = async (collectionData: {
  name: string;
  categoryId: number;
  era?: string;
  material?: string;
  origin?: string;
  preservationLevel?: number;
  description?: string;
  location?: string;
  maintenanceCycleDays?: number;
}): Promise<Collection> => {
  await checkCategoryArchived(collectionData.categoryId);

  const collectionNo = await generateCollectionNo(collectionData.categoryId);

  const nextMaintenanceDate = new Date();
  nextMaintenanceDate.setDate(nextMaintenanceDate.getDate() + (collectionData.maintenanceCycleDays || 180));

  return Collection.create({
    ...collectionData,
    collectionNo,
    nextMaintenanceDate,
    status: CollectionStatus.INTACT
  });
};

export const getAllCollections = async (
  page: number = 1,
  pageSize: number = 10,
  filters?: {
    categoryId?: number;
    status?: CollectionStatus;
    era?: string;
    material?: string;
    origin?: string;
    preservationLevel?: number;
    keyword?: string;
    startDate?: Date;
    endDate?: Date;
  }
): Promise<{ data: Collection[]; total: number; page: number; pageSize: number }> => {
  const where: any = {};

  if (filters?.categoryId) {
    where.categoryId = filters.categoryId;
  }

  if (filters?.status) {
    where.status = filters.status;
  }

  if (filters?.era) {
    where.era = { [Op.like]: `%${filters.era}%` };
  }

  if (filters?.material) {
    where.material = { [Op.like]: `%${filters.material}%` };
  }

  if (filters?.origin) {
    where.origin = { [Op.like]: `%${filters.origin}%` };
  }

  if (filters?.preservationLevel) {
    where.preservationLevel = filters.preservationLevel;
  }

  if (filters?.startDate && filters?.endDate) {
    where.createdAt = { [Op.between]: [filters.startDate, filters.endDate] };
  } else if (filters?.startDate) {
    where.createdAt = { [Op.gte]: filters.startDate };
  } else if (filters?.endDate) {
    where.createdAt = { [Op.lte]: filters.endDate };
  }

  if (filters?.keyword) {
    where[Op.or] = [
      { name: { [Op.like]: `%${filters.keyword}%` } },
      { collectionNo: { [Op.like]: `%${filters.keyword}%` } },
      { description: { [Op.like]: `%${filters.keyword}%` } },
      { era: { [Op.like]: `%${filters.keyword}%` } },
      { material: { [Op.like]: `%${filters.keyword}%` } },
      { origin: { [Op.like]: `%${filters.keyword}%` } }
    ];
  }

  const { count, rows } = await Collection.findAndCountAll({
    where,
    offset: (page - 1) * pageSize,
    limit: pageSize,
    include: [{ association: 'category', attributes: ['id', 'name', 'type'] }],
    order: [['createdAt', 'DESC']]
  });

  return {
    data: rows,
    total: count,
    page,
    pageSize
  };
};

export const lockCollection = async (
  id: number,
  reason: string,
  lockedBy: number
): Promise<Collection> => {
  const collection = await getCollectionById(id);

  if (collection.isLocked) {
    throw new AppError('该藏品已被锁定', 400);
  }

  await collection.update({
    isLocked: true,
    lockReason: reason,
    lockedBy,
    lockedAt: new Date()
  });

  return collection;
};

export const unlockCollection = async (id: number): Promise<Collection> => {
  const collection = await getCollectionById(id);

  if (!collection.isLocked) {
    throw new AppError('该藏品未被锁定', 400);
  }

  await collection.update({
    isLocked: false,
    lockReason: null,
    lockedBy: null,
    lockedAt: null
  });

  return collection;
};

export const getCollectionById = async (id: number): Promise<Collection> => {
  const collection = await Collection.findByPk(id, {
    include: [
      { association: 'category', attributes: ['id', 'name'] },
      { association: 'restorations' },
      { association: 'maintenanceRecords', include: [{ association: 'performer', attributes: ['id', 'realName'] } }
    ]
  });

  if (!collection) {
    throw new AppError('藏品不存在', 404);
  }

  return collection;
};

export const updateCollection = async (id: number, collectionData: Partial<Collection>): Promise<Collection> => {
  const collection = await getCollectionById(id);

  if (collectionData.categoryId && collectionData.categoryId !== collection.categoryId) {
    await checkCategoryArchived(collectionData.categoryId);
  }

  await collection.update(collectionData);
  return collection;
};

export const updateCollectionStatus = async (id: number, status: CollectionStatus): Promise<Collection> => {
  const collection = await getCollectionById(id);
  await collection.update({ status });
  return collection;
};

export const recordMaintenance = async (
  collectionId: number, maintenanceData: {
    performedBy: number;
    maintenanceType: string;
    description?: string;
    cost?: number;
  }
): Promise<MaintenanceRecord> => {
  const collection = await getCollectionById(collectionId);

  const maintenanceDate = new Date();
  const nextMaintenanceDate = new Date(maintenanceDate);
  nextMaintenanceDate.setDate(nextMaintenanceDate.getDate() + collection.maintenanceCycleDays);

  const transaction = await sequelize.transaction();

  try {
    const record = await MaintenanceRecord.create(
      {
        collectionId,
        ...maintenanceData,
        maintenanceDate,
        nextMaintenanceDate
      },
      { transaction }
    );

    await collection.update(
      {
        lastMaintenanceDate: maintenanceDate,
        nextMaintenanceDate
      },
      { transaction }
    );

    await transaction.commit();
    return record;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const getMaintenanceDueSoon = async (days: number = 7): Promise<Collection[]> => {
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + days);

  return Collection.findAll({
    where: {
      nextMaintenanceDate: {
        [Op.lte]: targetDate
      },
      status: { [Op.ne]: CollectionStatus.ARCHIVED }
    },
    include: [{ association: 'category', attributes: ['id', 'name'] }],
    order: [['nextMaintenanceDate', 'ASC']]
  });
};

export const batchImportCollections = async (
  collectionsData: any[],
  operatorId: number
): Promise<{ success: Collection[]; failed: any[]; total: number }> => {
  const transaction = await sequelize.transaction();
  const success: Collection[] = [];
  const failed: any[] = [];

  try {
    for (const data of collectionsData) {
      try {
        if (!data.name || !data.categoryId) {
          failed.push({ data, reason: '缺少必填字段' });
          continue;
        }

        const category = await Category.findByPk(data.categoryId);
        if (!category) {
          failed.push({ data, reason: '类目不存在' });
          continue;
        }
        if (category.isArchived) {
          failed.push({ data, reason: '类目已封存' });
          continue;
        }

        const collectionNo = await generateCollectionNo(data.categoryId);
        const nextMaintenanceDate = new Date();
        nextMaintenanceDate.setDate(nextMaintenanceDate.getDate() + (data.maintenanceCycleDays || 180));

        const collection = await Collection.create(
          {
            ...data,
            collectionNo,
            nextMaintenanceDate,
            status: CollectionStatus.INTACT
          },
          { transaction }
        );

        success.push(collection);
      } catch (error: any) {
        failed.push({ data, reason: error.message });
      }
    }

    await transaction.commit();
    return { success, failed, total: collectionsData.length };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const getCollectionsForExport = async (filters?: {
  categoryId?: number;
  status?: CollectionStatus;
}): Promise<Collection[]> => {
  const where: any = {};

  if (filters?.categoryId) {
    where.categoryId = filters.categoryId;
  }

  if (filters?.status) {
    where.status = filters.status;
  }

  return Collection.findAll({
    where,
    include: [{ association: 'category', attributes: ['id', 'name', 'type'] }],
    order: [['collectionNo', 'ASC']]
  });
};

export const getCollectionStatistics = async (): Promise<any> => {
  const totalCount = await Collection.count();
  const intactCount = await Collection.count({ where: { status: CollectionStatus.INTACT } });
  const needsRestorationCount = await Collection.count({ where: { status: CollectionStatus.NEEDS_RESTORATION } });
  const underRestorationCount = await Collection.count({ where: { status: CollectionStatus.UNDER_RESTORATION } });
  const archivedCount = await Collection.count({ where: { status: CollectionStatus.ARCHIVED } });

  const maintenanceDueCount = await Collection.count({
    where: {
      nextMaintenanceDate: {
        [Op.lte]: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      },
      status: { [Op.ne]: CollectionStatus.ARCHIVED }
    }
  });

  const overdueMaintenanceCount = await Collection.count({
    where: {
      nextMaintenanceDate: { [Op.lt]: new Date() },
      status: { [Op.ne]: CollectionStatus.ARCHIVED }
    }
  });

  return {
    total: totalCount,
    byStatus: {
      intact: intactCount,
      needsRestoration: needsRestorationCount,
      underRestoration: underRestorationCount,
      archived: archivedCount
    },
    maintenance: {
      dueIn7Days: maintenanceDueCount,
      overdue: overdueMaintenanceCount
    }
  };
};

export const archiveCollection = async (id: number): Promise<Collection> => {
  const collection = await getCollectionById(id);

  const activeRestoration = await Restoration.findOne({
    where: {
      collectionId: id,
      status: { [Op.notIn]: [RestorationStatus.RETURNED] }
    }
  });

  if (activeRestoration) {
    throw new AppError('该藏品有正在进行的修复任务，无法封存', 400);
  }

  await collection.update({ status: CollectionStatus.ARCHIVED });
  return collection;
};

export const unarchiveCollection = async (id: number): Promise<Collection> => {
  const collection = await getCollectionById(id);
  await collection.update({ status: CollectionStatus.INTACT });
  return collection;
};
