import { Request, Response } from 'express';
import { Op, Transaction, literal } from 'sequelize';
import { Stock, Reagent, StockFlow, sequelize, ReagentCategory } from '../models';
import { ResponseUtil } from '../utils/response';
import { NotFoundException, BadRequestException, ForbiddenException } from '../exceptions/HttpException';
import { OperationLogger } from '../utils/operationLogger';
import { StockStatus, UserRole } from '../types';

export class StockController {
  private static validateDates(productionDate?: Date, expiryDate?: Date): void {
    if (productionDate && expiryDate) {
      if (new Date(expiryDate) < new Date(productionDate)) {
        throw new BadRequestException('有效期不能早于生产日期');
      }
    }
  }

  static async createInbound(req: Request, res: Response) {
    const {
      reagentId, batchNo, quantity, unitPrice,
      productionDate, expiryDate, location, remarks
    } = req.body;

    this.validateDates(productionDate, expiryDate);

    const reagent = await Reagent.findByPk(reagentId);
    if (!reagent) {
      throw new NotFoundException('试剂不存在');
    }

    const existingBatch = await Stock.findOne({ where: { reagentId, batchNo } });
    if (existingBatch) {
      throw new BadRequestException('该批次号已存在，请使用不同的批次号');
    }

    const warnings: string[] = [];
    const now = new Date();
    if (expiryDate) {
      const expiry = new Date(expiryDate);
      const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
      
      if (daysUntilExpiry <= 0) {
        throw new BadRequestException('该批次试剂已过期，不能入库');
      } else if (daysUntilExpiry <= 7) {
        warnings.push(`该批次试剂将在 ${daysUntilExpiry} 天后过期，请谨慎使用`);
      } else if (daysUntilExpiry <= 30) {
        warnings.push(`该批次试剂将在 ${daysUntilExpiry} 天后过期，请尽快使用`);
      }
    }

    const result = await sequelize.transaction(async (t: Transaction) => {
      const stock = await Stock.create({
        reagentId,
        batchNo,
        quantity,
        availableQuantity: quantity,
        unitPrice,
        productionDate,
        expiryDate,
        location,
        status: StockStatus.PENDING,
        inspectorId: null,
        inboundBy: req.user?.userId || 0,
        inboundAt: new Date(),
        remarks
      }, { transaction: t });

      await StockFlow.create({
        stockId: stock.id,
        reagentId,
        flowType: 'inbound',
        quantity,
        beforeQuantity: 0,
        afterQuantity: quantity,
        operatorId: req.user?.userId || 0,
        relatedType: 'inbound',
        relatedId: stock.id,
        remarks: `入库: ${reagent.name} - 批次 ${batchNo}`
      }, { transaction: t });

      return stock;
    });

    await OperationLogger.inbound(req, 'stock', result.id, `入库: ${reagent.name} - 批次 ${batchNo}`, result.toJSON());

    const responseData = {
      ...result.toJSON(),
      warnings: warnings.length > 0 ? warnings : undefined
    };

    return ResponseUtil.success(res, responseData, warnings.length > 0 ? `入库成功，${warnings.join('；')}` : '入库成功，请等待质检');
  }

