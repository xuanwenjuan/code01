import { Request, Response, NextFunction } from 'express';
import { body, query } from 'express-validator';
import { Op } from 'sequelize';
import { Supplier, SupplierStore, Store, PurchaseOrder } from '../models';
import { ResponseUtil } from '../utils/response';
import { BadRequestException, NotFoundException } from '../exceptions/HttpException';
import { CooperationStatus } from '../types';

export const createSupplierValidation = [
  body('supplierName').notEmpty().withMessage('供应商名称不能为空').isLength({ max: 100 }).withMessage('供应商名称不能超过100个字符'),
  body('supplierCode').notEmpty().withMessage('供应商编码不能为空').isLength({ max: 50 }).withMessage('供应商编码不能超过50个字符'),
  body('contactPerson').optional().isLength({ max: 50 }).withMessage('联系人不能超过50个字符'),
  body('contactPhone').optional().isMobilePhone('zh-CN').withMessage('请输入有效的手机号码'),
  body('settlementPeriodDays').optional().isInt({ min: 0, max: 365 }).withMessage('结算账期必须是0-365之间的整数'),
  body('deliveryTimeDays').optional().isInt({ min: 0, max: 30 }).withMessage('配送时效必须是0-30之间的整数'),
  body('creditLimit').optional().isFloat({ min: 0 }).withMessage('信用额度必须大于等于0'),
  body('cooperationStatus').optional().isIn(Object.values(CooperationStatus)).withMessage('合作状态无效'),
  body('storeIds').optional().isArray().withMessage('门店ID必须是数组'),
  body('storeIds.*').optional().isInt().withMessage('门店ID必须是数字')
];

export const updateSupplierValidation = [
  body('supplierName').optional().notEmpty().withMessage('供应商名称不能为空').isLength({ max: 100 }).withMessage('供应商名称不能超过100个字符'),
  body('contactPerson').optional().isLength({ max: 50 }).withMessage('联系人不能超过50个字符'),
  body('contactPhone').optional().isMobilePhone('zh-CN').withMessage('请输入有效的手机号码'),
  body('settlementPeriodDays').optional().isInt({ min: 0, max: 365 }).withMessage('结算账期必须是0-365之间的整数'),
  body('deliveryTimeDays').optional().isInt({ min: 0, max: 30 }).withMessage('配送时效必须是0-30之间的整数'),
  body('creditLimit').optional().isFloat({ min: 0 }).withMessage('信用额度必须大于等于0'),
  body('cooperationStatus').optional().isIn(Object.values(CooperationStatus)).withMessage('合作状态无效'),
  body('storeIds').optional().isArray().withMessage('门店ID必须是数组'),
  body('storeIds.*').optional().isInt().withMessage('门店ID必须是数字')
];

export const createSupplier = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      supplierName,
      supplierCode,
      contactPerson,
      contactPhone,
      address,
      businessLicense,
      qualificationExpireDate,
      settlementPeriodDays,
      deliveryTimeDays,
      creditLimit,
      supplyCategories,
      remark,
      storeIds
    } = req.body;

    const existingCode = await Supplier.findOne({ where: { supplierCode } });
    if (existingCode) {
      throw new BadRequestException('供应商编码已存在');
    }

    if (storeIds && storeIds.length > 0) {
      const validStores = await Store.count({ where: { id: { [Op.in]: storeIds } } });
      if (validStores !== storeIds.length) {
        throw new BadRequestException('存在无效的门店ID');
      }
    }

    const supplier = await Supplier.create({
      supplierName,
      supplierCode,
      contactPerson,
      contactPhone,
      address,
      businessLicense,
      qualificationExpireDate,
      settlementPeriodDays: settlementPeriodDays ?? 30,
      deliveryTimeDays: deliveryTimeDays ?? 3,
      cooperationStatus: CooperationStatus.ACTIVE,
      creditLimit: creditLimit ?? 0,
      supplyCategories,
      remark
    });

    if (storeIds && storeIds.length > 0) {
      const supplierStores = storeIds.map((storeId: number) => ({
        supplierId: supplier.id,
        storeId
      }));
      await SupplierStore.bulkCreate(supplierStores);
    }

    ResponseUtil.success(res, supplier, '供应商创建成功');
  } catch (error) {
    next(error);
  }
};

