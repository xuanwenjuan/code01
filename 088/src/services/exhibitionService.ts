import { Exhibition, ExhibitionCollection, Collection, sequelize } from '../models';
import { AppError } from '../middleware/errorHandler';
import { CollectionStatus } from '../types';
import { Op } from 'sequelize';

export const createExhibition = async (exhibitionData: {
  name: string;
  location: string;
  startDate: Date;
  endDate: Date;
  description?: string;
}): Promise<Exhibition> => {
  return Exhibition.create(exhibitionData);
};

export const getAllExhibitions = async (
  page: number = 1,
  pageSize: number = 10
): Promise<{ data: Exhibition[]; total: number; page: number; pageSize: number }> => {
  const { count, rows } = await Exhibition.findAndCountAll({
    offset: (page - 1) * pageSize,
    limit: pageSize,
    order: [['startDate', 'DESC']]
  });

  return {
    data: rows,
    total: count,
    page,
    pageSize
  };
};

export const getExhibitionById = async (id: number): Promise<Exhibition> => {
  const exhibition = await Exhibition.findByPk(id, {
    include: [
      {
        association: 'collections',
        through: { attributes: ['position', 'displayOrder', 'inDate', 'outDate', 'maintenanceCost', 'rotationCount'] }
      }
    ]
  });

  if (!exhibition) {
    throw new AppError('展览不存在', 404);
  }

  return exhibition;
};

export const updateExhibition = async (id: number, exhibitionData: Partial<Exhibition>): Promise<Exhibition> => {
  const exhibition = await Exhibition.findByPk(id);

  if (!exhibition) {
    throw new AppError('展览不存在', 404);
  }

  await exhibition.update(exhibitionData);
  return exhibition;
};

