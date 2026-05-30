import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { Op, Transaction } from 'sequelize';
import dayjs from 'dayjs';
import Pigeon from '../models/Pigeon.model';
import Category from '../models/Category.model';
import { 
  PigeonType, 
  PigeonStatus, 
  CategoryStatus, 
  HealthStatus,
  OperationType,
  PIGEON_TYPE_LABELS,
  PIGEON_STATUS_LABELS,
  HEALTH_STATUS_LABELS
} from '../constants/enum';
import { ResponseUtil } from '../utils/response';
import { NotFoundException, BadRequestException } from '../exceptions/base.exception';
import sequelize from '../config/database';
import logger from '../utils/logger';
import operationLogService from '../services/operationLog.service';

export const createPigeonSchema = Joi.object({
  ringNumber: Joi.string().required().max(50).pattern(/^[A-Za-z0-9-]+$/).messages({
    'string.empty': '足环编号不能为空',
    'string.max': '足环编号不能超过50个字符',
    'string.pattern.base': '足环编号只能包含字母、数字和横杠',
    'any.required': '足环编号是必填项'
  }),
  name: Joi.string().max(100).optional(),
  categoryId: Joi.number().integer().positive().required().messages({
    'number.integer': '品类ID必须是整数',
    'number.positive': '品类ID必须为正数',
    'any.required': '品类ID是必填项'
  }),
  type: Joi.string().valid(...Object.values(PigeonType)).required().messages({
    'any.only': '赛鸽类型不合法',
    'any.required': '赛鸽类型是必填项'
  }),
  gender: Joi.string().valid('MALE', 'FEMALE').required().messages({
    'any.only': '性别只能是MALE或FEMALE',
    'any.required': '性别是必填项'
  }),
  birthDate: Joi.date().optional().max('now').messages({
    'date.max': '出生日期不能晚于当前时间'
  }),
  generation: Joi.string().max(50).optional(),
  fatherId: Joi.number().integer().positive().optional(),
  motherId: Joi.number().integer().positive().optional(),
  bloodline: Joi.string().max(200).optional(),
  featherColor: Joi.string().max(50).optional(),
  eyeColor: Joi.string().max(50).optional(),
  healthStatus: Joi.string().valid(...Object.values(HealthStatus)).optional(),
  lastDewormingDate: Joi.date().optional().max('now'),
  nextDewormingDate: Joi.date().optional().min('now'),
  lastVaccinationDate: Joi.date().optional().max('now'),
  nextVaccinationDate: Joi.date().optional().min('now'),
  racingResults: Joi.string().optional(),
  remarks: Joi.string().max(1000).optional()
});

export const updatePigeonSchema = Joi.object({
  ringNumber: Joi.string().max(50).pattern(/^[A-Za-z0-9-]+$/).optional(),
  name: Joi.string().max(100).optional(),
  categoryId: Joi.number().integer().positive().optional(),
  type: Joi.string().valid(...Object.values(PigeonType)).optional(),
  status: Joi.string().valid(...Object.values(PigeonStatus)).optional(),
  gender: Joi.string().valid('MALE', 'FEMALE').optional(),
  birthDate: Joi.date().optional().max('now'),
  generation: Joi.string().max(50).optional(),
  fatherId: Joi.number().integer().positive().optional().allow(null),
  motherId: Joi.number().integer().positive().optional().allow(null),
  bloodline: Joi.string().max(200).optional(),
  featherColor: Joi.string().max(50).optional(),
  eyeColor: Joi.string().max(50).optional(),
  healthStatus: Joi.string().valid(...Object.values(HealthStatus)).optional(),
  lastDewormingDate: Joi.date().optional().max('now'),
  nextDewormingDate: Joi.date().optional().min('now'),
  lastVaccinationDate: Joi.date().optional().max('now'),
  nextVaccinationDate: Joi.date().optional().min('now'),
  racingResults: Joi.string().optional(),
  remarks: Joi.string().max(1000).optional()
});

export const batchUpdateStatusSchema = Joi.object({
  ids: Joi.array().items(Joi.number().integer().positive()).min(1).required().messages({
    'array.min': '至少选择一只赛鸽',
    'any.required': '赛鸽ID列表是必填项'
  }),
  status: Joi.string().valid(...Object.values(PigeonStatus)).required().messages({
    'any.only': '状态不合法',
    'any.required': '状态是必填项'
  }),
  reason: Joi.string().max(500).optional()
});