export const updateSupplier = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const {
      supplierName,
      contactPerson,
      contactPhone,
      address,
      businessLicense,
      qualificationExpireDate,
      settlementPeriodDays,
      deliveryTimeDays,
      cooperationStatus,
      creditLimit,
      supplyCategories,
      remark,
      storeIds
    } = req.body;

    const supplier = await Supplier.findByPk(id);
    if (!supplier) {
      throw new NotFoundException('供应商不存在');
    }

    if (storeIds && storeIds.length > 0) {
      const validStores = await Store.count({ where: { id: { [Op.in]: storeIds } } });
      if (validStores !== storeIds.length) {
        throw new BadRequestException('存在无效的门店ID');
      }
    }

    await supplier.update({
      supplierName: supplierName || supplier.supplierName,
      contactPerson: contactPerson !== undefined ? contactPerson : supplier.contactPerson,
      contactPhone: contactPhone !== undefined ? contactPhone : supplier.contactPhone,
      address: address !== undefined ? address : supplier.address,
      businessLicense: businessLicense !== undefined ? businessLicense : supplier.businessLicense,
      qualificationExpireDate: qualificationExpireDate !== undefined ? qualificationExpireDate : supplier.qualificationExpireDate,
      settlementPeriodDays: settlementPeriodDays !== undefined ? settlementPeriodDays : supplier.settlementPeriodDays,
      deliveryTimeDays: deliveryTimeDays !== undefined ? deliveryTimeDays : supplier.deliveryTimeDays,
      cooperationStatus: cooperationStatus !== undefined ? cooperationStatus : supplier.cooperationStatus,
      creditLimit: creditLimit !== undefined ? creditLimit : supplier.creditLimit,
      supplyCategories: supplyCategories !== undefined ? supplyCategories : supplier.supplyCategories,
      remark: remark !== undefined ? remark : supplier.remark
    });

    if (storeIds !== undefined) {
      await SupplierStore.destroy({ where: { supplierId: id } });
      if (storeIds.length > 0) {
        const supplierStores = storeIds.map((storeId: number) => ({
          supplierId: supplier.id,
          storeId
        }));
        await SupplierStore.bulkCreate(supplierStores);
      }
    }

    ResponseUtil.success(res, supplier, '供应商更新成功');
  } catch (error) {
    next(error);
  }
};

export const deleteSupplier = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const supplier = await Supplier.findByPk(id);
    if (!supplier) {
      throw new NotFoundException('供应商不存在');
    }

    const pendingOrders = await PurchaseOrder.count({
      where: {
        supplierId: id,
        status: { [Op.in]: ['pending', 'reviewing', 'approved', 'shipped'] }
      }
    });

    if (pendingOrders > 0) {
      throw new BadRequestException(`该供应商存在${pendingOrders}个进行中的采购订单，无法删除`);
    }

    await supplier.destroy();
    ResponseUtil.success(res, null, '供应商删除成功');
  } catch (error) {
    next(error);
  }
};

export const getSupplierListValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('页码必须大于0'),
  query('pageSize').optional().isInt({ min: 1, max: 100 }).withMessage('每页条数必须在1-100之间'),
  query('cooperationStatus').optional().isIn(Object.values(CooperationStatus)).withMessage('合作状态无效'),
  query('storeId').optional().isInt().withMessage('门店ID必须是数字'),
  query('days').optional().isInt({ min: 1, max: 365 }).withMessage('天数必须在1-365之间')
];

export const getSupplierList = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page = 1, pageSize = 10, cooperationStatus, keyword, storeId } = req.query;

    const where: any = {};
    if (cooperationStatus) {
      where.cooperationStatus = cooperationStatus;
    }
    if (keyword) {
      where[Op.or] = [
        { supplierName: { [Op.like]: `%${keyword}%` } },
        { supplierCode: { [Op.like]: `%${keyword}%` } },
        { contactPerson: { [Op.like]: `%${keyword}%` } }
      ];
    }

    const include: any[] = [
      {
        model: Store,
        through: { attributes: [] },
        attributes: ['id', 'storeName', 'storeCode']
      }
    ];

    if (storeId) {
      include[0].where = { id: storeId };
    }

    const { count, rows } = await Supplier.findAndCountAll({
      where,
      include,
      order: [['id', 'DESC']],
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize),
      distinct: true
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

export const getSupplierDetail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const supplier = await Supplier.findByPk(id, {
      include: [
        {
          model: Store,
          through: { attributes: [] },
          attributes: ['id', 'storeName', 'storeCode', 'address']
        }
      ]
    });

    if (!supplier) {
      throw new NotFoundException('供应商不存在');
    }

    ResponseUtil.success(res, supplier);
  } catch (error) {
    next(error);
  }
};

export const getSupplierStores = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const supplier = await Supplier.findByPk(id, {
      include: [
        {
          model: Store,
          through: { attributes: [] },
          attributes: ['id', 'storeName', 'storeCode', 'address', 'contactPhone']
        }
      ]
    });

    if (!supplier) {
      throw new NotFoundException('供应商不存在');
    }

    ResponseUtil.success(res, (supplier as any).stores);
  } catch (error) {
    next(error);
  }
};

export const getExpiringSuppliers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { days = 30 } = req.query;

    const today = new Date();
    const expireDate = new Date(today.getTime() + Number(days) * 24 * 60 * 60 * 1000);

    const suppliers = await Supplier.findAll({
      where: {
        qualificationExpireDate: {
          [Op.between]: [today, expireDate]
        },
        cooperationStatus: CooperationStatus.ACTIVE
      },
      include: [
        {
          model: Store,
          through: { attributes: [] },
          attributes: ['id', 'storeName']
        }
      ],
      order: [['qualificationExpireDate', 'ASC']]
    });

    ResponseUtil.success(res, {
      list: suppliers,
      total: suppliers.length,
      days: Number(days)
    });
  } catch (error) {
    next(error);
  }
};
