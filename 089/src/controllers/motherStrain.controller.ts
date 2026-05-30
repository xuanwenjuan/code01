import { Request, Response, NextFunction } from 'express';
import { Transaction } from 'sequelize';
import MotherStrain from '../models/MotherStrain';
import StrainCategory from '../models/StrainCategory';
import { ResponseUtil } from '../utils/response';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/error';
import { MotherStrainStatus, MotherStrainFilterParams, OperationType, Op } from '../types';
import sequelize from '../config/database';
import OperationLogService from '../services/operationLog.service';

const checkCategoryHierarchyActive = async (categoryId: number): Promise<{ isActive: boolean; inactiveCategoryName?: string }> => {
  const category = await StrainCategory.findByPk(categoryId);
  if (!category) {
    return { isActive: false };
  }
  
  if (!category.isActive) {
    return { isActive: false, inactiveCategoryName: category.categoryName };
  }
  
  if (category.parentId) {
    return await checkCategoryHierarchyActive(category.parentId);
  }
  
  return { isActive: true };
};

export const createMotherStrain = async (req: Request, res: Response, next: NextFunction) => {
  const t: Transaction = await sequelize.transaction();
  
  try {
    const { strainCode, strainName, categoryId, generation, mediumFormula, storageTemperature, originSource, viabilityDate, remark } = req.body;

    const existingStrain = await MotherStrain.findOne({ where: { strainCode } });
    if (existingStrain) {
      throw new BadRequestError('菌种编号已存在');
    }

    const { isActive, inactiveCategoryName } = await checkCategoryHierarchyActive(categoryId);
    if (!isActive) {
      throw new BadRequestError(`分类${inactiveCategoryName ? ` "${inactiveCategoryName}"` : ''}已退市，无法创建菌种`);
    }

    const motherStrain = await MotherStrain.create({
      strainCode,
      strainName,
      categoryId,
      generation,
      mediumFormula,
      storageTemperature,
      originSource,
      viabilityDate: viabilityDate ? new Date(viabilityDate) : null,
      status: MotherStrainStatus.BREEDING,
      remark,
      createdBy: req.user?.userId
    }, { transaction: t });

    await OperationLogService.createLog(
      req,
      'mother_strain',
      OperationType.CREATE,
      motherStrain.id,
      strainCode,
      null,
      motherStrain.toJSON(),
      '创建母种档案'
    );

    await t.commit();

    res.json(ResponseUtil.success(motherStrain, '母种档案创建成功'));
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

export const getMotherStrains = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { 
      page = 1, 
      pageSize = 10, 
      strainCode, 
      strainName, 
      categoryId, 
      status, 
      generation,
      startDate,
      endDate 
    } = req.query as MotherStrainFilterParams;

    const where: any = {};
    
    if (strainCode) {
      where.strainCode = { [Op.like]: `%${strainCode}%` };
    }
    if (strainName) {
      where.strainName = { [Op.like]: `%${strainName}%` };
    }
    if (categoryId) {
      where.categoryId = Number(categoryId);
    }
    if (status) {
      where.status = status;
    }
    if (generation) {
      where.generation = Number(generation);
    }
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        where.createdAt[Op.lte] = new Date(endDate);
      }
    }

    const { count, rows } = await MotherStrain.findAndCountAll({
      where,
      include: [
        { model: StrainCategory, as: 'category', attributes: ['id', 'categoryName', 'categoryCode'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize)
    });

    res.json(ResponseUtil.success({
      list: rows,
      total: count,
      page: Number(page),
      pageSize: Number(pageSize),
      totalPages: Math.ceil(count / Number(pageSize))
    }));
  } catch (error) {
    next(error);
  }
};

export const getMotherStrainById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const motherStrain = await MotherStrain.findByPk(id, {
      include: [{ model: StrainCategory, as: 'category' }]
    });

    if (!motherStrain) {
      throw new NotFoundError('母种档案不存在');
    }

    res.json(ResponseUtil.success(motherStrain));
  } catch (error) {
    next(error);
  }
};

