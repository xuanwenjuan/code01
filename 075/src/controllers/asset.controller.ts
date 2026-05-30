
import { Request, Response, NextFunction } from 'express';
import { Asset, AssetCategory, sequelize } from '../models';
import { 
  successResponse, 
  paginatedResponse, 
  NotFoundError, 
  BadRequestError,
  ConflictError
} from '../utils/response';
import { commonValidators, assetValidators } from '../utils/validation';
import { validateRequest } from '../middleware/error.middleware';
import { AssetStatus, OperationType, UserRole } from '../types';
import OperationLogService from '../services/operationLog.service';
import LocationSyncService from '../services/locationSync.service';
import { Op } from 'sequelize';

export const assetValidationRules = {
  create: [
    assetValidators.assetCode,
    assetValidators.name,
    assetValidators.categoryId,
    assetValidators.purchaseDate,
    assetValidators.purchasePrice,
    assetValidators.specModel,
    assetValidators.brand,
    assetValidators.depreciationRate,
    assetValidators.department,
    assetValidators.storageLocation,
    assetValidators.responsiblePerson,
    assetValidators.status,
    assetValidators.warrantyDate,
    assetValidators.description,
    validateRequest
  ],
  update: [
    commonValidators.id,
    assetValidators.assetCode.optional(),
    assetValidators.name.optional(),
    assetValidators.categoryId.optional(),
    assetValidators.purchaseDate.optional(),
    assetValidators.purchasePrice.optional(),
    assetValidators.specModel.optional(),
    assetValidators.brand.optional(),
    assetValidators.depreciationRate.optional(),
    assetValidators.department.optional(),
    assetValidators.storageLocation.optional(),
    assetValidators.responsiblePerson.optional(),
    assetValidators.status.optional(),
    assetValidators.warrantyDate.optional(),
    assetValidators.description.optional(),
    validateRequest
  ],
  getList: [
    commonValidators.page,
    commonValidators.pageSize,
    commonValidators.keyword,
    commonValidators.status,
    commonValidators.department,
    commonValidators.categoryId,
    commonValidators.startDate,
    commonValidators.endDate,
    validateRequest
  ],
  getDetail: [
    commonValidators.id,
    validateRequest
  ],
  delete: [
    commonValidators.id,
    validateRequest
  ],
  batchScrap: [
    commonValidators.ids,
    validateRequest
  ]
};

export const createAsset = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const transaction = await sequelize.transaction();
  
  try {
    const { 
      assetCode, name, categoryId, specModel, brand, purchaseDate,
      purchasePrice, depreciationRate = 10, department, storageLocation,
      responsiblePerson, status = AssetStatus.IDLE, warrantyDate, description
    } = req.body;

    const existingAsset = await Asset.findOne({ where: { assetCode } });
    if (existingAsset) {
      throw new ConflictError('资产编码已存在');
    }

    const category = await AssetCategory.findByPk(categoryId);
    if (!category) {
      throw new BadRequestError('资产分类不存在');
    }
    if (!category.isActive) {
      throw new BadRequestError('资产分类已停用');
    }

    let finalStorageLocation = storageLocation;
    if (department && !storageLocation) {
      finalStorageLocation = LocationSyncService.getLocationForDepartment(department);
    }

    const currentValue = purchasePrice * (1 - depreciationRate / 100);

    const asset = await Asset.create(
      {
        assetCode,
        name,
        categoryId,
        specModel,
        brand,
        purchaseDate,
        purchasePrice,
        currentValue,
        depreciationRate,
        department,
        storageLocation: finalStorageLocation,
        responsiblePerson,
        status,
        warrantyDate,
        description
      },
      { transaction }
    );

    await OperationLogService.logAssetOperation(
      req,
      OperationType.CREATE,
      asset.id,
      asset.name,
      '创建资产信息',
      'success'
    );

    await transaction.commit();
    successResponse(res, asset, '资产创建成功', 201);
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

export const getAssetList = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      page = 1,
      pageSize = 20,
      keyword,
      status,
      department,
      categoryId,
      startDate,
      endDate
    } = req.query;

    const where: any = {};

    if (keyword) {
      where[Op.or] = [
        { assetCode: { [Op.like]: `%${keyword}%` } },
        { name: { [Op.like]: `%${keyword}%` } },
        { specModel: { [Op.like]: `%${keyword}%` } },
        { brand: { [Op.like]: `%${keyword}%` } },
        { responsiblePerson: { [Op.like]: `%${keyword}%` } }
      ];
    }

    if (status) {
      where.status = status;
    }

    if (department) {
      where.department = department;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (startDate && endDate) {
      where.purchaseDate = {
        [Op.between]: [startDate, endDate]
      };
    }

    const user = req.user;
    if (user && user.role === UserRole.DEPARTMENT_HEAD && user.department) {
      where.department = user.department;
    }

    const { count, rows } = await Asset.findAndCountAll({
      where,
      include: [
        {
          model: AssetCategory,
          as: 'category',
          attributes: ['id', 'name', 'code']
        }
      ],
      offset: (Number(page) - 1) * Number(pageSize),
      limit: Number(pageSize),
      order: [['createdAt', 'DESC']]
    });

    paginatedResponse(res, rows, count, Number(page), Number(pageSize), '查询成功');
  } catch (error) {
    next(error);
  }
};

export const getAssetDetail = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const asset = await Asset.findByPk(id, {
      include: [
        {
          model: AssetCategory,
          as: 'category',
          attributes: ['id', 'name', 'code']
        }
      ]
    });

    if (!asset) {
      throw new NotFoundError('资产不存在');
    }

    successResponse(res, asset);
  } catch (error) {
    next(error);
  }
};

