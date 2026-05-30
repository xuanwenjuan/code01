import Collection, { CollectionAttributes, CollectionStatus, ConditionGrade } from '../models/Collection';
import Category from '../models/Category';
import { NotFoundException, BusinessException } from '../exceptions/BusinessException';
import { Op, fn, col, literal } from 'sequelize';
import sequelize from '../config/database';

class CollectionService {
  generateCollectionNo(): string {
    const date = new Date();
    const prefix = 'CL' + date.getFullYear() + String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return prefix + random;
  }

  async createCollection(data: Omit<CollectionAttributes, 'id' | 'collectionNo'> & { createdBy: number }) {
    const category = await Category.findByPk(data.categoryId);
    if (!category) {
      throw new NotFoundException('类目不存在');
    }

    if (category.status !== 1) {
      throw new BusinessException('不能使用已下线的类目');
    }

    const collectionNo = this.generateCollectionNo();

    return Collection.create({
      ...data,
      collectionNo
    });
  }

  async updateCollection(id: number, data: Partial<CollectionAttributes>) {
    const collection = await Collection.findByPk(id);
    if (!collection) {
      throw new NotFoundException('藏品不存在');
    }

    if (data.categoryId && data.categoryId !== collection.categoryId) {
      const category = await Category.findByPk(data.categoryId);
      if (!category) {
        throw new NotFoundException('类目不存在');
      }
      if (category.status !== 1) {
        throw new BusinessException('不能使用已下线的类目');
      }
    }

    await collection.update(data);
    return collection;
  }

  async deleteCollection(id: number) {
    const collection = await Collection.findByPk(id);
    if (!collection) {
      throw new NotFoundException('藏品不存在');
    }
    await collection.destroy();
  }

  async getCollectionById(id: number) {
    const collection = await Collection.findByPk(id, {
      include: [{ model: Category, as: 'category', attributes: ['id', 'name', 'code'] }]
    });
    if (!collection) {
      throw new NotFoundException('藏品不存在');
    }
    return collection;
  }

  async getCollectionList(params: {
    page?: number;
    pageSize?: number;
    collectionNo?: string;
    name?: string;
    categoryId?: number;
    status?: CollectionStatus;
    conditionGrade?: ConditionGrade;
    brand?: string;
    productionYear?: string;
    sourceChannel?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const { page = 1, pageSize = 10, collectionNo, name, categoryId, status, conditionGrade, brand, productionYear, sourceChannel, startDate, endDate } = params;

    const where: any = {};
    if (collectionNo) where.collectionNo = { [Op.like]: `%${collectionNo}%` };
    if (name) where.name = { [Op.like]: `%${name}%` };
    if (categoryId) where.categoryId = categoryId;
    if (status) where.status = status;
    if (conditionGrade) where.conditionGrade = conditionGrade;
    if (brand) where.brand = { [Op.like]: `%${brand}%` };
    if (productionYear) where.productionYear = { [Op.like]: `%${productionYear}%` };
    if (sourceChannel) where.sourceChannel = sourceChannel;
    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const { count, rows } = await Collection.findAndCountAll({
      where,
      limit: pageSize,
      offset: (page - 1) * pageSize,
      order: [['id', 'DESC']],
      include: [{ model: Category, as: 'category', attributes: ['id', 'name', 'code'] }]
    });

    return {
      list: rows,
      total: count,
      page,
      pageSize
    };
  }

  async updateCollectionStatus(id: number, status: CollectionStatus) {
    const collection = await Collection.findByPk(id);
    if (!collection) {
      throw new NotFoundException('藏品不存在');
    }
    await collection.update({ status });
    return collection;
  }

  async batchUpdateStatus(ids: number[], status: CollectionStatus) {
    const t = await sequelize.transaction();

    try {
      const collections = await Collection.findAll({
        where: { id: { [Op.in]: ids } },
        transaction: t
      });

      if (collections.length !== ids.length) {
        throw new NotFoundException('部分藏品不存在');
      }

      await Collection.update(
        { status },
        { where: { id: { [Op.in]: ids } }, transaction: t }
      );

      await t.commit();
      return { updatedCount: ids.length };
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async batchDelete(ids: number[]) {
    const t = await sequelize.transaction();

    try {
      const collections = await Collection.findAll({
        where: { id: { [Op.in]: ids } },
        transaction: t
      });

      if (collections.length !== ids.length) {
        throw new NotFoundException('部分藏品不存在');
      }

      await Collection.destroy({
        where: { id: { [Op.in]: ids } },
        transaction: t
      });

      await t.commit();
      return { deletedCount: ids.length };
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async getMaintenanceReminders() {
    const today = new Date();
    const thirtyDaysLater = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    return Collection.findAll({
      where: {
        nextMaintenanceDate: {
          [Op.between]: [today, thirtyDaysLater]
        }
      },
      include: [{ model: Category, as: 'category', attributes: ['id', 'name'] }],
      order: [['nextMaintenanceDate', 'ASC']]
    });
  }

  async getStatistics() {
    const results = await Collection.findAll({
      attributes: [
        'status',
        [fn('COUNT', col('id')), 'count']
      ],
      group: ['status']
    });

    const categoryStats = await Collection.findAll({
      attributes: [
        'categoryId',
        [fn('COUNT', col('id')), 'count']
      ],
      include: [{
        model: Category,
        as: 'category',
        attributes: ['name']
      }],
      group: ['categoryId']
    });

    return {
      statusStats: results.map(r => ({
        status: r.status,
        count: parseInt(r.get('count') as string)
      })),
      categoryStats: categoryStats.map(r => ({
        categoryId: r.categoryId,
        categoryName: r.category?.name,
        count: parseInt(r.get('count') as string)
      }))
    };
  }

  async triggerMaintenance(id: number) {
    const collection = await Collection.findByPk(id);
    if (!collection) {
      throw new NotFoundException('藏品不存在');
    }

    const nextDate = new Date();
    nextDate.setMonth(nextDate.getMonth() + (collection.maintenanceCycleMonths || 12));

    await collection.update({
      lastMaintenanceDate: new Date(),
      nextMaintenanceDate: nextDate
    });

    return collection;
  }
}

export default new CollectionService();