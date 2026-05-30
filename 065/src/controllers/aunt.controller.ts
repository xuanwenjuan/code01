import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { AuntProfile, User } from '../models';
import { AuntStatus, UserRole, AuntFilterParams, PaginatedResult } from '../types';
import { ResponseUtil } from '../utils/response';
import { OperationLogger } from '../utils/operationLogger';
import { NotFoundException, BadRequestException, ForbiddenException } from '../exceptions/HttpException';
import { Op, fn, col } from 'sequelize';

export const createAuntProfileSchema = Joi.object({
  body: Joi.object({
    userId: Joi.number().integer().required().messages({
      'any.required': '用户ID不能为空',
    }),
    realName: Joi.string().min(2).max(50).required().messages({
      'string.min': '真实姓名长度不能少于2个字符',
      'string.max': '真实姓名长度不能超过50个字符',
      'any.required': '真实姓名不能为空',
    }),
    idCard: Joi.string().pattern(/^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/).required().messages({
      'string.pattern.base': '身份证号格式不正确',
      'any.required': '身份证号不能为空',
    }),
    idCardFront: Joi.string().max(500).optional(),
    idCardBack: Joi.string().max(500).optional(),
    avatar: Joi.string().max(500).optional(),
    phone: Joi.string().pattern(/^1[3-9]\d{9}$/).required().messages({
      'string.pattern.base': '手机号格式不正确',
      'any.required': '手机号不能为空',
    }),
    age: Joi.number().integer().min(18).max(70).optional().messages({
      'number.min': '年龄不能小于18岁',
      'number.max': '年龄不能超过70岁',
    }),
    gender: Joi.string().valid('male', 'female').optional(),
    serviceYears: Joi.number().integer().min(0).required().messages({
      'number.min': '服务年限不能小于0',
      'any.required': '服务年限不能为空',
    }),
    skills: Joi.array().items(Joi.string()).min(1).required().messages({
      'array.min': '至少选择一项技能',
      'any.required': '技能不能为空',
    }),
    serviceScope: Joi.string().min(2).max(500).required().messages({
      'string.min': '服务范围长度不能少于2个字符',
      'string.max': '服务范围长度不能超过500个字符',
      'any.required': '服务范围不能为空',
    }),
    description: Joi.string().max(2000).optional(),
  }),
});

export const updateAuntProfileSchema = Joi.object({
  params: Joi.object({
    id: Joi.number().integer().required().messages({
      'any.required': '阿姨档案ID不能为空',
    }),
  }),
  body: Joi.object({
    realName: Joi.string().min(2).max(50).optional(),
    idCard: Joi.string().pattern(/^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/).optional(),
    idCardFront: Joi.string().max(500).optional(),
    idCardBack: Joi.string().max(500).optional(),
    avatar: Joi.string().max(500).optional(),
    phone: Joi.string().pattern(/^1[3-9]\d{9}$/).optional(),
    age: Joi.number().integer().min(18).max(70).optional(),
    gender: Joi.string().valid('male', 'female').optional(),
    serviceYears: Joi.number().integer().min(0).optional(),
    skills: Joi.array().items(Joi.string()).min(1).optional(),
    serviceScope: Joi.string().min(2).max(500).optional(),
    description: Joi.string().max(2000).optional(),
    status: Joi.string().valid(...Object.values(AuntStatus)).optional(),
  }),
});

export const reviewAuntProfileSchema = Joi.object({
  params: Joi.object({
    id: Joi.number().integer().required().messages({
      'any.required': '阿姨档案ID不能为空',
    }),
  }),
  body: Joi.object({
    status: Joi.string().valid(AuntStatus.ACTIVE, AuntStatus.REJECTED).required().messages({
      'any.required': '审核状态不能为空',
      'any.only': '审核状态只能是 active 或 rejected',
    }),
    rejectReason: Joi.string().max(500).optional(),
  }),
});

export const getAuntProfileByIdSchema = Joi.object({
  params: Joi.object({
    id: Joi.number().integer().required().messages({
      'any.required': '阿姨档案ID不能为空',
    }),
  }),
});

export const getAuntListSchema = Joi.object({
  query: Joi.object({
    page: Joi.number().integer().min(1).optional().default(1),
    pageSize: Joi.number().integer().min(1).max(100).optional().default(10),
    skills: Joi.alternatives().try(
      Joi.array().items(Joi.string()),
      Joi.string()
    ).optional(),
    serviceScope: Joi.string().optional(),
    status: Joi.string().valid(...Object.values(AuntStatus)).optional(),
    keyword: Joi.string().optional(),
    minRating: Joi.number().min(0).max(5).optional(),
    maxRating: Joi.number().min(0).max(5).optional(),
  }),
});

