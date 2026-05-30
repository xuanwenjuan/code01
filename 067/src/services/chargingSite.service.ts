import { ChargingSite, SiteCategory, FeeTemplate, ChargingPile } from '../models';
import { AppError } from '../middleware/error.middleware';
import { Transaction, Op } from 'sequelize';
import sequelize from '../config/database';

export class ChargingSiteService {
  async create(data: {
    siteCode: string;
    name: string;
    categoryId: number;
    feeTemplateId?: number;
    address: string;
    province?: string;
    city?: string;
    district?: string;
    longitude?: number;
    latitude?: number;
    contactPerson?: string;
    contactPhone?: string;
    sortOrder?: number;
    remark?: string;
  }) {
    const t: Transaction = await sequelize.transaction();

    try {
      const exists = await ChargingSite.findOne({
        where: { siteCode: data.siteCode },
        transaction: t,
      });

      if (exists) {
        throw new AppError('站点编号已存在', 400);
      }

      const category = await SiteCategory.findByPk(data.categoryId, {
        transaction: t,
      });

      if (!category) {
        throw new AppError('站点分类不存在', 404);
      }

      if (data.feeTemplateId) {
        const feeTemplate = await FeeTemplate.findByPk(data.feeTemplateId, {
          transaction: t,
        });

        if (!feeTemplate) {
          throw new AppError('收费模板不存在', 404);
        }
      }

      const site = await ChargingSite.create(
        {
          ...data,
          isOperating: true,
          isLocked: false,
          pileCount: 0,
        },
        { transaction: t }
      );

      await t.commit();

      return site;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async getById(id: number) {
    const site = await ChargingSite.findByPk(id, {
      include: [
        {
          model: SiteCategory,
          as: 'category',
          attributes: ['id', 'name', 'type'],
        },
        {
          model: FeeTemplate,
          as: 'feeTemplate',
          attributes: ['id', 'name', 'electricityPrice', 'serviceFee'],
        },
        {
          model: ChargingPile,
          as: 'piles',
          attributes: ['id', 'pileCode', 'powerType', 'status'],
        },
      ],
    });

    if (!site) {
      throw new AppError('站点不存在', 404);
    }

    return site;
  }

  async getList(params: {
    page?: number;
    pageSize?: number;
    categoryId?: number;
    province?: string;
    city?: string;
    keyword?: string;
    isOperating?: boolean;
  }) {
    const { page = 1, pageSize = 10, categoryId, province, city, keyword, isOperating } = params;
    const offset = (page - 1) * pageSize;

    const where: any = {};

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (province) {
      where.province = province;
    }

    if (city) {
      where.city = city;
    }

    if (keyword) {
      where.$or = [
        { siteCode: { $like: `%${keyword}%` } },
        { name: { $like: `%${keyword}%` } },
        { address: { $like: `%${keyword}%` } },
      ];
    }

    if (isOperating !== undefined) {
      where.isOperating = isOperating;
    }

    const { count, rows } = await ChargingSite.findAndCountAll({
      where,
      offset,
      limit: pageSize,
      include: [
        {
          model: SiteCategory,
          as: 'category',
          attributes: ['id', 'name'],
        },
        {
          model: FeeTemplate,
          as: 'feeTemplate',
          attributes: ['id', 'name'],
        },
      ],
      order: [['sortOrder', 'ASC'], ['createdAt', 'DESC']],
    });

    return {
      list: rows,
      total: count,
      page,
      pageSize,
    };
  }

  async update(
    id: number,
    data: {
      siteCode?: string;
      name?: string;
      categoryId?: number;
      feeTemplateId?: number;
      address?: string;
      province?: string;
      city?: string;
      district?: string;
      longitude?: number;
      latitude?: number;
      contactPerson?: string;
      contactPhone?: string;
      sortOrder?: number;
      isOperating?: boolean;
      isLocked?: boolean;
      remark?: string;
    }
  ) {
    const t: Transaction = await sequelize.transaction();

    try {
      const site = await ChargingSite.findByPk(id, { transaction: t });

      if (!site) {
        throw new AppError('站点不存在', 404);
      }

      if (data.siteCode && data.siteCode !== site.siteCode) {
        const exists = await ChargingSite.findOne({
          where: { siteCode: data.siteCode },
          transaction: t,
        });

        if (exists) {
          throw new AppError('站点编号已存在', 400);
        }
      }

      if (data.categoryId) {
        const category = await SiteCategory.findByPk(data.categoryId, {
          transaction: t,
        });

        if (!category) {
          throw new AppError('站点分类不存在', 404);
        }
      }

      if (data.feeTemplateId) {
        const feeTemplate = await FeeTemplate.findByPk(data.feeTemplateId, {
          transaction: t,
        });

        if (!feeTemplate) {
          throw new AppError('收费模板不存在', 404);
        }
      }

      await site.update(data, { transaction: t });
      await t.commit();

      return site;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async delete(id: number) {
    const t: Transaction = await sequelize.transaction();

    try {
      const site = await ChargingSite.findByPk(id, { transaction: t });

      if (!site) {
        throw new AppError('站点不存在', 404);
      }

      const pileCount = await ChargingPile.count({
        where: { siteId: id },
        transaction: t,
      });

      if (pileCount > 0) {
        throw new AppError('该站点下有充电桩设备，无法删除', 400);
      }

      await site.destroy({ transaction: t });
      await t.commit();

      return null;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }
}

export default new ChargingSiteService();