export const addCollectionToExhibition = async (
  exhibitionId: number,
  collectionId: number,
  position?: string,
  displayOrder?: number
): Promise<ExhibitionCollection> => {
  const exhibition = await Exhibition.findByPk(exhibitionId);
  const collection = await Collection.findByPk(collectionId);

  if (!exhibition) {
    throw new AppError('展览不存在', 404);
  }

  if (!collection) {
    throw new AppError('藏品不存在', 404);
  }

  if (collection.isLocked) {
    throw new AppError('该藏品已被锁定，无法添加到展览', 400);
  }

  if (collection.status === CollectionStatus.ARCHIVED) {
    throw new AppError('该藏品已封存，无法添加到展览', 400);
  }

  const existing = await ExhibitionCollection.findOne({
    where: { exhibitionId, collectionId, outDate: null }
  });

  if (existing) {
    throw new AppError('该藏品已在展览中', 400);
  }

  const transaction = await sequelize.transaction();

  try {
    const record = await ExhibitionCollection.create(
      {
        exhibitionId,
        collectionId,
        position,
        displayOrder: displayOrder || 0,
        inDate: new Date()
      },
      { transaction }
    );

    await collection.update(
      {
        status: CollectionStatus.IN_EXHIBITION,
        exhibitionCount: (collection.exhibitionCount || 0) + 1
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

export const removeCollectionFromExhibition = async (exhibitionId: number, collectionId: number): Promise<void> => {
  const record = await ExhibitionCollection.findOne({
    where: { exhibitionId, collectionId, outDate: null }
  });

  if (!record) {
    throw new AppError('该藏品不在此展览中', 404);
  }

  const collection = await Collection.findByPk(collectionId);
  if (!collection) {
    throw new AppError('藏品不存在', 404);
  }

  const transaction = await sequelize.transaction();

  try {
    const outDate = new Date();
    const inDate = record.inDate || new Date();
    const exhibitionDays = Math.max(1, Math.ceil((outDate.getTime() - inDate.getTime()) / (1000 * 60 * 60 * 24)));

    await record.update(
      { outDate, totalExhibitionDays: exhibitionDays },
      { transaction }
    );

    await collection.update(
      {
        status: CollectionStatus.INTACT,
        totalExhibitionDays: (collection.totalExhibitionDays || 0) + exhibitionDays
      },
      { transaction }
    );

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const getExhibitionStats = async (exhibitionId: number): Promise<any> => {
  const exhibition = await getExhibitionById(exhibitionId);

  const collections = await ExhibitionCollection.findAll({
    where: { exhibitionId },
    include: [{ association: 'collection', attributes: ['id', 'collectionNo', 'name'] }]
  });

  const totalMaintenanceCost = collections.reduce((sum, item) => {
    return sum + (item.maintenanceCost || 0);
  }, 0);

  const totalRotationCount = collections.reduce((sum, item) => {
    return sum + (item.rotationCount || 0);
  }, 0);

  return {
    exhibitionName: exhibition.name,
    totalCollections: collections.length,
    totalMaintenanceCost,
    totalRotationCount,
    collections
  };
};

export const getExhibitionLedger = async (
  startDate?: Date,
  endDate?: Date
): Promise<any[]> => {
  const where: any = {};

  if (startDate && endDate) {
    where.startDate = { [Op.gte]: startDate };
    where.endDate = { [Op.lte]: endDate };
  }

  const exhibitions = await Exhibition.findAll({
    where,
    include: [
      {
        association: 'collections',
        through: { attributes: ['maintenanceCost', 'rotationCount', 'inDate', 'outDate', 'position'] }
      }
    ],
    order: [['startDate', 'DESC']]
  });

  return exhibitions.map((exhibition) => {
    const collections = (exhibition as any).collections || [];
    const totalCost = collections.reduce((sum: number, collection: any) => {
      return sum + (collection.ExhibitionCollection?.maintenanceCost || 0);
    }, 0);
    const totalRotationCount = collections.reduce((sum: number, collection: any) => {
      return sum + (collection.ExhibitionCollection?.rotationCount || 0);
    }, 0);

    return {
      id: exhibition.id,
      name: exhibition.name,
      location: exhibition.location,
      startDate: exhibition.startDate,
      endDate: exhibition.endDate,
      description: exhibition.description,
      collectionCount: collections.length,
      totalCost,
      totalRotationCount
    };
  });
};

export const getExhibitionStatistics = async (exhibitionId: number): Promise<any> => {
  const exhibition = await getExhibitionById(exhibitionId);
  const exhibitionCollections = await ExhibitionCollection.findAll({
    where: { exhibitionId },
    include: [{ association: 'collection', attributes: ['id', 'collectionNo', 'name', 'status'] }]
  });

  const totalMaintenanceCost = exhibitionCollections.reduce((sum, item) => sum + (item.maintenanceCost || 0), 0);
  const totalRotationCount = exhibitionCollections.reduce((sum, item) => sum + (item.rotationCount || 0), 0);

  const statusBreakdown: Record<string, number> = {};
  exhibitionCollections.forEach((ec: any) => {
    const status = ec.collection?.status || 'unknown';
    statusBreakdown[status] = (statusBreakdown[status] || 0) + 1;
  });

  return {
    exhibition: {
      id: exhibition.id,
      name: exhibition.name,
      location: exhibition.location,
      startDate: exhibition.startDate,
      endDate: exhibition.endDate
    },
    collections: {
      total: exhibitionCollections.length,
      statusBreakdown
    },
    maintenance: {
      totalCost: totalMaintenanceCost,
      averageCost: exhibitionCollections.length > 0 ? totalMaintenanceCost / exhibitionCollections.length : 0
    },
    rotations: {
      total: totalRotationCount,
      average: exhibitionCollections.length > 0 ? totalRotationCount / exhibitionCollections.length : 0
    }
  };
};

export const rotateCollectionInExhibition = async (
  exhibitionId: number,
  oldCollectionId: number,
  newCollectionId: number,
  position?: string
): Promise<any> => {
  const transaction = await sequelize.transaction();

  try {
    const oldRecord = await ExhibitionCollection.findOne({
      where: { exhibitionId, collectionId: oldCollectionId, outDate: null },
      transaction
    });

    if (!oldRecord) {
      throw new AppError('原藏品不在该展览中', 404);
    }

    const oldCollection = await Collection.findByPk(oldCollectionId, { transaction });
    const newCollection = await Collection.findByPk(newCollectionId, { transaction });

    if (!oldCollection || !newCollection) {
      throw new AppError('藏品不存在', 404);
    }

    if (newCollection.isLocked) {
      throw new AppError('新藏品已被锁定，无法轮换', 400);
    }

    if (newCollection.status === CollectionStatus.ARCHIVED) {
      throw new AppError('新藏品已封存，无法轮换', 400);
    }

    const outDate = new Date();
    const inDate = oldRecord.inDate || new Date();
    const exhibitionDays = Math.max(1, Math.ceil((outDate.getTime() - inDate.getTime()) / (1000 * 60 * 60 * 24)));

    await oldRecord.update(
      {
        outDate,
        rotationCount: (oldRecord.rotationCount || 0) + 1,
        totalExhibitionDays: exhibitionDays
      },
      { transaction }
    );

    await oldCollection.update(
      {
        status: CollectionStatus.INTACT,
        totalExhibitionDays: (oldCollection.totalExhibitionDays || 0) + exhibitionDays
      },
      { transaction }
    );

    const newRecord = await ExhibitionCollection.create(
      {
        exhibitionId,
        collectionId: newCollectionId,
        position: position || oldRecord.position,
        displayOrder: oldRecord.displayOrder,
        inDate: new Date(),
        rotationCount: 0
      },
      { transaction }
    );

    await newCollection.update(
      {
        status: CollectionStatus.IN_EXHIBITION,
        exhibitionCount: (newCollection.exhibitionCount || 0) + 1
      },
      { transaction }
    );

    await transaction.commit();
    return {
      oldRecord: {
        collectionId: oldCollectionId,
        outDate,
        rotationCount: oldRecord.rotationCount,
        exhibitionDays
      },
      newRecord
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const updateExhibitionCollectionCost = async (
  exhibitionId: number,
  collectionId: number,
  maintenanceCost: number
): Promise<ExhibitionCollection> => {
  const record = await ExhibitionCollection.findOne({
    where: { exhibitionId, collectionId }
  });

  if (!record) {
    throw new AppError('该藏品不在该展览中', 404);
  }

  await record.update({ maintenanceCost });
  return record;
};

export const getAllExhibitionStatistics = async (startDate?: Date, endDate?: Date): Promise<any> => {
  const where: any = {};
  if (startDate && endDate) {
    where.startDate = { [Op.gte]: startDate };
    where.endDate = { [Op.lte]: endDate };
  }

  const exhibitions = await Exhibition.findAll({
    where,
    include: [
      {
        association: 'collections',
        through: { attributes: ['maintenanceCost', 'rotationCount'] }
      }
    ]
  });

  let totalCollections = 0;
  let totalMaintenanceCost = 0;
  let totalRotationCount = 0;
  const locationStats: Record<string, number> = {};

  exhibitions.forEach((exhibition: any) => {
    const collections = exhibition.collections || [];
    totalCollections += collections.length;

    locationStats[exhibition.location] = (locationStats[exhibition.location] || 0) + 1;

    collections.forEach((collection: any) => {
      totalMaintenanceCost += collection.ExhibitionCollection?.maintenanceCost || 0;
      totalRotationCount += collection.ExhibitionCollection?.rotationCount || 0;
    });
  });

  return {
    period: { startDate, endDate },
    totalExhibitions: exhibitions.length,
    totalCollections,
    totalMaintenanceCost,
    averageCostPerExhibition: exhibitions.length > 0 ? totalMaintenanceCost / exhibitions.length : 0,
    averageRotationsPerCollection: totalCollections > 0 ? totalRotationCount / totalCollections : 0,
    exhibitionsByLocation: locationStats
  };
};

export const getCollectionExhibitionHistory = async (collectionId: number): Promise<any[]> => {
  const records = await ExhibitionCollection.findAll({
    where: { collectionId },
    include: [{ association: 'exhibition', attributes: ['id', 'name', 'location', 'startDate', 'endDate'] }],
    order: [['inDate', 'DESC']]
  });

  return records.map((record: any) => ({
    exhibition: record.exhibition,
    position: record.position,
    inDate: record.inDate,
    outDate: record.outDate,
    maintenanceCost: record.maintenanceCost,
    rotationCount: record.rotationCount
  }));
};