export const advancedSearchSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(100).default(20),
  keyword: Joi.string().max(100).optional(),
  categoryIds: Joi.array().items(Joi.number().integer().positive()).optional(),
  types: Joi.array().items(Joi.string().valid(...Object.values(PigeonType))).optional(),
  statuses: Joi.array().items(Joi.string().valid(...Object.values(PigeonStatus))).optional(),
  healthStatuses: Joi.array().items(Joi.string().valid(...Object.values(HealthStatus))).optional(),
  genders: Joi.array().items(Joi.string().valid('MALE', 'FEMALE')).optional(),
  birthStartDate: Joi.date().optional(),
  birthEndDate: Joi.date().optional(),
  ageMin: Joi.number().integer().min(0).optional(),
  ageMax: Joi.number().integer().min(0).optional(),
  bloodline: Joi.string().max(100).optional(),
  sortField: Joi.string().valid('ringNumber', 'name', 'createdAt', 'birthDate').default('createdAt'),
  sortOrder: Joi.string().valid('ASC', 'DESC').default('DESC')
});

export const createPigeon = async (req: Request, res: Response, next: NextFunction) => {
  const transaction: Transaction = await sequelize.transaction();
  
  try {
    const { ringNumber, categoryId, fatherId, motherId, ...rest } = req.body;

    const existingPigeon = await Pigeon.findOne({ 
      where: { ringNumber },
      transaction
    });
    if (existingPigeon) {
      throw new BadRequestException('足环编号已存在');
    }

    const category = await Category.findByPk(categoryId, { transaction });
    if (!category) {
      throw new BadRequestException('品类不存在');
    }
    if (category.status === CategoryStatus.INACTIVE) {
      throw new BadRequestException(`品类「${category.name}」已下架，不能录入该品类的赛鸽`);
    }

    if (fatherId) {
      if (fatherId === motherId) {
        throw new BadRequestException('父鸽和母鸽不能是同一只赛鸽');
      }
      const father = await Pigeon.findByPk(fatherId, { transaction });
      if (!father) {
        throw new BadRequestException('父鸽不存在');
      }
      if (father.gender !== 'MALE') {
        throw new BadRequestException('父鸽必须是雄性');
      }
      if (father.status !== PigeonStatus.IN_LOFT && father.status !== PigeonStatus.RETIRED) {
        throw new BadRequestException('父鸽状态不适合作为种鸽');
      }
    }

    if (motherId) {
      const mother = await Pigeon.findByPk(motherId, { transaction });
      if (!mother) {
        throw new BadRequestException('母鸽不存在');
      }
      if (mother.gender !== 'FEMALE') {
        throw new BadRequestException('母鸽必须是雌性');
      }
      if (mother.status !== PigeonStatus.IN_LOFT && mother.status !== PigeonStatus.RETIRED) {
        throw new BadRequestException('母鸽状态不适合作为种鸽');
      }
    }

    const pigeon = await Pigeon.create({
      ringNumber,
      categoryId,
      fatherId: fatherId || null,
      motherId: motherId || null,
      status: PigeonStatus.IN_LOFT,
      createdBy: req.user!.id,
      ...rest
    }, { transaction });

    await operationLogService.logSuccess(
      '赛鸽档案',
      OperationType.CREATE,
      req.user,
      { ringNumber, categoryId, type: rest.type },
      { pigeonId: pigeon.id },
      `创建赛鸽档案: ${ringNumber}`
    );

    await transaction.commit();
    logger.info(`用户[${req.user?.username}]创建赛鸽: ${ringNumber}`);
    
    res.json(ResponseUtil.success(pigeon, '创建成功'));
  } catch (error) {
    await transaction.rollback();
    await operationLogService.logFail(
      '赛鸽档案',
      OperationType.CREATE,
      (error as Error).message,
      req.user,
      req.body
    );
    next(error);
  }
};