export const createAuntProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, realName, idCard, idCardFront, idCardBack, avatar, phone, age, gender, serviceYears, skills, serviceScope, description } = req.body;

    if (req.user!.role !== UserRole.ADMIN && req.user!.userId !== userId) {
      throw new ForbiddenException('无权创建他人的阿姨档案');
    }

    const user = await User.findByPk(userId);
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    const existingProfile = await AuntProfile.findOne({
      where: { userId },
    });
    if (existingProfile) {
      throw new BadRequestException('该用户已创建阿姨档案');
    }

    const existingIdCard = await AuntProfile.findOne({
      where: { idCard },
    });
    if (existingIdCard) {
      throw new BadRequestException('该身份证号已被使用');
    }

    const profile = await AuntProfile.create({
      userId,
      realName,
      idCard,
      idCardFront,
      idCardBack,
      avatar,
      phone,
      age,
      gender,
      serviceYears,
      skills: JSON.stringify(skills),
      serviceScope,
      description,
      avgRating: 0,
      orderCount: 0,
      status: AuntStatus.PENDING_REVIEW,
    });

    await OperationLogger.logAunt('create', req, profile.id, `创建阿姨档案: ${realName}`);

    res.json(ResponseUtil.created(profile, '阿姨档案创建成功'));
  } catch (error) {
    next(error);
  }
};

export const updateAuntProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const profile = await AuntProfile.findByPk(id);
    if (!profile) {
      throw new NotFoundException('阿姨档案不存在');
    }

    if (req.user!.role !== UserRole.ADMIN && req.user!.userId !== profile.userId) {
      throw new ForbiddenException('无权修改他人的阿姨档案');
    }

    if (updateData.skills) {
      updateData.skills = JSON.stringify(updateData.skills);
    }

    await profile.update(updateData);

    res.json(ResponseUtil.success(profile, '阿姨档案更新成功'));
  } catch (error) {
    next(error);
  }
};

export const reviewAuntProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status, rejectReason } = req.body;

    const profile = await AuntProfile.findByPk(id);
    if (!profile) {
      throw new NotFoundException('阿姨档案不存在');
    }

    await profile.update({
      status,
      rejectReason: status === AuntStatus.REJECTED ? rejectReason : null,
    });

    res.json(ResponseUtil.success(profile, '审核完成'));
  } catch (error) {
    next(error);
  }
};

export const getAuntProfileById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const profile = await AuntProfile.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: { exclude: ['password'] },
        },
      ],
    });

    if (!profile) {
      throw new NotFoundException('阿姨档案不存在');
    }

    res.json(ResponseUtil.success(profile, '获取阿姨档案成功'));
  } catch (error) {
    next(error);
  }
};

export const getAuntProfileList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, pageSize = 10, status, keyword, skills, serviceScope, minRating, maxRating } = req.query;

    const filterParams: AuntFilterParams = {
      status: status as AuntStatus,
      keyword: keyword as string,
      skills: typeof skills === 'string' ? skills.split(',') : skills as string[],
      serviceScope: serviceScope as string,
      minRating: minRating ? Number(minRating) : undefined,
      maxRating: maxRating ? Number(maxRating) : undefined,
    };

    const whereCondition: any = {};

    if (filterParams.status) {
      whereCondition.status = filterParams.status;
    }

    if (filterParams.keyword) {
      whereCondition.realName = { [Op.like]: `%${filterParams.keyword}%` };
    }

    if (filterParams.serviceScope) {
      whereCondition.serviceScope = { [Op.like]: `%${filterParams.serviceScope}%` };
    }

    if (filterParams.minRating !== undefined) {
      whereCondition.avgRating = { [Op.gte]: filterParams.minRating };
    }

    if (filterParams.maxRating !== undefined) {
      if (whereCondition.avgRating) {
        whereCondition.avgRating[Op.lte] = filterParams.maxRating;
      } else {
        whereCondition.avgRating = { [Op.lte]: filterParams.maxRating };
      }
    }

    const { count, rows } = await AuntProfile.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: User,
          as: 'user',
          attributes: { exclude: ['password'] },
        },
      ],
      offset: (Number(page) - 1) * Number(pageSize),
      limit: Number(pageSize),
      order: [['createdAt', 'DESC']],
    });

    let filteredRows = rows;
    if (filterParams.skills && filterParams.skills.length > 0) {
      filteredRows = rows.filter(aunt => {
        const auntSkills = typeof aunt.skills === 'string' ? JSON.parse(aunt.skills) : aunt.skills;
        return filterParams.skills!.some(skill => auntSkills.includes(skill));
      });
    }

    const result: PaginatedResult<AuntProfile> = {
      list: filteredRows,
      total: filterParams.skills ? filteredRows.length : count,
      page: Number(page),
      pageSize: Number(pageSize),
    };

    res.json(ResponseUtil.success(result, '获取阿姨列表成功'));
  } catch (error) {
    next(error);
  }
};

export const getMyAuntProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const profile = await AuntProfile.findOne({
      where: { userId: req.user!.userId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: { exclude: ['password'] },
        },
      ],
    });

    res.json(ResponseUtil.success(profile, '获取我的阿姨档案成功'));
  } catch (error) {
    next(error);
  }
};
