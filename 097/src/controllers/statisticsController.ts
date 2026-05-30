import { Request, Response, NextFunction } from 'express';
import { Op, fn, col, literal } from 'sequelize';
import Product from '../models/Product';
import WarehouseDocument from '../models/WarehouseDocument';
import DocumentItem from '../models/DocumentItem';
import Category from '../models/Category';
import Supplier from '../models/Supplier';
import { ResponseUtil } from '../utils/response';
import { AuthRequest } from '../middleware/auth';
import { DocumentType, DocumentStatus, UserRole } from '../types/common';
import moment from 'moment';

export const getInventoryStatistics = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const totalProducts = await Product.count({ where: { isActive: true } });
    const totalStock = await Product.sum('stock', { where: { isActive: true } }) as number;
    const totalStockValue = await Product.sum(
      literal('stock * cost_price'),
      { where: { isActive: true } }
    ) as number;
    const outOfStock = await Product.count({ where: { isActive: true, stock: 0 } });

    const lowStock = await Product.count({
      where: {
        isActive: true,
        stock: { [Op.gt]: 0, [Op.lte]: 10 }
      }
    });

    const totalSellingValue = await Product.sum(
      literal('stock * selling_price'),
      { where: { isActive: true } }
    ) as number;

    const grossProfit = totalSellingValue - totalStockValue;

    res.json(ResponseUtil.success({
      totalProducts,
      totalStock: totalStock || 0,
      totalStockValue: Number((totalStockValue || 0).toFixed(2)),
      totalSellingValue: Number((totalSellingValue || 0).toFixed(2)),
      grossProfit: Number(grossProfit.toFixed(2)),
      profitMargin: totalStockValue > 0 ? Number(((grossProfit / totalStockValue) * 100).toFixed(2)) : 0,
      outOfStock,
      lowStock,
      outOfStockRate: totalProducts > 0 ? Number(((outOfStock / totalProducts) * 100).toFixed(2)) : 0
    }));
  } catch (error) {
    next(error);
  }
};

export const getStockByCategory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const categories = await Category.findAll({
      where: { isActive: true },
      attributes: ['id', 'name'],
      order: [['sort', 'ASC']]
    });

    const result = await Promise.all(
      categories.map(async (category) => {
        const products = await Product.findAll({
          where: { categoryId: category.id, isActive: true }
        });
        
        const productCount = products.length;
        const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
        const totalValue = products.reduce((sum, p) => sum + (p.stock * p.costPrice), 0);
        const totalSellingValue = products.reduce((sum, p) => sum + (p.stock * p.sellingPrice), 0);

        return {
          categoryId: category.id,
          categoryName: category.name,
          productCount,
          totalStock,
          totalValue: Number(totalValue.toFixed(2)),
          totalSellingValue: Number(totalSellingValue.toFixed(2)),
          grossProfit: Number((totalSellingValue - totalValue).toFixed(2))
        };
      })
    );

    res.json(ResponseUtil.success(result));
  } catch (error) {
    next(error);
  }
};

