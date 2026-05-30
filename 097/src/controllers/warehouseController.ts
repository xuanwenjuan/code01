import { Request, Response, NextFunction } from 'express';
import WarehouseDocument from '../models/WarehouseDocument';
import DocumentItem from '../models/DocumentItem';
import Product from '../models/Product';
import Supplier from '../models/Supplier';
import StockLog, { StockChangeType } from '../models/StockLog';
import { ResponseUtil } from '../utils/response';
import { AuthRequest } from '../middleware/auth';
import { NotFoundException, BadRequestException, ForbiddenException } from '../exceptions/HttpException';
import Joi from 'joi';
import { DocumentStatus, DocumentType, UserRole } from '../types/common';
import { Op, Transaction } from 'sequelize';
import sequelize from '../database/config';
import moment from 'moment';

const generateDocumentNo = async (type: DocumentType): string => {
  const prefixMap: Record<DocumentType, string> = {
    [DocumentType.PURCHASE]: 'PO',
    [DocumentType.TRANSFER_OUT]: 'TO',
    [DocumentType.RETAIL]: 'RT',
    [DocumentType.RETURN]: 'RE',
    [DocumentType.DAMAGE]: 'DA'
  };
  const prefix = prefixMap[type] || 'WH';
  const dateStr = moment().format('YYYYMMDD');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}${dateStr}${random}`;
};

const documentItemSchema = Joi.object({
  productId: Joi.number().required().messages({
    'any.required': '商品不能为空'
  }),
  quantity: Joi.number().integer().positive().required().messages({
    'any.required': '数量不能为空',
    'number.positive': '数量必须大于0',
    'number.integer': '数量必须是整数'
  }),
  unitPrice: Joi.number().precision(2).min(0).default(0).messages({
    'number.min': '单价不能为负数',
    'number.precision': '单价最多保留2位小数'
  }),
  remark: Joi.string().allow('').max(500).messages({
    'string.max': '备注不能超过500个字符'
  })
});

export const createDocumentSchema = Joi.object({
  type: Joi.string().valid(...Object.values(DocumentType)).required().messages({
    'any.required': '单据类型不能为空',
    'any.only': '无效的单据类型'
  }),
  supplierId: Joi.number().when('type', {
    is: DocumentType.PURCHASE,
    then: Joi.required().messages({
      'any.required': '采购单必须选择供应商'
    }),
    otherwise: Joi.optional()
  }),
  supplierName: Joi.string().allow('').max(100).messages({
    'string.max': '供应商名称不能超过100个字符'
  }),
  remark: Joi.string().allow('').max(1000).messages({
    'string.max': '备注不能超过1000个字符'
  }),
  items: Joi.array().items(documentItemSchema).min(1).required().messages({
    'any.required': '单据明细不能为空',
    'array.min': '至少需要一条明细'
  })
});

export const approveDocumentSchema = Joi.object({
  remark: Joi.string().allow('').max(500).messages({
    'string.max': '备注不能超过500个字符'
  })
});

const canApproveDocument = (role: string): boolean => {
  return [UserRole.ADMIN, UserRole.WAREHOUSE_KEEPER].includes(role as UserRole);
};

const canCreateDocument = (role: string, type: DocumentType): boolean => {
  if (role === UserRole.ADMIN) return true;
  if (type === DocumentType.PURCHASE) return role === UserRole.PURCHASER;
  if ([DocumentType.TRANSFER_OUT, DocumentType.DAMAGE].includes(type)) {
    return role === UserRole.WAREHOUSE_KEEPER;
  }
  if (type === DocumentType.RETAIL) {
    return role === UserRole.SALESMAN;
  }
  if (type === DocumentType.RETURN) {
    return role === UserRole.SALESMAN || role === UserRole.WAREHOUSE_KEEPER;
  }
  return false;
};

export const createDocument = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const t: Transaction = await sequelize.transaction();
  
  try {
    const { type, supplierId, supplierName, remark, items } = req.body;

    if (!canCreateDocument(req.user!.role, type)) {
      throw new ForbiddenException('您没有创建该类型单据的权限');
    }

    if (type === DocumentType.PURCHASE) {
      const supplier = await Supplier.findByPk(supplierId);
      if (!supplier) {
        throw new BadRequestException('供应商不存在');
      }
    }

    const documentNo = await generateDocumentNo(type);
    
    let totalAmount = 0;
    const documentItems: any[] = [];

    for (const item of items) {
      const product = await Product.findByPk(item.productId);
      if (!product) {
        throw new BadRequestException(`商品ID ${item.productId} 不存在`);
      }
      if (!product.isActive) {
        throw new BadRequestException(`商品 ${product.name} 已停用`);
      }

      const amount = item.quantity * item.unitPrice;
      totalAmount += amount;

      documentItems.push({
        productId: item.productId,
        productName: product.name,
        productSku: product.sku,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        amount,
        remark: item.remark
      });
    }

    const document = await WarehouseDocument.create({
      documentNo,
      type,
      supplierId,
      supplierName,
      remark,
      totalAmount,
      createdById: req.user!.id,
      createdByName: req.user!.username,
      status: DocumentStatus.PENDING
    }, { transaction: t });

    for (const item of documentItems) {
      item.documentId = document.id;
    }
    await DocumentItem.bulkCreate(documentItems, { transaction: t });

    await t.commit();

    const result = await WarehouseDocument.findByPk(document.id, {
      include: [{ model: DocumentItem }]
    });

    res.status(201).json(ResponseUtil.created(result, '单据创建成功'));
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

export const getDocumentList = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { type, status, keyword, startDate, endDate, page = 1, pageSize = 10 } = req.query;
    
    const where: any = {};
    if (type) where.type = type;
    if (status) where.status = status;
    if (keyword) {
      where[Op.or] = [
        { documentNo: { [Op.like]: `%${keyword}%` } },
        { supplierName: { [Op.like]: `%${keyword}%` } }
      ];
    }
    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate as string), new Date(endDate as string)]
      };
    }

    if (req.user!.role === UserRole.PURCHASER) {
      where.type = { [Op.in]: [DocumentType.PURCHASE, DocumentType.RETURN] };
    } else if (req.user!.role === UserRole.SALESMAN) {
      where.type = { [Op.in]: [DocumentType.RETAIL, DocumentType.RETURN] };
    }

    const { count, rows } = await WarehouseDocument.findAndCountAll({
      where,
      include: [{ model: DocumentItem }],
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize),
      order: [['createdAt', 'DESC']]
    });

    res.json(ResponseUtil.success({
      list: rows,
      total: count,
      page: Number(page),
      pageSize: Number(pageSize)
    }));
  } catch (error) {
    next(error);
  }
};

export const getDocumentById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const document = await WarehouseDocument.findByPk(id, {
      include: [{ model: DocumentItem }]
    });

    if (!document) {
      throw new NotFoundException('单据不存在');
    }

    res.json(ResponseUtil.success(document));
  } catch (error) {
    next(error);
  }
};

export const approveDocument = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const t: Transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { remark } = req.body;

    if (!canApproveDocument(req.user!.role)) {
      throw new ForbiddenException('您没有审核单据的权限');
    }

    const document = await WarehouseDocument.findByPk(id, {
      include: [{ model: DocumentItem }]
    });

    if (!document) {
      throw new NotFoundException('单据不存在');
    }

    if (document.status !== DocumentStatus.PENDING) {
      throw new BadRequestException(`当前单据状态为${document.status === DocumentStatus.REJECTED ? '已驳回' : document.status === DocumentStatus.APPROVED ? '已审核' : '已取消'}，无法重复审核`);
    }

    if (document.isTimeout) {
      throw new BadRequestException('该单据已超时，已被系统自动驳回，请重新创建');
    }

    const now = moment();
    const createdAt = moment(document.createdAt);
    const hoursDiff = now.diff(createdAt, 'hours');

    if (hoursDiff >= 24) {
      await document.update({ status: DocumentStatus.REJECTED, isTimeout: true }, { transaction: t });
      await t.commit();
      throw new BadRequestException('单据创建已超过24小时审核期限，已被系统自动驳回');
    }

    for (const item of document.items) {
      const product = await Product.findByPk(item.productId, { transaction: t });
      if (!product) {
        throw new BadRequestException(`商品 ${item.productName} 不存在`);
      }

      let stockBefore = product.stock;
      let stockAfter: number;
      let changeType: StockChangeType;

      if ([DocumentType.PURCHASE, DocumentType.RETURN].includes(document.type as DocumentType)) {
        stockAfter = stockBefore + item.quantity;
        changeType = StockChangeType.IN;
      } else {
        if (stockBefore < item.quantity) {
          throw new BadRequestException(`商品 ${product.name} 库存不足，当前库存: ${stockBefore}，需要: ${item.quantity}`);
        }
        stockAfter = stockBefore - item.quantity;
        changeType = StockChangeType.OUT;
      }

      await product.update({ stock: stockAfter }, { transaction: t });
      
      await StockLog.create({
        productId: product.id,
        productName: product.name,
        changeType,
        quantity: item.quantity,
        stockBefore,
        stockAfter,
        documentId: document.id,
        documentNo: document.documentNo,
        remark: remark || '单据审核',
        operatorId: req.user!.id,
        operatorName: req.user!.username
      }, { transaction: t });
    }

    await document.update({
      status: DocumentStatus.APPROVED,
      approvedById: req.user!.id,
      approvedByName: req.user!.username,
      approvedAt: new Date()
    }, { transaction: t });

    await t.commit();

    res.json(ResponseUtil.success(null, '单据审核成功'));
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

export const rejectDocument = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { remark } = req.body;

    if (!canApproveDocument(req.user!.role)) {
      throw new ForbiddenException('您没有驳回单据的权限');
    }

    const document = await WarehouseDocument.findByPk(id);

    if (!document) {
      throw new NotFoundException('单据不存在');
    }

    if (document.status !== DocumentStatus.PENDING) {
      throw new BadRequestException('只有待审核单据可以驳回');
    }

    await document.update({
      status: DocumentStatus.REJECTED,
      approvedById: req.user!.id,
      approvedByName: req.user!.username,
      approvedAt: new Date()
    });

    res.json(ResponseUtil.success(null, '单据已驳回'));
  } catch (error) {
    next(error);
  }
};

export const cancelDocument = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const document = await WarehouseDocument.findByPk(id);

    if (!document) {
      throw new NotFoundException('单据不存在');
    }

    if (document.status === DocumentStatus.APPROVED) {
      throw new BadRequestException('已审核单据不能取消，请联系管理员');
    }

    if (document.createdById !== req.user!.id && req.user!.role !== UserRole.ADMIN) {
      throw new ForbiddenException('只能取消自己创建的单据');
    }

    await document.update({
      status: DocumentStatus.CANCELLED
    });

    res.json(ResponseUtil.success(null, '单据已取消'));
  } catch (error) {
    next(error);
  }
};

export const getStockLogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId, changeType, startDate, endDate, page = 1, pageSize = 20 } = req.query;
    
    const where: any = {};
    if (productId) where.productId = productId;
    if (changeType) where.changeType = changeType;
    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate as string), new Date(endDate as string)]
      };
    }

    const { count, rows } = await StockLog.findAndCountAll({
      where,
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize),
      order: [['createdAt', 'DESC']]
    });

    res.json(ResponseUtil.success({
      list: rows,
      total: count,
      page: Number(page),
      pageSize: Number(pageSize)
    }));
  } catch (error) {
    next(error);
  }
};

export const getDocumentStatistics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate as string) : moment().startOf('month').toDate();
    const end = endDate ? new Date(endDate as string) : moment().endOf('month').toDate();

    const statistics = await WarehouseDocument.findAll({
      where: {
        status: DocumentStatus.APPROVED,
        createdAt: { [Op.between]: [start, end] }
      },
      attributes: [
        'type',
        [fn('COUNT', col('id')), 'count'],
        [fn('SUM', col('totalAmount')), 'totalAmount']
      ],
      group: ['type'],
      raw: true
    });

    res.json(ResponseUtil.success(statistics));
  } catch (error) {
    next(error);
  }
};