export const updateMotherStrain = async (req: Request, res: Response, next: NextFunction) => {
  const t: Transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const updateData = req.body;

    const motherStrain = await MotherStrain.findByPk(id);
    if (!motherStrain) {
      throw new NotFoundError('母种档案不存在');
    }

    const oldValue = motherStrain.toJSON();

    if (updateData.categoryId && updateData.categoryId !== motherStrain.categoryId) {
      const { isActive, inactiveCategoryName } = await checkCategoryHierarchyActive(updateData.categoryId);
      if (!isActive) {
        throw new BadRequestError(`分类${inactiveCategoryName ? ` "${inactiveCategoryName}"` : ''}已退市，无法转移`);
      }
    }

    if (updateData.strainCode && updateData.strainCode !== motherStrain.strainCode) {
      const existingStrain = await MotherStrain.findOne({ 
        where: { strainCode: updateData.strainCode },
        transaction: t
      });
      if (existingStrain) {
        throw new BadRequestError('菌种编号已存在');
      }
    }

    await motherStrain.update(updateData, { transaction: t });

    await OperationLogService.createLog(
      req,
      'mother_strain',
      OperationType.UPDATE,
      motherStrain.id,
      motherStrain.strainCode,
      oldValue,
      motherStrain.toJSON(),
      '更新母种档案'
    );

    await t.commit();

    res.json(ResponseUtil.success(motherStrain, '母种档案更新成功'));
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

export const updateStrainStatus = async (req: Request, res: Response, next: NextFunction) => {
  const t: Transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { status, remark } = req.body;

    const motherStrain = await MotherStrain.findByPk(id, { transaction: t });
    if (!motherStrain) {
      throw new NotFoundError('母种档案不存在');
    }

    if (!Object.values(MotherStrainStatus).includes(status)) {
      throw new BadRequestError('无效的菌种状态');
    }

    const oldValue = motherStrain.toJSON();

    await motherStrain.update({ status }, { transaction: t });

    await OperationLogService.createLog(
      req,
      'mother_strain',
      OperationType.STATUS_CHANGE,
      motherStrain.id,
      motherStrain.strainCode,
      oldValue,
      motherStrain.toJSON(),
      remark || `菌种状态变更为: ${status}`
    );

    await t.commit();

    res.json(ResponseUtil.success(motherStrain, '菌种状态更新成功'));
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

export const deleteMotherStrain = async (req: Request, res: Response, next: NextFunction) => {
  const t: Transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;

    const motherStrain = await MotherStrain.findByPk(id, { transaction: t });
    if (!motherStrain) {
      throw new NotFoundError('母种档案不存在');
    }

    const oldValue = motherStrain.toJSON();

    await motherStrain.destroy({ transaction: t });

    await OperationLogService.createLog(
      req,
      'mother_strain',
      OperationType.DELETE,
      motherStrain.id,
      motherStrain.strainCode,
      oldValue,
      null,
      '删除母种档案'
    );

    await t.commit();

    res.json(ResponseUtil.success(null, '母种档案删除成功'));
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

export const expandStrain = async (req: Request, res: Response, next: NextFunction) => {
  const t: Transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { newStrainCode, newStrainName, generationIncrement = 1, remark } = req.body;

    const parentStrain = await MotherStrain.findByPk(id, { transaction: t });
    if (!parentStrain) {
      throw new NotFoundError('母种档案不存在');
    }

    if (parentStrain.status === MotherStrainStatus.SCRAPPED) {
      throw new BadRequestError('已报废的菌种无法扩繁');
    }

    const existingStrain = await MotherStrain.findOne({ 
      where: { strainCode: newStrainCode },
      transaction: t
    });
    if (existingStrain) {
      throw new BadRequestError('新菌种编号已存在');
    }

    const newStrain = await MotherStrain.create({
      strainCode: newStrainCode,
      strainName: newStrainName || parentStrain.strainName,
      categoryId: parentStrain.categoryId,
      generation: parentStrain.generation + generationIncrement,
      mediumFormula: parentStrain.mediumFormula,
      storageTemperature: parentStrain.storageTemperature,
      originSource: `扩繁自: ${parentStrain.strainCode}`,
      parentId: parentStrain.id,
      status: MotherStrainStatus.BREEDING,
      remark,
      createdBy: req.user?.userId
    }, { transaction: t });

    await OperationLogService.createLog(
      req,
      'mother_strain',
      OperationType.CREATE,
      newStrain.id,
      newStrainCode,
      null,
      newStrain.toJSON(),
      `扩繁菌种: 父代 ${parentStrain.strainCode}`
    );

    await t.commit();

    res.json(ResponseUtil.success(newStrain, '菌种扩繁成功'));
  } catch (error) {
    await t.rollback();
    next(error);
  }
};