  static async inspect(req: Request, res: Response) {
    const { id } = req.params;
    const { passed, inspectionRemark, actualQuantity } = req.body;

    if (req.user?.role !== UserRole.ADMIN && req.user?.role !== UserRole.WAREHOUSE) {
      throw new ForbiddenException('只有管理员和仓库管理员可以执行质检');
    }

    const stock = await Stock.findByPk(id);
    if (!stock) {
      throw new NotFoundException('库存记录不存在');
    }

    if (stock.status !== StockStatus.PENDING) {
      throw new BadRequestException('该库存已完成质检，无法重复质检');
    }

    const finalQuantity = actualQuantity !== undefined ? actualQuantity : stock.quantity;

    if (finalQuantity <= 0) {
      throw new BadRequestException('实际入库数量必须大于0');
    }

    const beforeData = stock.toJSON();

    await sequelize.transaction(async (t: Transaction) => {
      await stock.update({
        status: passed ? StockStatus.QUALIFIED : StockStatus.UNQUALIFIED,
        quantity: finalQuantity,
        availableQuantity: passed ? finalQuantity : 0,
        inspectorId: req.user?.userId || 0,
        inspectionRemark
      }, { transaction: t });

      if (passed && actualQuantity !== undefined && actualQuantity !== stock.quantity) {
        await StockFlow.create({
          stockId: stock.id,
          reagentId: stock.reagentId,
          flowType: 'adjust',
          quantity: actualQuantity - stock.quantity,
          beforeQuantity: stock.quantity,
          afterQuantity: actualQuantity,
          operatorId: req.user?.userId || 0,
          remarks: `质检调整: 批次 ${stock.batchNo}`
        }, { transaction: t });
      }
    });

    await OperationLogger.update(
      req,
      'stock',
      stock.id,
      `质检${passed ? '通过' : '不通过'}: 批次 ${stock.batchNo}`,
      beforeData,
      stock.toJSON()
    );

    return ResponseUtil.success(res, stock, '质检完成');
  }

  static async adjustStock(req: Request, res: Response) {
    const { id } = req.params;
    const { quantity, reason } = req.body;

    if (req.user?.role !== UserRole.ADMIN && req.user?.role !== UserRole.WAREHOUSE) {
      throw new ForbiddenException('只有管理员和仓库管理员可以调整库存');
    }

    const stock = await Stock.findByPk(id);
    if (!stock) {
      throw new NotFoundException('库存记录不存在');
    }

    if (stock.status !== StockStatus.QUALIFIED) {
      throw new BadRequestException('只有质检合格的库存可以调整');
    }

    const newQuantity = stock.availableQuantity + quantity;
    if (newQuantity < 0) {
      throw new BadRequestException('调整后库存不能为负数');
    }

    const beforeData = stock.toJSON();

    await sequelize.transaction(async (t: Transaction) => {
      await stock.update({
        availableQuantity: newQuantity,
        quantity: newQuantity
      }, { transaction: t });

      await StockFlow.create({
        stockId: stock.id,
        reagentId: stock.reagentId,
        flowType: 'adjust',
        quantity,
        beforeQuantity: stock.availableQuantity,
        afterQuantity: newQuantity,
        operatorId: req.user?.userId || 0,
        remarks: `库存调整: ${reason || '手动调整'} - 批次 ${stock.batchNo}`
      }, { transaction: t });
    });

    await OperationLogger.update(
      req,
      'stock',
      stock.id,
      `库存调整: 批次 ${stock.batchNo}`,
      beforeData,
      stock.toJSON()
    );

    return ResponseUtil.success(res, stock, '库存调整成功');
  }

  static async getById(req: Request, res: Response) {
    const { id } = req.params;

    const stock = await Stock.findByPk(id, {
      include: [
        { model: Reagent, as: 'reagent', include: [{ model: ReagentCategory, as: 'category' }] }
      ]
    });

    if (!stock) {
      throw new NotFoundException('库存记录不存在');
    }

    return ResponseUtil.success(res, stock, '查询成功');
  }

  static async getList(req: Request, res: Response) {
    const { keyword, reagentId, status, batchNo, page = 1, pageSize = 10 } = req.query;

    const where: any = {};
    if (keyword) {
      const reagents = await Reagent.findAll({
        where: { name: { [Op.like]: `%${keyword}%` } },
        attributes: ['id']
      });
      const reagentIds = reagents.map(r => r.id);
      if (reagentIds.length > 0) {
        where.reagentId = { [Op.in]: reagentIds };
      } else {
        where.batchNo = { [Op.like]: `%${keyword}%` };
      }
    }
    if (reagentId) where.reagentId = reagentId;
    if (status) where.status = status;
    if (batchNo) where.batchNo = { [Op.like]: `%${batchNo}%` };

    const { count, rows } = await Stock.findAndCountAll({
      where,
      include: [
        { model: Reagent, as: 'reagent', include: [{ model: ReagentCategory, as: 'category' }] }
      ],
      order: [['createdAt', 'DESC']],
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize)
    });

