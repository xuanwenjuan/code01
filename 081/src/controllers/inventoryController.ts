import { Request, Response, NextFunction } from 'express';
import { body, query } from 'express-validator';
import { Op, Transaction } from 'sequelize';
import sequelize from '../config/database';
import {
  Inventory,
  InventoryLog,
  InventoryCheck,
  InventoryCheckItem,
  ConsumptionRecord,
  Material,
  Store,
  User
} from '../models';
import { ResponseUtil } from '../utils/response';
import { BadRequestException, NotFoundException, ForbiddenException } from '../exceptions/HttpException';
import { InventoryOperationType, UserRole } from '../types';

export const getInventoryListValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('页码必须大于0'),
  query('pageSize').optional().isInt({ min: 1, max: 100 }).withMessage('每页条数必须在1-100之间'),
  query('storeId').optional().isInt().withMessage('门店ID必须是数字'),
  query('lowStock').optional().isBoolean().withMessage('低库存筛选参数无效')
];

export const recordConsumptionValidation = [
  body('storeId').optional().isInt({ min: 1 }).withMessage('门店ID必须大于0'),
  body('consumptionDate').isISO8601().withMessage('请输入有效的消耗日期'),
  body('items').isArray({ min: 1 }).withMessage('消耗明细不能为空'),
  body('items.*.materialId').isInt({ min: 1 }).withMessage('原料ID必须大于0'),
  body('items.*.quantity').isFloat({ gt: 0 }).withMessage('消耗数量必须大于0'),
  body('remark').optional().isString().withMessage('备注必须是字符串')
];

export const createInventoryCheckValidation = [
  body('storeId').optional().isInt({ min: 1 }).withMessage('门店ID必须大于0'),
  body('items').isArray({ min: 1 }).withMessage('盘点明细不能为空'),
  body('items.*.materialId').isInt({ min: 1 }).withMessage('原料ID必须大于0'),
  body('items.*.actualQuantity').isFloat({ min: 0 }).withMessage('实际库存数量不能为负'),
  body('items.*.remark').optional().isString().withMessage('备注必须是字符串'),
  body('remark').optional().isString().withMessage('备注必须是字符串')
];

export const getInventoryList = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page = 1, pageSize = 10, storeId, categoryId, keyword, lowStock } = req.query;

    const where: any = {};
    if (storeId) {
      where.storeId = storeId;
    }
    if (req.user!.role === UserRole.STORE) {
      where.storeId = req.user!.storeId;
    }

    const materialWhere: any = {};
    if (keyword) {
      materialWhere[Op.or] = [
        { materialName: { [Op.like]: `%${keyword}%` } },
        { materialCode: { [Op.like]: `%${keyword}%` } }
      ];
    }

    const { count, rows } = await Inventory.findAndCountAll({
      where,
      include: [
        {
          model: Material,
          where: materialWhere,
          include: [{ association: 'category', attributes: ['id', 'categoryName'] }]
        },
        { model: Store, attributes: ['id', 'storeName', 'storeCode'] }
      ],
      order: [['id', 'DESC']],
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize)
    });

    let list = rows;
    if (lowStock === 'true') {
      list = rows.filter((item: any) =>
        item.quantity <= (item.Material?.warningStock || 10)
      );
    }

    ResponseUtil.paginated(res, {
      list,
      total: lowStock === 'true' ? list.length : count,
      page: Number(page),
      pageSize: Number(pageSize),
      totalPages: Math.ceil((lowStock === 'true' ? list.length : count) / Number(pageSize))
    });
  } catch (error) {
    next(error);
  }
};

export const getInventoryLogList = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page = 1, pageSize = 10, storeId, materialId, operationType, startDate, endDate } = req.query;

    const where: any = {};
    if (storeId) {
      where.storeId = storeId;
    }
    if (materialId) {
      where.materialId = materialId;
    }
    if (operationType) {
      where.operationType = operationType;
    }
    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate as string), new Date(endDate as string)]
      };
    }
    if (req.user!.role === UserRole.STORE) {
      where.storeId = req.user!.storeId;
    }

    const { count, rows } = await InventoryLog.findAndCountAll({
      where,
      include: [
        { model: Material, attributes: ['id', 'materialName', 'materialCode', 'unit'] },
        { model: Store, attributes: ['id', 'storeName'] },
        { model: User, attributes: ['id', 'username', 'realName'] }
      ],
      order: [['id', 'DESC']],
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize)
    });

    ResponseUtil.paginated(res, {
      list: rows,
      total: count,
      page: Number(page),
      pageSize: Number(pageSize),
      totalPages: Math.ceil(count / Number(pageSize))
    });
  } catch (error) {
    next(error);
  }
};