export const getInOutStatistics = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate as string) : moment().startOf('month').toDate();
    const end = endDate ? new Date(endDate as string) : moment().endOf('month').toDate();

    const approvedDocs = await WarehouseDocument.findAll({
      where: {
        status: DocumentStatus.APPROVED,
        createdAt: { [Op.between]: [start, end] }
      },
      include: [{ model: DocumentItem }]
    });

    let purchaseAmount = 0;
    let purchaseQuantity = 0;
    let outAmount = 0;
    let outQuantity = 0;
    let retailCount = 0;
    let transferCount = 0;
    let returnCount = 0;
    let damageCount = 0;

    for (const doc of approvedDocs) {
      const totalQty = doc.items.reduce((sum: number, item: any) => sum + item.quantity, 0);
      
      if (doc.type === DocumentType.PURCHASE) {
        purchaseAmount += doc.totalAmount;
        purchaseQuantity += totalQty;
      } else if (doc.type === DocumentType.RETURN) {
        returnCount++;
        purchaseAmount += doc.totalAmount;
        purchaseQuantity += totalQty;
      } else if (doc.type === DocumentType.RETAIL) {
        retailCount++;
        outAmount += doc.totalAmount;
        outQuantity += totalQty;
      } else if (doc.type === DocumentType.TRANSFER_OUT) {
        transferCount++;
        outAmount += doc.totalAmount;
        outQuantity += totalQty;
      } else if (doc.type === DocumentType.DAMAGE) {
        damageCount++;
        outAmount += doc.totalAmount;
        outQuantity += totalQty;
      }
    }

    res.json(ResponseUtil.success({
      purchaseAmount: Number(purchaseAmount.toFixed(2)),
      purchaseQuantity,
      outAmount: Number(outAmount.toFixed(2)),
      outQuantity,
      retailCount,
      transferCount,
      returnCount,
      damageCount,
      grossProfit: Number((outAmount - purchaseAmount).toFixed(2))
    }));
  } catch (error) {
    next(error);
  }
};

export const getSupplierStatistics = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate, top = 10 } = req.query;
    const start = startDate ? new Date(startDate as string) : moment().startOf('year').toDate();
    const end = endDate ? new Date(endDate as string) : moment().endOf('year').toDate();

    const supplierStats = await WarehouseDocument.findAll({
      where: {
        type: DocumentType.PURCHASE,
        status: DocumentStatus.APPROVED,
        createdAt: { [Op.between]: [start, end] }
      },
      attributes: [
        'supplierId',
        'supplierName',
        [fn('COUNT', col('id')), 'orderCount'],
        [fn('SUM', col('totalAmount')), 'totalAmount']
      ],
      group: ['supplierId', 'supplierName'],
      order: [[literal('totalAmount'), 'DESC']],
      limit: Number(top),
      raw: true
    });

    res.json(ResponseUtil.success(supplierStats));
  } catch (error) {
    next(error);
  }
};

export const getMonthlyTrend = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { months = 6 } = req.query;
    const monthCount = Number(months);
    const result = [];

    for (let i = monthCount - 1; i >= 0; i--) {
      const month = moment().subtract(i, 'months');
      const start = month.startOf('month').toDate();
      const end = month.endOf('month').toDate();

      const purchaseDocs = await WarehouseDocument.findAll({
        where: {
          type: { [Op.in]: [DocumentType.PURCHASE, DocumentType.RETURN] },
          status: DocumentStatus.APPROVED,
          createdAt: { [Op.between]: [start, end] }
        },
        include: [{ model: DocumentItem }]
      });

      const outDocs = await WarehouseDocument.findAll({
        where: {
          type: { [Op.in]: [DocumentType.RETAIL, DocumentType.TRANSFER_OUT, DocumentType.DAMAGE] },
          status: DocumentStatus.APPROVED,
          createdAt: { [Op.between]: [start, end] }
        },
        include: [{ model: DocumentItem }]
      });

      const purchaseAmount = purchaseDocs.reduce((sum: number, doc: any) => sum + doc.totalAmount, 0);
      const purchaseQuantity = purchaseDocs.reduce(
        (sum: number, doc: any) => sum + doc.items.reduce((s: number, item: any) => s + item.quantity, 0),
        0
      );
      const outAmount = outDocs.reduce((sum: number, doc: any) => sum + doc.totalAmount, 0);
      const outQuantity = outDocs.reduce(
        (sum: number, doc: any) => sum + doc.items.reduce((s: number, item: any) => s + item.quantity, 0),
        0
      );

      result.push({
        month: month.format('YYYY-MM'),
        monthName: month.format('YYYY年MM月'),
        purchaseAmount: Number(purchaseAmount.toFixed(2)),
        purchaseQuantity,
        outAmount: Number(outAmount.toFixed(2)),
        outQuantity,
        grossProfit: Number((outAmount - purchaseAmount).toFixed(2))
      });
    }

    res.json(ResponseUtil.success(result));
  } catch (error) {
    next(error);
  }
};