export const advancedSearch = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      page,
      pageSize,
      keyword,
      categoryIds,
      types,
      statuses,
      healthStatuses,
      genders,
      birthStartDate,
      birthEndDate,
      ageMin,
      ageMax,
      bloodline,
      sortField,
      sortOrder
    } = req.body;

    const where: any = {};

    if (keyword) {
      where[Op.or] = [
        { ringNumber: { [Op.like]: `%${keyword}%` } },
        { name: { [Op.like]: `%${keyword}%` } }
      ];
    }

    if (categoryIds && categoryIds.length > 0) {
      where.categoryId = { [Op.in]: categoryIds };
    }

    if (types && types.length > 0) {
      where.type = { [Op.in]: types };
    }

    if (statuses && statuses.length > 0) {
      where.status = { [Op.in]: statuses };
    }

    if (healthStatuses && healthStatuses.length > 0) {
      where.healthStatus = { [Op.in]: healthStatuses };
    }

    if (genders && genders.length > 0) {
      where.gender = { [Op.in]: genders };
    }

    if (birthStartDate && birthEndDate) {
      where.birthDate = {
        [Op.between]: [new Date(birthStartDate), new Date(birthEndDate)]
      };
    }

    if (bloodline) {
      where.bloodline = { [Op.like]: `%${bloodline}%` };
    }

    if (ageMin !== undefined || ageMax !== undefined) {
      const ageWhere: any = {};
      if (ageMin !== undefined) ageWhere[Op.gte] = ageMin;
      if (ageMax !== undefined) ageWhere[Op.lte] = ageMax;
      where.age = ageWhere;
    }

    const { count, rows } = await Pigeon.findAndCountAll({
      where,
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name', 'code', 'status'] }
      ],
      offset: (page - 1) * pageSize,
      limit: pageSize,
      order: [[sortField, sortOrder]]
    });

    const list = rows.map(p => ({
      ...p.toJSON(),
      typeLabel: PIGEON_TYPE_LABELS[p.type as PigeonType],
      statusLabel: PIGEON_STATUS_LABELS[p.status],
      healthStatusLabel: p.healthStatus ? HEALTH_STATUS_LABELS[p.healthStatus as HealthStatus] : null
    }));

    await operationLogService.logSuccess(
      '赛鸽档案',
      OperationType.QUERY,
      req.user,
      { ...req.body },
      { total: count },
      '高级筛选查询赛鸽列表'
    );

    res.json(ResponseUtil.success({
      list,
      total: count,
      page,
      pageSize,
      totalPages: Math.ceil(count / pageSize)
    }));
  } catch (error) {
    next(error);
  }
};

export const getPigeonList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      page = 1,
      pageSize = 10,
      type,
      status,
      categoryId,
      keyword,
      gender
    } = req.query;

    const where: any = {};
    if (type) where.type = type;
    if (status) where.status = status;
    if (categoryId) where.categoryId = categoryId;
    if (gender) where.gender = gender;
    if (keyword) {
      where[Op.or] = [
        { ringNumber: { [Op.like]: `%${keyword}%` } },
        { name: { [Op.like]: `%${keyword}%` } },
        { bloodline: { [Op.like]: `%${keyword}%` } }
      ];
    }

    const { count, rows } = await Pigeon.findAndCountAll({
      where,
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name', 'code', 'status'] }
      ],
      offset: (Number(page) - 1) * Number(pageSize),
      limit: Number(pageSize),
      order: [['createdAt', 'DESC']]
    });

    const list = rows.map(p => ({
      ...p.toJSON(),
      typeLabel: PIGEON_TYPE_LABELS[p.type as PigeonType],
      statusLabel: PIGEON_STATUS_LABELS[p.status]
    }));

    res.json(ResponseUtil.success({
      list,
      total: count,
      page: Number(page),
      pageSize: Number(pageSize)
    }));
  } catch (error) {
    next(error);
  }
};

export const getPigeonById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const pigeon = await Pigeon.findByPk(id, {
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name', 'code', 'status'] }
      ]
    });

    if (!pigeon) {
      throw new NotFoundException('赛鸽档案不存在');
    }

    let father, mother;
    if (pigeon.fatherId) {
      father = await Pigeon.findByPk(pigeon.fatherId, {
        attributes: ['id', 'ringNumber', 'name', 'bloodline', 'status']
      });
    }
    if (pigeon.motherId) {
      mother = await Pigeon.findByPk(pigeon.motherId, {
        attributes: ['id', 'ringNumber', 'name', 'bloodline', 'status']
      });
    }

    const offspring = await Pigeon.findAll({
      where: {
        [Op.or]: [{ fatherId: id }, { motherId: id }]
      },
      attributes: ['id', 'ringNumber', 'name', 'gender', 'status'],
      limit: 20
    });

    res.json(ResponseUtil.success({
      ...pigeon.toJSON(),
      typeLabel: PIGEON_TYPE_LABELS[pigeon.type as PigeonType],
      statusLabel: PIGEON_STATUS_LABELS[pigeon.status],
      healthStatusLabel: pigeon.healthStatus ? HEALTH_STATUS_LABELS[pigeon.healthStatus as HealthStatus] : null,
      father,
      mother,
      offspring
    }));
  } catch (error) {
    next(error);
  }
};