export const recordConsumption = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { items, consumptionDate, remark } = req.body;
    const userId = req.user!.userId;
    const storeId = req.user!.role === UserRole.STORE ? req.user!.storeId : req.body.storeId;

    if (!storeId) {
      throw new BadRequestException('请选择门店');
    }

    const store = await Store.findByPk(storeId);
    if (!store || !store.isActive) {
      throw new BadRequestException('门店不存在或已禁用');
    }

    const materialIds = items.map((item: any) => item.materialId);
    const materials = await Material.findAll({ where: { id: { [Op.in]: materialIds } } });
    if (materials.length !== materialIds.length) {
      throw new BadRequestException('存在无效的原料ID');
    }

    await sequelize.transaction(async (t: Transaction) => {
      for (const item of items) {
        let inventory = await Inventory.findOne({
          where: { storeId, materialId: item.materialId },
          transaction: t
        });

        if (!inventory || inventory.quantity < item.quantity) {
          const material = materials.find((m: any) => m.id === item.materialId);
          throw new BadRequestException(
            `原料「${material?.materialName}」库存不足，当前库存：${inventory?.quantity || 0}，申请消耗：${item.quantity}`
          );
        }

        const beforeQuantity = inventory.quantity;
        const afterQuantity = beforeQuantity - item.quantity;

        await inventory.update(
          {
            quantity: afterQuantity,
            availableQuantity: afterQuantity - inventory.lockedQuantity,
            lastOutDate: new Date()
          },
          { transaction: t }
        );

        await InventoryLog.create(
          {
            storeId,
            materialId: item.materialId,
            operationType: InventoryOperationType.CONSUME,
            beforeQuantity,
            changeQuantity: -item.quantity,
            afterQuantity,
            operatorId: userId,
            remark: remark || '原料消耗'
          },
          { transaction: t }
        );

        await ConsumptionRecord.create(
          {
            storeId,
            materialId: item.materialId,
            consumptionDate: consumptionDate || new Date(),
            quantity: item.quantity,
            operatorId: userId,
            remark
          },
          { transaction: t }
        );
      }
    });

    ResponseUtil.success(res, null, '原料消耗记录成功');
  } catch (error) {
    next(error);
  }
};

export const createInventoryCheck = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { storeId, items, remark } = req.body;
    const userId = req.user!.userId;
    const actualStoreId = req.user!.role === UserRole.STORE ? req.user!.storeId : storeId;

    if (!actualStoreId) {
      throw new BadRequestException('请选择门店');
    }

    const store = await Store.findByPk(actualStoreId);
    if (!store || !store.isActive) {
      throw new BadRequestException('门店不存在或已禁用');
    }

    const materialIds = items.map((item: any) => item.materialId);
    const materials = await Material.findAll({ where: { id: { [Op.in]: materialIds } } });
    if (materials.length !== materialIds.length) {
      throw new BadRequestException('存在无效的原料ID');
    }

    const checkNo = `IC${Date.now()}${Math.floor(Math.random() * 1000)}`;

    await sequelize.transaction(async (t: Transaction) => {
      let totalProfitCount = 0;
      let totalLossCount = 0;
      let totalProfitAmount = 0;
      let totalLossAmount = 0;

      const checkItems: any[] = [];

      for (const item of items) {
        const inventory = await Inventory.findOne({
          where: { storeId: actualStoreId, materialId: item.materialId },
          transaction: t
        });

        const systemQuantity = inventory ? inventory.quantity : 0;
        const differenceQuantity = item.actualQuantity - systemQuantity;

        if (differenceQuantity > 0) {
          totalProfitCount++;
        } else if (differenceQuantity < 0) {
          totalLossCount++;
        }

        checkItems.push({
          materialId: item.materialId,
          systemQuantity,
          actualQuantity: item.actualQuantity,
          differenceQuantity,
          unitCost: inventory?.averageCost || 0,
          differenceAmount: differenceQuantity * (inventory?.averageCost || 0),
          remark: item.remark
        });
      }

      const inventoryCheck = await InventoryCheck.create(
        {
          checkNo,
          storeId: actualStoreId,
          createdBy: userId,
          isConfirmed: false,
          totalProfitCount,
          totalLossCount,
          totalProfitAmount,
          totalLossAmount,
          remark
        },
        { transaction: t }
      );

      for (const checkItem of checkItems) {
        checkItem.inventoryCheckId = inventoryCheck.id;
      }

      await InventoryCheckItem.bulkCreate(checkItems, { transaction: t });
    });

    ResponseUtil.success(res, { checkNo }, '盘点单创建成功');
  } catch (error) {
    next(error);
  }
};

