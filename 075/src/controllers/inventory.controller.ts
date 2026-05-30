
import { Request, Response, NextFunction } from 'express';
import { AssetInventory, Asset, User, sequelize } from '../models';
import { 
  successResponse, 
  paginatedResponse, 
  NotFoundError, 
  BadRequestError
} from '../utils/response';
import { commonValidators, inventoryValidators } from '../utils/validation';
import { validateRequest } from '../middleware/error.middleware';
import { 
  InventoryResult, 
  AssetStatus, 
  OperationType,
  UserRole
} from '../types';
import OperationLogService from '../services/operationLog.service';
import InventoryDiffService from '../services/inventoryDiff.service';
import { Op } from 'sequelize';

export const inventoryValidationRules = {
  create: [
    inventoryValidators.inventoryDate,
    inventoryValidators.assetId,
    inventoryValidators.bookStatus,
    inventoryValidators.actualStatus,
    inventoryValidators.result,
    inventoryValidators.remark,
    validateRequest
  ],
  batchCreate: [
    inventoryValidators.assets,
    validateRequest
  ],
  getList: [
    commonValidators.page,
    commonValidators.pageSize,
    commonValidators.keyword,
    validateRequest
  ],
  getDetail: [
    commonValidators.id,
    validateRequest
  ],
  getReport: [
    commonValidators.startDate,
    commonValidators.endDate,
    validateRequest
  ],
  getDepreciationReport: [
    commonValidators.startDate,
    commonValidators.endDate,
    validateRequest
  ]
};