export const updatePigeon = async (req: Request, res: Response, next: NextFunction) => {
  const transaction: Transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { ringNumber, categoryId, fatherId, motherId, ...rest } = req.body;

    const pigeon = await Pigeon.findByPk(id, { transaction });
    if (!pigeon) {
      throw new NotFoundException('赛鸽档案不存在');
    }

    if (ringNumber && ringNumber !== pigeon.ringNumber) {
      const existingPigeon = await Pigeon.findOne({ 
        where: { ringNumber },
        transaction
      });
      if (existingPigeon) {
        throw new BadRequestException('足环编号已存在');
      }
    }

    if (categoryId && categoryId !== pigeon.categoryId) {
      const category = await Category.findByPk(categoryId, { transaction });
      if (!category) {
        throw new BadRequestException('品类不存在');
      }
      if (category.status === CategoryStatus.INACTIVE) {
        throw new BadRequestException(`品类「${category.name}」已下架，不能移动到该品类`);
      }
    }

    if (fatherId !== undefined && fatherId !== pigeon.fatherId && fatherId !== null) {
      if (fatherId === Number(id)) {
        throw new BadRequestException('父鸽不能是自己');
      }
      const father = await Pigeon.findByPk(fatherId, { transaction });
      if (!father || father.gender !== 'MALE') {
        throw new BadRequestException('父鸽不存在或不是雄性');
      }
    }

    if (motherId !== undefined && motherId !== pigeon.motherId && motherId !== null) {
      if (motherId === Number(id)) {
        throw new BadRequestException('母鸽不能是自己');
      }
      const mother = await Pigeon.findByPk(motherId, { transaction });
      if (!mother || mother.gender !== 'FEMALE') {
        throw new BadRequestException('母鸽不存在或不是雌性');
      }
    }

    await pigeon.update({
      ringNumber,
      categoryId,
      fatherId,
      motherId,
      ...rest
    }, { transaction });

    await operationLogService.logSuccess(
      '赛鸽档案',
      OperationType.UPDATE,
      req.user,
      { pigeonId: id, ...req.body },
      null,
      `更新赛鸽档案: ${pigeon.ringNumber}`
    );

    await transaction.commit();
    logger.info(`用户[${req.user?.username}]更新赛鸽: ${pigeon.ringNumber}`);
    
    res.json(ResponseUtil.success(pigeon, '更新成功'));
  } catch (error) {
    await transaction.rollback();
    await operationLogService.logFail(
      '赛鸽档案',
      OperationType.UPDATE,
      (error as Error).message,
      req.user,
      { pigeonId: req.params.id, ...req.body }
    );
    next(error);
  }
};

export const batchUpdateStatus = async (req: Request, res: Response, next: NextFunction) => {
  const transaction: Transaction = await sequelize.transaction();
  
  try {
    const { ids, status, reason } = req.body;

    const pigeons = await Pigeon.findAll({
      where: { id: { [Op.in]: ids } },
      transaction
    });

    if (pigeons.length !== ids.length) {
      throw new BadRequestException('部分赛鸽不存在，请刷新后重试');
    }

    await Pigeon.update(
      { status },
      { where: { id: { [Op.in]: ids } }, transaction }
    );

    await operationLogService.logSuccess(
      '赛鸽档案',
      OperationType.UPDATE,
      req.user,
      { ids, status, reason },
      { count: ids.length },
      `批量更新 ${ids.length} 只赛鸽状态为: ${status}, 原因: ${reason || '无'}`
    );

    await transaction.commit();
    logger.info(`用户[${req.user?.username}]批量更新赛鸽状态: ${ids.join(',')} → ${status}`);
    
    res.json(ResponseUtil.success({ updatedCount: ids.length }, `成功更新 ${ids.length} 只赛鸽的状态`));
  } catch (error) {
    await transaction.rollback();
    await operationLogService.logFail(
      '赛鸽档案',
      OperationType.UPDATE,
      (error as Error).message,
      req.user,
      req.body
    );
    next(error);
  }
};