    return ResponseUtil.success(res, {
      list: rows,
      total: count,
      page: Number(page),
      pageSize: Number(pageSize)
    }, '查询成功');
  }

  static async getStockFlows(req: Request, res: Response) {
    const { stockId, reagentId, flowType, startDate, endDate, page = 1, pageSize = 10 } = req.query;

    const where: any = {};
    if (stockId) where.stockId = stockId;
    if (reagentId) where.reagentId = reagentId;
    if (flowType) where.flowType = flowType;
    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate as string), new Date(endDate as string)]
      };
    }

    const { count, rows } = await StockFlow.findAndCountAll({
      where,
      include: [
        { model: Reagent, as: 'reagent' }
      ],
      order: [['createdAt', 'DESC']],
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize)
    });

    return ResponseUtil.success(res, {
      list: rows,
      total: count,
      page: Number(page),
      pageSize: Number(pageSize)
    }, '查询成功');
  }

  static async getExpiringSoon(req: Request, res: Response) {
    const days = Number(req.query.days) || 30;
    const now = new Date();
    const expiryDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    const stocks = await Stock.findAll({
      where: {
        expiryDate: {
          [Op.between]: [now, expiryDate]
        },
        status: StockStatus.QUALIFIED,
        availableQuantity: { [Op.gt]: 0 }
      },
      attributes: {
        include: [
          [literal(`DATEDIFF(expiryDate, NOW())`), 'daysUntilExpiry']
        ]
      },
      include: [
        { model: Reagent, as: 'reagent' }
      ],
      order: [['expiryDate', 'ASC']]
    });

    return ResponseUtil.success(res, stocks, '查询成功');
  }

  static async getLowStock(req: Request, res: Response) {
    const threshold = Number(req.query.threshold) || 10;

    const stocks = await Stock.findAll({
      where: {
        availableQuantity: { [Op.lte]: threshold, [Op.gt]: 0 },
        status: StockStatus.QUALIFIED
      },
      include: [
        { model: Reagent, as: 'reagent' }
      ],
      order: [['availableQuantity', 'ASC']]
    });

    return ResponseUtil.success(res, stocks, '查询成功');
  }

  static async getReagentStockSummary(req: Request, res: Response) {
    const { reagentId } = req.params;

    const stocks = await Stock.findAll({
      where: {
        reagentId,
        status: StockStatus.QUALIFIED,
        availableQuantity: { [Op.gt]: 0 }
      },
      order: [['expiryDate', 'ASC']]
    });

    const totalQuantity = stocks.reduce((sum, s) => sum + Number(s.availableQuantity), 0);
    const totalValue = stocks.reduce((sum, s) => sum + Number(s.availableQuantity) * Number(s.unitPrice), 0);

    return ResponseUtil.success(res, {
      batches: stocks,
      totalQuantity,
      totalValue
    }, '查询成功');
  }

  static async getStatistics(req: Request, res: Response) {
    const [statusStats, lowStockCount, expiringCount, totalValue] = await Promise.all([
      Stock.findAll({
        attributes: ['status', [literal('SUM(availableQuantity)'), 'quantity'], [literal('COUNT(*)'), 'count']],
        group: ['status']
      }),
      Stock.count({
        where: {
          availableQuantity: { [Op.lte]: 10, [Op.gt]: 0 },
          status: StockStatus.QUALIFIED
        }
      }),
      Stock.count({
        where: {
          expiryDate: {
            [Op.between]: [new Date(), new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)]
          },
          status: StockStatus.QUALIFIED,
          availableQuantity: { [Op.gt]: 0 }
        }
      }),
      Stock.findOne({
        attributes: [[literal('SUM(availableQuantity * unitPrice)'), 'totalValue']],
        where: { status: StockStatus.QUALIFIED }
      })
    ]);

    return ResponseUtil.success(res, {
      byStatus: statusStats,
      lowStockCount,
      expiringIn30Days: expiringCount,
      totalValue: totalValue?.getDataValue('totalValue') || 0
    }, '查询成功');
  }
}