export const createInventoryRecord = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const transaction = await sequelize.transaction();
  
  try {
    const { inventoryDate, assetId, bookStatus, actualStatus, result, remark } = req.body;
    const operatorId = req.user!.userId;

    const asset = await Asset.findByPk(assetId);
    if (!asset) {
      throw new NotFoundError('资产不存在');
    }

    const diffResult = InventoryDiffService.compareInventoryItem(asset, actualStatus);

    const inventoryNo = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    const inventory = await AssetInventory.create(
      {
        inventoryNo,
        inventoryDate,
        assetId,
        bookStatus: bookStatus || asset.status,
        actualStatus,
        result: result || diffResult.result,
        remark,
        operatorId
      },
      { transaction }
    );

    if (result === InventoryResult.LOSS && asset.status !== AssetStatus.SCRAPPED) {
      await asset.update(
        { status: AssetStatus.SCRAPPED },
        { transaction }
      );

      await OperationLogService.logAssetOperation(
        req,
        OperationType.INVENTORY,
        asset.id,
        asset.name,
        '盘点盘亏，资产标记为报废',
        'success'
      );
    }

    await OperationLogService.logInventoryOperation(
      req,
      OperationType.CREATE,
      inventory.id,
      inventory.inventoryNo,
      '创建盘点记录',
      'success'
    );

    await transaction.commit();
    successResponse(res, { 
      inventory, 
      diffResult 
    }, '盘点记录创建成功', 201);
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

export const batchCreateInventory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const transaction = await sequelize.transaction();
  
  try {
    const { assets, inventoryDate } = req.body;
    const operatorId = req.user!.userId;

    const { summary, diffDetails } = await InventoryDiffService.batchCompareInventory(assets);

    const inventoryRecords = [];
    for (const diff of diffDetails) {
      const inventoryNo = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      
      const inventory = await AssetInventory.create(
        {
          inventoryNo,
          inventoryDate: inventoryDate || new Date(),
          assetId: diff.assetId,
          bookStatus: diff.bookStatus,
          actualStatus: diff.actualStatus,
          result: diff.result,
          remark: diff.diffDescription,
          operatorId
        },
        { transaction }
      );
      
      inventoryRecords.push(inventory);

      if (diff.result === InventoryResult.LOSS) {
        const asset = await Asset.findByPk(diff.assetId);
        if (asset && asset.status !== AssetStatus.SCRAPPED) {
          await asset.update(
            { status: AssetStatus.SCRAPPED },
            { transaction }
          );
        }
      }
    }

    await OperationLogService.logInventoryOperation(
      req,
      OperationType.CREATE,
      0,
      'BATCH',
      `批量创建${inventoryRecords.length}条盘点记录`,
      'success'
    );

    await transaction.commit();
    successResponse(res, { 
      count: inventoryRecords.length, 
      summary,
      diffDetails 
    }, '批量盘点完成');
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

export const getInventoryList = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page = 1, pageSize = 20, keyword, result, startDate, endDate } = req.query;

    const where: any = {};

    if (result) {
      where.result = result;
    }

    if (startDate && endDate) {
      where.inventoryDate = {
        [Op.between]: [startDate, endDate]
      };
    }

    const user = req.user!;
    if (user.role === UserRole.DEPARTMENT_HEAD && user.department) {
    }

    const { count, rows } = await AssetInventory.findAndCountAll({
      where,
      include: [
        {
          model: Asset,
          as: 'asset',
          attributes: ['id', 'assetCode', 'name', 'status', 'department']
        },
        {
          model: User,
          as: 'operator',
          attributes: ['id', 'username', 'realName']
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

export const getInventoryStatistics = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { startDate, endDate, department } = req.query;

    const where: any = {};
    if (startDate && endDate) {
      where.inventoryDate = {
        [Op.between]: [startDate, endDate]
      };
    }

    const [totalInventories, resultStats] = await Promise.all([
      AssetInventory.count({ where }),
      AssetInventory.findAll({
        where,
        attributes: ['result', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
        group: ['result']
      })
    ]);

    const resultMap: any = {};
    resultStats.forEach((r: any) => {
      resultMap[r.result] = r.dataValues.count;
    });

    const normalCount = resultMap[InventoryResult.NORMAL] || 0;
    const profitCount = resultMap[InventoryResult.PROFIT] || 0;
    const lossCount = resultMap[InventoryResult.LOSS] || 0;
    const normalRate = totalInventories > 0 ? ((normalCount / totalInventories) * 100).toFixed(2) : '0.00';

    const statistics = {
      totalInventories,
      resultBreakdown: {
        normal: normalCount,
        profit: profitCount,
        loss: lossCount
      },
      normalRate: `${normalRate}%`
    };

    successResponse(res, statistics, '统计数据获取成功');
  } catch (error) {
    next(error);
  }
};

export const getInventoryReport = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { startDate, endDate, department } = req.query;

    const where: any = {};
    if (startDate && endDate) {
      where.inventoryDate = {
        [Op.between]: [startDate, endDate]
      };
    }

    const inventories = await AssetInventory.findAll({
      where,
      include: [
        {
          model: Asset,
          as: 'asset',
          attributes: ['id', 'assetCode', 'name', 'status', 'department', 'categoryId']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    const diffItems = inventories.map((inv: any) => ({
      assetId: inv.assetId,
      assetCode: inv.asset?.assetCode,
      assetName: inv.asset?.name,
      bookStatus: inv.bookStatus,
      actualStatus: inv.actualStatus,
      result: inv.result,
      diffDescription: inv.remark,
      isAbnormal: inv.result !== InventoryResult.NORMAL
    }));

    const totalCount = diffItems.length;
    const normalCount = diffItems.filter((d: any) => d.result === InventoryResult.NORMAL).length;
    const profitCount = diffItems.filter((d: any) => d.result === InventoryResult.PROFIT).length;
    const lossCount = diffItems.filter((d: any) => d.result === InventoryResult.LOSS).length;
    const normalRate = totalCount > 0 ? ((normalCount / totalCount) * 100).toFixed(2) : '0.00';

    const abnormalAssets = diffItems.filter((d: any) => d.isAbnormal);

    const report = {
      summary: {
        totalCount,
        normalCount,
        profitCount,
        lossCount,
        normalRate: `${normalRate}%`,
        abnormalAssets
      },
      details: diffItems
    };

    successResponse(res, report, '盘点报表生成成功');
  } catch (error) {
    next(error);
  }
};

export const getDepreciationReport = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const assets = await Asset.findAll({
      where: {
        status: { [Op.ne]: AssetStatus.SCRAPPED }
      },
      attributes: [
        'id', 'assetCode', 'name', 'categoryId', 'department',
        'purchaseDate', 'purchasePrice', 'currentValue', 'depreciationRate'
      ]
    });

    const depreciationDetails = assets.map((asset: any) => {
      const depreciationAmount = asset.purchasePrice - asset.currentValue;
      return {
        assetId: asset.id,
        assetCode: asset.assetCode,
        assetName: asset.name,
        categoryId: asset.categoryId,
        department: asset.department,
        purchaseDate: asset.purchaseDate,
        purchasePrice: asset.purchasePrice,
        currentValue: asset.currentValue,
        depreciationAmount,
        depreciationRate: asset.depreciationRate
      };
    });

    const totalPurchasePrice = depreciationDetails.reduce((sum, d) => sum + d.purchasePrice, 0);
    const totalCurrentValue = depreciationDetails.reduce((sum, d) => sum + d.currentValue, 0);
    const totalDepreciation = totalPurchasePrice - totalCurrentValue;

    const departmentStats: any = {};
    depreciationDetails.forEach((d) => {
      const dept = d.department || '未分配';
      if (!departmentStats[dept]) {
        departmentStats[dept] = { count: 0, purchasePrice: 0, currentValue: 0 };
      }
      departmentStats[dept].count++;
      departmentStats[dept].purchasePrice += d.purchasePrice;
      departmentStats[dept].currentValue += d.currentValue;
    });

    const departmentBreakdown = Object.entries(departmentStats).map(([department, stats]: [string, any]) => ({
      department,
      count: stats.count,
      purchasePrice: stats.purchasePrice,
      currentValue: stats.currentValue,
      depreciation: stats.purchasePrice - stats.currentValue
    }));

    const report = {
      summary: {
        totalAssets: depreciationDetails.length,
        totalPurchasePrice,
        totalCurrentValue,
        totalDepreciation,
        overallDepreciationRate: totalPurchasePrice > 0 
          ? ((totalDepreciation / totalPurchasePrice) * 100).toFixed(2) + '%' 
          : '0.00%'
      },
      departmentBreakdown,
      details: depreciationDetails
    };

    successResponse(res, report, '折旧报表生成成功');
  } catch (error) {
    next(error);
  }
};

export const getInventoryDetail = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const inventory = await AssetInventory.findByPk(id, {
      include: [
        {
          model: Asset,
          as: 'asset',
          attributes: ['id', 'assetCode', 'name', 'status', 'department']
        },
        {
          model: User,
          as: 'operator',
          attributes: ['id', 'username', 'realName']
        }
      ]
    });

    if (!inventory) {
      throw new NotFoundError('盘点记录不存在');
    }

    successResponse(res, inventory);
  } catch (error) {
    next(error);
  }
};

export const calculateMonthlyDepreciation = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const transaction = await sequelize.transaction();
  
  try {
    const assets = await Asset.findAll({
      where: {
        status: { [Op.ne]: AssetStatus.SCRAPPED }
      },
      transaction
    });

    let updatedCount = 0;
    for (const asset of assets) {
      const monthlyDepreciation = (asset.purchasePrice * (asset.depreciationRate / 100)) / 12;
      const newValue = Math.max(0, asset.currentValue - monthlyDepreciation);
      
      if (Math.abs(newValue - asset.currentValue) > 0.01) {
        await asset.update({ currentValue: newValue }, { transaction });
        updatedCount++;
      }
    }

    await OperationLogService.logInventoryOperation(
      req,
      OperationType.INVENTORY,
      0,
      'DEPRECIATION',
      `月度折旧计算，更新${updatedCount}个资产`,
      'success'
    );

    await transaction.commit();
    successResponse(res, { updatedCount }, `月度折旧计算完成，更新${updatedCount}个资产`);
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};