export const deletePigeon = async (req: Request, res: Response, next: NextFunction) => {
  const transaction: Transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;

    const pigeon = await Pigeon.findByPk(id, { transaction });
    if (!pigeon) {
      throw new NotFoundException('赛鸽档案不存在');
    }

    const offspringCount = await Pigeon.count({
      where: {
        [Op.or]: [{ fatherId: id }, { motherId: id }]
      },
      transaction
    });
    if (offspringCount > 0) {
      throw new BadRequestException('该赛鸽有后代记录，无法删除');
    }

    const ringNumber = pigeon.ringNumber;
    await pigeon.destroy({ transaction });

    await operationLogService.logSuccess(
      '赛鸽档案',
      OperationType.DELETE,
      req.user,
      { pigeonId: id, ringNumber },
      null,
      `删除赛鸽档案: ${ringNumber}`
    );

    await transaction.commit();
    logger.info(`用户[${req.user?.username}]删除赛鸽: ${ringNumber}`);
    
    res.json(ResponseUtil.success(null, '删除成功'));
  } catch (error) {
    await transaction.rollback();
    await operationLogService.logFail(
      '赛鸽档案',
      OperationType.DELETE,
      (error as Error).message,
      req.user,
      { pigeonId: req.params.id }
    );
    next(error);
  }
};

export const getExpiringReminders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const today = dayjs().startOf('day').toDate();
    const sevenDaysLater = dayjs().add(7, 'day').endOf('day').toDate();

    const dewormingPigeons = await Pigeon.findAll({
      where: {
        nextDewormingDate: {
          [Op.between]: [today, sevenDaysLater]
        },
        status: { [Op.ne]: PigeonStatus.DECEASED }
      },
      include: [{ model: Category, as: 'category', attributes: ['name'] }],
      order: [['nextDewormingDate', 'ASC']]
    });

    const vaccinationPigeons = await Pigeon.findAll({
      where: {
        nextVaccinationDate: {
          [Op.between]: [today, sevenDaysLater]
        },
        status: { [Op.ne]: PigeonStatus.DECEASED }
      },
      include: [{ model: Category, as: 'category', attributes: ['name'] }],
      order: [['nextVaccinationDate', 'ASC']]
    });

    const statusStats = await Pigeon.findAll({
      attributes: ['status', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['status']
    });

    res.json(ResponseUtil.success({
      deworming: dewormingPigeons,
      dewormingCount: dewormingPigeons.length,
      vaccination: vaccinationPigeons,
      vaccinationCount: vaccinationPigeons.length,
      statusStats: statusStats.map(s => ({
        status: s.status,
        label: PIGEON_STATUS_LABELS[s.status as PigeonStatus],
        count: (s as any).dataValues.count
      })),
      totalExpiring: dewormingPigeons.length + vaccinationPigeons.length
    }));
  } catch (error) {
    next(error);
  }
};

export const getPigeonGenealogy = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { generations = 3 } = req.query;

    const pigeon = await Pigeon.findByPk(id);
    if (!pigeon) {
      throw new NotFoundException('赛鸽档案不存在');
    }

    const genealogy: any = {
      current: pigeon.toJSON()
    };

    const fetchAncestors = async (pigeonId: number, level: number, maxLevel: number): Promise<any> => {
      if (level > maxLevel) return null;
      
      const p = await Pigeon.findByPk(pigeonId, {
        attributes: ['id', 'ringNumber', 'name', 'gender', 'bloodline', 'status']
      });
      if (!p) return null;

      const result = p.toJSON();
      
      if (p.fatherId && level < maxLevel) {
        result.father = await fetchAncestors(p.fatherId, level + 1, maxLevel);
      }
      if (p.motherId && level < maxLevel) {
        result.mother = await fetchAncestors(p.motherId, level + 1, maxLevel);
      }

      return result;
    };

    genealogy.ancestors = await fetchAncestors(id, 1, Number(generations));

    const offspring = await Pigeon.findAll({
      where: {
        [Op.or]: [{ fatherId: id }, { motherId: id }]
      },
      attributes: ['id', 'ringNumber', 'name', 'gender', 'bloodline', 'status', 'fatherId', 'motherId']
    });
    genealogy.offspring = offspring;

    res.json(ResponseUtil.success(genealogy));
  } catch (error) {
    next(error);
  }
};
