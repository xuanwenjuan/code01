import { Request, Response } from 'express';
import { Op } from 'sequelize';
import Supplier from '../models/Supplier';
import { ResponseUtil } from '../utils/response';
import { AppError } from '../middleware/errorHandler';
import { SupplierStatus } from '../types';

export const supplierController = {
  async getList(req: Request, res: Response) {
    const { 
      page = 1, 
      pageSize = 10, 
      keyword, 
      brand, 
      categoryId,
      status 
    } = req.query;
    const where: any = {};
    
    if (keyword) {
      where[Op.or] = [
        { name: { [Op.like]: `%${keyword}%` } },
        { code: { [Op.like]: `%${keyword}%` } },
        { contactPerson: { [Op.like]: `%${keyword}%` } },
        { phone: { [Op.like]: `%${keyword}%` } }
      ];
    }
    
    if (brand) {
      where.brand = { [Op.like]: `%${brand}%` };
    }
    
    if (categoryId) {
      where.categoryIds = { [Op.like]: `%${categoryId}%` };
    }
    
    if (status) {
      where.status = status;
    }

    const { count, rows } = await Supplier.findAndCountAll({
      where,
      order: [['id', 'DESC']],
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize))
    });

    return ResponseUtil.success(res, {
      list: rows,
      total: count,
      page: Number(page),
      pageSize: Number(pageSize)
    });
  },

  async getById(req: Request, res: Response) {
    const { id } = req.params;
    const supplier = await Supplier.findByPk(id);
    
    if (!supplier) {
      throw new AppError('供货商不存在', 404);
    }

    return ResponseUtil.success(res, supplier);
  },

  async create(req: Request, res: Response) {
    const { 
      name, code, contactPerson, phone, email, address,
      brand, categoryIds, supplyCycle, settlementPeriod,
      taxNumber, bankName, bankAccount, qualificationExpiryDate,
      status, remark
    } = req.body;

    const exists = await Supplier.findOne({ where: { code } });
    if (exists) {
      throw new AppError('供货商编码已存在', 400);
    }

    const supplier = await Supplier.create({
      name,
      code,
      contactPerson,
      phone,
      email,
      address,
      brand,
      categoryIds: categoryIds || '',
      supplyCycle: supplyCycle || 7,
      settlementPeriod: settlementPeriod || 30,
      taxNumber,
      bankName,
      bankAccount,
      qualificationExpiryDate,
      status: status || SupplierStatus.COOPERATING,
      remark
    });

    return ResponseUtil.success(res, supplier, '创建成功');
  },

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const updateData = req.body;

    const supplier = await Supplier.findByPk(id);
    if (!supplier) {
      throw new AppError('供货商不存在', 404);
    }

    if (updateData.code && updateData.code !== supplier.code) {
      const exists = await Supplier.findOne({
        where: { code: updateData.code, id: { [Op.ne]: id } }
      });
      if (exists) {
        throw new AppError('供货商编码已存在', 400);
      }
    }

    await supplier.update(updateData);

    return ResponseUtil.success(res, supplier, '更新成功');
  },

  async delete(req: Request, res: Response) {
    const { id } = req.params;

    const supplier = await Supplier.findByPk(id);
    if (!supplier) {
      throw new AppError('供货商不存在', 404);
    }

    await supplier.destroy();

    return ResponseUtil.success(res, null, '删除成功');
  },

  async getBrands(req: Request, res: Response) {
    const suppliers = await Supplier.findAll({
      attributes: ['brand'],
      where: { status: SupplierStatus.COOPERATING },
      group: ['brand'],
      order: [['brand', 'ASC']]
    });
    
    const brands = suppliers.map(s => s.brand);

    return ResponseUtil.success(res, brands);
  },

  async getExpiringQualifications(req: Request, res: Response) {
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);

    const suppliers = await Supplier.findAll({
      where: {
        qualificationExpiryDate: {
          [Op.lte]: thirtyDaysLater,
          [Op.gt]: new Date()
        },
        status: SupplierStatus.COOPERATING
      },
      order: [['qualificationExpiryDate', 'ASC']]
    });

    return ResponseUtil.success(res, suppliers);
  }
};