export const confirmInventoryCheck = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const inventoryCheck = await InventoryCheck.findByPk(id, {
      include: [{ model: InventoryCheckItem, as: 'items' }]
    });

    if (!inventoryCheck) {
      throw new NotFoundException('盘点单不存在');
    }

    if (inventoryCheck.isConfirmed) {
      throw new BadRequestException('该盘点单已确认，不能重复确认');
    }

    if (req.user!.role === UserRole.STORE && req.user!.storeId !== inventoryCheck.storeId) {
      throw new ForbiddenException('只能确认本门店的盘点单');
    }

    await sequelize.transaction(async (t: Transaction) => {
      for (const item of (inventoryCheck as any).items) {
        if (item.differenceQuantity !== 0) {
          let inventory = await Inventory.findOne({
            where: { storeId: inventoryCheck.storeId, materialId: item.materialId },
            transaction: t
          });

          const operationType = item.differenceQuantity > 0
            ? InventoryOperationType.CHECK_IN
            : InventoryOperationType.CHECK_OUT;

          const beforeQuantity = inventory ? inventory.quantity : 0;
          const afterQuantity = item.actualQuantity;

          if (inventory) {
            await inventory.update(
              {
                quantity: afterQuantity,
                availableQuantity: afterQuantity - inventory.lockedQuantity
              },
              { transaction: t }
            );
          } else {
            inventory = await Inventory.create(
              {
                storeId: inventoryCheck.storeId,
                materialId: item.materialId,
                quantity: afterQuantity,
                lockedQuantity: 0,
                availableQuantity: afterQuantity
              },
              { transaction: t }
            );
          }

          await InventoryLog.create(
            {
              storeId: inventoryCheck.storeId,
              materialId: item.materialId,
              operationType,
              beforeQuantity,
              changeQuantity: item.differenceQuantity,
              afterQuantity,
              operatorId: userId,
              relatedOrderNo: inventoryCheck.checkNo,
              remark: `盘点调整，盘点单号：${inventoryCheck.checkNo}`
            },
            { transaction: t }
          );
        }
      }

      await inventoryCheck.update(
        {
          isConfirmed: true,
          confirmedBy: userId,
          confirmedAt: new Date()
        },
        { transaction: t }
      );
    });

    ResponseUtil.success(res, null, '盘点单确认成功');
  } catch (error) {
    next(error);
  }
};

export const getInventoryCheckList = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page = 1, pageSize = 10, storeId, isConfirmed, startDate, endDate } = req.query;

    const where: any = {};
    if (storeId) {
      where.storeId = storeId;
    }
    if (isConfirmed !== undefined) {
      where.isConfirmed = isConfirmed === 'true';
    }
    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate as string), new Date(endDate as string)]
      };
    }
    if (req.user!.role === UserRole.STORE) {
      where.storeId = req.user!.storeId;
    }

    const { count, rows } = await InventoryCheck.findAndCountAll({
      where,
      include: [
        { model: Store, attributes: ['id', 'storeName', 'storeCode'] },
        { model: User, as: 'creator', attributes: ['id', 'username', 'realName'] },
        { model: User, as: 'confirmer', attributes: ['id', 'username', 'realName'] }
      ],
      order: [['id', 'DESC']],
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize)
    });

    ResponseUtil.paginated(res, {
      list: rows,
      total: count,
      page: Number(page),
      pageSize: Number(pageSize),
      totalPages: Math.ceil(count / Number(pageSize))
    });
  } catch (error) {
    next(error);
  }
};

export const getInventoryCheckDetail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const inventoryCheck = await InventoryCheck.findByPk(id, {
      include: [
        { model: Store, attributes: ['id', 'storeName', 'storeCode'] },
        { model: User, as: 'creator', attributes: ['id', 'username', 'realName'] },
        { model: User, as: 'confirmer', attributes: ['id', 'username', 'realName'] },
        {
          model: InventoryCheckItem,
          as: 'items',
          include: [{ model: Material, attributes: ['id', 'materialName', 'materialCode', 'unit'] }]
        }
      ]
    });

    if (!inventoryCheck) {
      throw new NotFoundException('盘点单不存在');
    }

    ResponseUtil.success(res, inventoryCheck);
  } catch (error) {
    next(error);
  }
};

export const getConsumptionStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { storeId, startDate, endDate, groupBy = 'day' } = req.query;

    const where: any = {};
    if (storeId) {
      where.storeId = storeId;
    }
    if (startDate && endDate) {
      where.consumptionDate = {
        [Op.between]: [new Date(startDate as string), new Date(endDate as string)]
      };
    }
    if (req.user!.role === UserRole.STORE) {
      where.storeId = req.user!.storeId;
    }

    const records = await ConsumptionRecord.findAll({
      where,
      include: [
        { model: Material, attributes: ['id', 'materialName', 'materialCode', 'unit'] },
        { model: Store, attributes: ['id', 'storeName'] },
        { model: User, attributes: ['id', 'username', 'realName'] }
      ],
      order: [['consumptionDate', 'DESC']]
    });

    ResponseUtil.success(res, {
      list: records,
      total: records.length
    });
  } catch (error) {
    next(error);
  }
};
