import { Response } from 'express';
import { ApiResponse } from '../utils/response';
import { Influencer, User, sequelize } from '../models';
import { AuthRequest } from '../middleware/auth';
import { InfluencerStatus, CategoryStatus } from '../utils/constants';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { Op } from 'sequelize';
import Joi from 'joi';
import { Category } from '../models';

export const createInfluencerSchema = Joi.object({
  realName: Joi.string().allow(''),
  idCard: Joi.string().allow(''),
  platformAccounts: Joi.any(),
  followerCount: Joi.number().integer(),
  minPrice: Joi.number(),
  maxPrice: Joi.number(),
  categoryIds: Joi.array().items(Joi.number()),
  tags: Joi.array().items(Joi.string()),
  bio: Joi.string().allow(''),
  portfolio: Joi.any(),
});

export const updateInfluencerSchema = Joi.object({
  realName: Joi.string().allow(''),
  idCard: Joi.string().allow(''),
  platformAccounts: Joi.any(),
  followerCount: Joi.number().integer(),
  minPrice: Joi.number(),
  maxPrice: Joi.number(),
  categoryIds: Joi.array().items(Joi.number()),
  tags: Joi.array().items(Joi.string()),
  bio: Joi.string().allow(''),
  portfolio: Joi.any(),
});

export const reviewSchema = Joi.object({
  status: Joi.string().valid(InfluencerStatus.APPROVED, InfluencerStatus.REJECTED).required(),
  rejectionReason: Joi.string().when('status', {
    is: InfluencerStatus.REJECTED,
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
});

export const getInfluencerList = async (req: AuthRequest, res: Response) => {
  try {
    const { 
      page = 1, 
      pageSize = 10, 
      status, 
      categoryId,
      tags,
      minFollower,
      maxFollower,
      minPrice,
      maxPrice,
      keyword,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;
    
    const where: any = {};
    
    if (status && status !== 'all') {
      where.status = status;
    }

    if (categoryId) {
      const catId = parseInt(categoryId as string);
      if (!isNaN(catId)) {
        where.categoryIds = sequelize.literal(`JSON_CONTAINS(categoryIds, '${catId}')`);
      }
    }

    if (tags && typeof tags === 'string') {
      const tagList = tags.split(',').filter(t => t.trim());
      if (tagList.length > 0) {
        const tagConditions = tagList.map(tag => 
          `JSON_CONTAINS(tags, '"${tag.trim()}"')`
        ).join(' AND ');
        where[Op.and] = sequelize.literal(`(${tagConditions})`);
      }
    }

    if (minFollower) {
      const min = parseInt(minFollower as string);
      if (!isNaN(min)) {
        where.followerCount = { [Op.gte]: min };
      }
    }

    if (maxFollower) {
      const max = parseInt(maxFollower as string);
      if (!isNaN(max)) {
        where.followerCount = where.followerCount || {};
        where.followerCount[Op.lte] = max;
      }
    }

    if (minPrice) {
      const min = parseFloat(minPrice as string);
      if (!isNaN(min)) {
        where.minPrice = { [Op.lte]: min };
      }
    }

    if (maxPrice) {
      const max = parseFloat(maxPrice as string);
      if (!isNaN(max)) {
        where.maxPrice = { [Op.gte]: max };
      }
    }

    let userWhere: any = {};
    if (keyword) {
      userWhere = {
        [Op.or]: [
          { username: { [Op.like]: `%${keyword}%` } },
          { nickname: { [Op.like]: `%${keyword}%` } },
        ],
      };
    }

    const order: any = [];
    if (sortBy === 'followerCount') {
      order.push(['followerCount', sortOrder as string]);
    } else if (sortBy === 'price') {
      order.push(['minPrice', sortOrder as string]);
    } else {
      order.push(['createdAt', sortOrder as string]);
    }

    const { count, rows } = await Influencer.findAndCountAll({
      where,
      offset: (Number(page) - 1) * Number(pageSize),
      limit: Number(pageSize),
      order,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email', 'avatar', 'nickname'],
          where: Object.keys(userWhere).length > 0 ? userWhere : undefined,
        },
      ],
    });

    return ApiResponse.paginated(res, rows, count, Number(page), Number(pageSize));
  } catch (error) {
    return ApiResponse.error(res, '获取达人列表失败');
  }
};

export const getInfluencerById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const influencer = await Influencer.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email', 'avatar', 'nickname'],
        },
      ],
    });

    if (!influencer) {
      throw new NotFoundError('达人不存在');
    }

    return ApiResponse.success(res, influencer);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return ApiResponse.notFound(res, error.message);
    }
    return ApiResponse.error(res, '获取达人信息失败');
  }
};