export const updateAsset = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const updateData = req.body;

    const asset = await Asset.findByPk(id);
    if (!asset) {
      throw new NotFoundError('资产不存在');
    }

    if (updateData.assetCode && updateData.assetCode !== asset.assetCode) {
      const existingAsset = await Asset.findOne({
        where: { assetCode: updateData.assetCode, id: { [Op.ne]: id } }
      });
      if (existingAsset) {
        throw new ConflictError('资产编码已存在');
      }
    }

    if (updateData.categoryId) {
      const category = await AssetCategory.findByPk(updateData.categoryId);
      if (!category) {
        throw new BadRequestError('资产分类不存在');
      }
      if (!category.isActive) {
        throw new BadRequestError('资产分类已停用');
      }
    }

    if (updateData.department) {
      const locationResult = LocationSyncService.syncLocationByDepartment(
        updateData.department,
        updateData.storageLocation || asset.storageLocation
      );
      if (locationResult.isChanged) {
        updateData.storageLocation = locationResult.location;
      }
    }

    if (updateData.purchasePrice || updateData.depreciationRate) {
      const purchasePrice = updateData.purchasePrice ?? asset.purchasePrice;
      const depreciationRate = updateData.depreciationRate ?? asset.depreciationRate;
      updateData.currentValue = purchasePrice * (1 - depreciationRate / 100);
    }

    await asset.update(updateData, { transaction });

    await OperationLogService.logAssetOperation(
      req,
      OperationType.UPDATE,
      asset.id,
      asset.name,
      '更新资产信息',
      'success'
    );

    await transaction.commit();
    successResponse(res, asset, '资产更新成功');
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

export const deleteAsset = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;

    const asset = await Asset.findByPk(id);
    if (!asset) {
      throw new NotFoundError('资产不存在');
    }

    await asset.destroy({ transaction });

    await OperationLogService.logAssetOperation(
      req,
      OperationType.DELETE,
      asset.id,
      asset.name,
      '删除资产信息',
      'success'
    );

    await transaction.commit();
    successResponse(res, null, '资产删除成功');
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

export const batchScrapAssets = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const transaction = await sequelize.transaction();
  
  try {
    const { ids } = req.body;

    const assets = await Asset.findAll({
      where: {
        id: { [Op.in]: ids },
        status: { [Op.ne]: AssetStatus.SCRAPPED }
      }
    });

    if (assets.length === 0) {
      throw new BadRequestError('没有可报废的资产');
    }

    await Asset.update(
      { status: AssetStatus.SCRAPPED },
      {
        where: { id: { [Op.in]: ids } },
        transaction
      }
    );

    for (const asset of assets) {
      await OperationLogService.logAssetOperation(
        req,
        OperationType.SCRAP,
        asset.id,
        asset.name,
        '批量报废资产',
        'success'
      );
    }

    await transaction.commit();
    successResponse(res, { count: assets.length }, `成功报废${assets.length}个资产`);
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

export const getAssetStatistics = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user;
    const where: any = {};
    
    if (user && user.role === UserRole.DEPARTMENT_HEAD && user.department) {
      where.department = user.department;
    }

    const [totalAssets, statusStats, categoryStats, departmentStats, warrantyStats] = await Promise.all([
      Asset.count({ where }),
      Asset.findAll({
        where,
        attributes: ['status', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
        group: ['status']
      }),
      Asset.findAll({
        where,
        attributes: ['categoryId', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
        include: [{ model: AssetCategory, as: 'category', attributes: ['name'] }],
        group: ['categoryId']
      }),
      Asset.findAll({
        where,
        attributes: ['department', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
        group: ['department']
      }),
      Asset.findAll({
        where: {
          ...where,
          warrantyDate: { [Op.gt]: new Date() }
        },
        attributes: [[sequelize.fn('COUNT', sequelize.col('id')), 'count']]
      })
    ]);

    const statusMap: any = {};
    statusStats.forEach((s: any) => {
      statusMap[s.status] = s.dataValues.count;
    });

    const statistics = {
      totalAssets,
      statusBreakdown: {
        idle: statusMap[AssetStatus.IDLE] || 0,
        inUse: statusMap[AssetStatus.IN_USE] || 0,
        inRepair: statusMap[AssetStatus.IN_REPAIR] || 0,
        scrapped: statusMap[AssetStatus.SCRAPPED] || 0
      },
      categoryBreakdown: categoryStats.map((c: any) => ({
        categoryId: c.categoryId,
        categoryName: c.category?.name || '未知分类',
        count: c.dataValues.count
      })),
      departmentBreakdown: departmentStats.map((d: any) => ({
        department: d.department || '未分配',
        count: d.dataValues.count
      })),
      warrantyActiveCount: (warrantyStats[0] as any)?.dataValues?.count || 0
    };

    successResponse(res, statistics, '统计数据获取成功');
  } catch (error) {
    next(error);
  }
};

export const calculateAssetDepreciation = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const transaction = await sequelize.transaction();
  
  try {
    const { categoryId, department } = req.body;
    
    const where: any = {
      status: { [Op.ne]: AssetStatus.SCRAPPED }
    };
    
    if (categoryId) where.categoryId = categoryId;
    if (department) where.department = department;

    const assets = await Asset.findAll({ where, transaction });

    let updatedCount = 0;
    for (const asset of assets) {
      const currentValue = asset.purchasePrice * (1 - asset.depreciationRate / 100);
      if (Math.abs(currentValue - asset.currentValue) > 0.01) {
        await asset.update({ currentValue }, { transaction });
        updatedCount++;
      }
    }

    await transaction.commit();
    successResponse(res, { updatedCount }, `成功更新${updatedCount}个资产的折旧价值`);
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};
