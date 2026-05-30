import { FeeTemplate, ChargingSite } from '../models';
import { AppError } from '../middleware/error.middleware';
import { Transaction, Op } from 'sequelize';
import sequelize from '../config/database';

export class FeeTemplateService {
  async create(data: {
    name: string;
    electricityPrice: number;
    serviceFee: number;
    platformShare?: number;
    maintenanceShare?: number;
    peakMultiplier?: number;
    normalMultiplier?: number;
    valleyMultiplier?: number;
    description?: string;
  }) {
    const t: Transaction = await sequelize.transaction();

    try {
      const exists = await FeeTemplate.findOne({
        where: { name: data.name },
        transaction: t,
      });

      if (exists) {
        throw new AppError('模板名称已存在', 400);
      }

      const template = await FeeTemplate.create(data, { transaction: t });
      await t.commit();

      return template;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async getById(id: number) {
    const template = await FeeTemplate.findByPk(id, {
      include: [
        {
          model: ChargingSite,
          as: 'sites',
          attributes: ['id', 'siteCode', 'name'],
        },
      ],
    });

    if (!template) {
      throw new AppError('收费模板不存在', 404);
    }

    return template;
  }

  async getList(params: {
    page?: number;
    pageSize?: number;
    keyword?: string;
    isActive?: boolean;
  }) {
    const { page = 1, pageSize = 10, keyword, isActive } = params;
    const offset = (page - 1) * pageSize;

    const where: any = {};

    if (keyword) {
      where.name = { [Op.like]: `%${keyword}%` };
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const { count, rows } = await FeeTemplate.findAndCountAll({
      where,
      offset,
      limit: pageSize,
      order: [['createdAt', 'DESC']],
    });

    return {
      list: rows,
      total: count,
      page,
      pageSize,
    };
  }

  async getAllActive() {
    return FeeTemplate.findAll({
      where: { isActive: true },
      order: [['name', 'ASC']],
    });
  }

  async update(
    id: number,
    data: {
      name?: string;
      electricityPrice?: number;
      serviceFee?: number;
      platformShare?: number;
      maintenanceShare?: number;
      peakMultiplier?: number;
      normalMultiplier?: number;
      valleyMultiplier?: number;
      description?: string;
      isActive?: boolean;
    }
  ) {
    const t: Transaction = await sequelize.transaction();

    try {
      const template = await FeeTemplate.findByPk(id, { transaction: t });

      if (!template) {
        throw new AppError('收费模板不存在', 404);
      }

      if (data.name && data.name !== template.name) {
        const exists = await FeeTemplate.findOne({
          where: { name: data.name },
          transaction: t,
        });

        if (exists) {
          throw new AppError('模板名称已存在', 400);
        }
      }

      await template.update(data, { transaction: t });
      await t.commit();

      return template;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async delete(id: number) {
    const t: Transaction = await sequelize.transaction();

    try {
      const template = await FeeTemplate.findByPk(id, { transaction: t });

      if (!template) {
        throw new AppError('收费模板不存在', 404);
      }

      const hasSites = await ChargingSite.count({
        where: { feeTemplateId: id },
        transaction: t,
      });

      if (hasSites > 0) {
        throw new AppError('该模板已被站点使用，无法删除', 400);
      }

      await template.destroy({ transaction: t });
      await t.commit();

      return null;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }
}

export default new FeeTemplateService();