export const getDashboardData = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const today = moment();
    const startOfMonth = today.clone().startOf('month').toDate();
    const endOfMonth = today.clone().endOf('month').toDate();
    const startOfDay = today.clone().startOf('day').toDate();
    const endOfDay = today.clone().endOf('day').toDate();

    const todayDocs = await WarehouseDocument.findAll({
      where: {
        status: DocumentStatus.APPROVED,
        createdAt: { [Op.between]: [startOfDay, endOfDay] }
      },
      include: [{ model: DocumentItem }]
    });

    let todayPurchaseAmount = 0;
    let todayOutAmount = 0;
    let todayPurchaseCount = 0;
    let todayOutCount = 0;

    for (const doc of todayDocs) {
      if ([DocumentType.PURCHASE, DocumentType.RETURN].includes(doc.type as DocumentType)) {
        todayPurchaseAmount += doc.totalAmount;
        todayPurchaseCount++;
      } else {
        todayOutAmount += doc.totalAmount;
        todayOutCount++;
      }
    }

    const monthDocs = await WarehouseDocument.findAll({
      where: {
        status: DocumentStatus.APPROVED,
        createdAt: { [Op.between]: [startOfMonth, endOfMonth] }
      }
    });

    let monthPurchaseAmount = 0;
    let monthOutAmount = 0;

    for (const doc of monthDocs) {
      if ([DocumentType.PURCHASE, DocumentType.RETURN].includes(doc.type as DocumentType)) {
        monthPurchaseAmount += doc.totalAmount;
      } else {
        monthOutAmount += doc.totalAmount;
      }
    }

    const pendingCount = await WarehouseDocument.count({
      where: { status: DocumentStatus.PENDING }
    });

    const totalProducts = await Product.count({ where: { isActive: true } });
    const outOfStock = await Product.count({ where: { isActive: true, stock: 0 } });

    res.json(ResponseUtil.success({
      today: {
        purchaseAmount: Number(todayPurchaseAmount.toFixed(2)),
        outAmount: Number(todayOutAmount.toFixed(2)),
        purchaseCount: todayPurchaseCount,
        outCount: todayOutCount
      },
      thisMonth: {
        purchaseAmount: Number(monthPurchaseAmount.toFixed(2)),
        outAmount: Number(monthOutAmount.toFixed(2)),
        grossProfit: Number((monthOutAmount - monthPurchaseAmount).toFixed(2))
      },
      pending: {
        count: pendingCount
      },
      inventory: {
        totalProducts,
        outOfStock
      }
    }));
  } catch (error) {
    next(error);
  }
};

export const getTopSellingProducts = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate, top = 10 } = req.query;
    const start = startDate ? new Date(startDate as string) : moment().startOf('month').toDate();
    const end = endDate ? new Date(endDate as string) : moment().endOf('month').toDate();

    const topProducts = await DocumentItem.findAll({
      attributes: [
        'productId',
        'productName',
        'productSku',
        [fn('SUM', col('quantity')), 'totalQuantity'],
        [fn('SUM', col('amount')), 'totalAmount']
      ],
      include: [{
        model: WarehouseDocument,
        where: {
          status: DocumentStatus.APPROVED,
          type: { [Op.in]: [DocumentType.RETAIL, DocumentType.TRANSFER_OUT] },
          createdAt: { [Op.between]: [start, end] }
        },
        attributes: []
      }],
      group: ['productId', 'productName', 'productSku'],
      order: [[literal('totalQuantity'), 'DESC']],
      limit: Number(top),
      raw: true
    });

    res.json(ResponseUtil.success(topProducts));
  } catch (error) {
    next(error);
  }
};