export const getMyProfile = async (req: AuthRequest, res: Response) => {
  try {
    const influencer = await Influencer.findOne({
      where: { userId: req.user!.id },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'email', 'avatar', 'nickname'],
        },
      ],
    });

    if (!influencer) {
      throw new NotFoundError('达人资料不存在');
    }

    return ApiResponse.success(res, influencer);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return ApiResponse.notFound(res, error.message);
    }
    return ApiResponse.error(res, '获取个人资料失败');
  }
};

export const createInfluencer = async (req: AuthRequest, res: Response) => {
  const t = await sequelize.transaction();
  
  try {
    const existing = await Influencer.findOne({ where: { userId: req.user!.id } });
    if (existing) {
      throw new BadRequestError('达人资料已存在');
    }

    const { categoryIds } = req.body;
    if (categoryIds && Array.isArray(categoryIds)) {
      for (const catId of categoryIds) {
        const category = await Category.findByPk(catId, { transaction: t });
        if (!category) {
          throw new BadRequestError(`分类ID ${catId} 不存在`);
        }
        if (category.status !== CategoryStatus.ACTIVE) {
          throw new BadRequestError(`分类 "${category.name}" 未启用招商，无法绑定`);
        }
      }
    }

    const influencer = await Influencer.create(
      {
        ...req.body,
        userId: req.user!.id,
        status: InfluencerStatus.PENDING,
      },
      { transaction: t }
    );

    await t.commit();

    return ApiResponse.created(res, influencer, '达人资料创建成功');
  } catch (error) {
    await t.rollback();
    if (error instanceof BadRequestError) {
      return ApiResponse.badRequest(res, error.message);
    }
    return ApiResponse.error(res, '创建达人资料失败');
  }
};

export const updateInfluencer = async (req: AuthRequest, res: Response) => {
  const t = await sequelize.transaction();
  
  try {
    const { id } = req.params;

    const influencer = await Influencer.findByPk(id, { transaction: t });
    if (!influencer) {
      throw new NotFoundError('达人不存在');
    }

    if (req.user!.role !== 'admin' && influencer.userId !== req.user!.id) {
      await t.rollback();
      return ApiResponse.forbidden(res, '无权限修改');
    }

    const { categoryIds } = req.body;
    if (categoryIds && Array.isArray(categoryIds)) {
      for (const catId of categoryIds) {
        const category = await Category.findByPk(catId, { transaction: t });
        if (!category) {
          throw new BadRequestError(`分类ID ${catId} 不存在`);
        }
        if (category.status !== CategoryStatus.ACTIVE) {
          throw new BadRequestError(`分类 "${category.name}" 未启用招商，无法绑定`);
        }
      }
    }

    await influencer.update(req.body, { transaction: t });

    await t.commit();

    return ApiResponse.success(res, influencer, '达人资料更新成功');
  } catch (error) {
    await t.rollback();
    if (error instanceof NotFoundError) {
      return ApiResponse.notFound(res, error.message);
    }
    if (error instanceof BadRequestError) {
      return ApiResponse.badRequest(res, error.message);
    }
    return ApiResponse.error(res, '更新达人资料失败');
  }
};

export const reviewInfluencer = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    const influencer = await Influencer.findByPk(id);
    if (!influencer) {
      throw new NotFoundError('达人不存在');
    }

    await influencer.update({
      status,
      rejectionReason: status === InfluencerStatus.REJECTED ? rejectionReason : null,
      verifiedAt: status === InfluencerStatus.APPROVED ? new Date() : null,
    });

    return ApiResponse.success(res, null, `达人已${status === InfluencerStatus.APPROVED ? '通过' : '拒绝'}`);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return ApiResponse.notFound(res, error.message);
    }
    return ApiResponse.error(res, '审核失败');
  }
};

export const updateTags = async (req: AuthRequest, res: Response) => {
  try {
    const { tags } = req.body;

    const influencer = await Influencer.findOne({ where: { userId: req.user!.id } });
    if (!influencer) {
      throw new NotFoundError('达人资料不存在');
    }

    await influencer.update({ tags });

    return ApiResponse.success(res, null, '标签更新成功');
  } catch (error) {
    if (error instanceof NotFoundError) {
      return ApiResponse.notFound(res, error.message);
    }
    return ApiResponse.error(res, '更新标签失败');
  }
};
