import { Request, Response } from 'express';
import { Op, literal } from 'sequelize';
import { Supplier } from '../models';
import { ResponseUtil } from '../utils/response';
import { NotFoundException, BadRequestException, ForbiddenException } from '../exceptions/HttpException';
import { OperationLogger } from '../utils/operationLogger';
import { SupplierStatus, UserRole } from '../types';

export class SupplierController {
  private static validateQualificationExpiry(qualificationExpiry?: Date): void {
    if (qualificationExpiry) {
      const now = new Date();
      const expiry = new Date(qualificationExpiry);
      
      if (expiry < now) {
        throw new BadRequestException('资质有效期不能早于当前日期');
      }
    }
  }

  static async create(req: Request, res: Response) {
    const {
      name, code, contactPerson, phone, email, address,
      businessLicense, qualificationCert, qualificationExpiry,
      businessScope, supplyCategories, remarks
    } = req.body;

    this.validateQualificationExpiry(qualificationExpiry);

    const existing = await Supplier.findOne({ where: { code } });
    if (existing) {
      throw new BadRequestException('供应商编码已存在');
    }

    const supplier = await Supplier.create({
      name,
      code,
      contactPerson,
      phone,
      email,
      address,
      businessLicense,
      qualificationCert,
      qualificationExpiry,
      businessScope,
      supplyCategories,
      status: SupplierStatus.PENDING,
      rating: 5.0,
      remarks
    });

    await OperationLogger.create(req, 'supplier', supplier.id, `创建供应商: ${name}`);

    return ResponseUtil.success(res, supplier, '创建成功');
  }

  static async update(req: Request, res: Response) {
    const { id } = req.params;
    const updateData = req.body;

    const supplier = await Supplier.findByPk(id);
    if (!supplier) {
      throw new NotFoundException('供应商不存在');
    }

    if (updateData.qualificationExpiry !== undefined) {
      this.validateQualificationExpiry(updateData.qualificationExpiry);
    }

    if (updateData.code && updateData.code !== supplier.code) {
      const existing = await Supplier.findOne({ where: { code: updateData.code } });
      if (existing) {
        throw new BadRequestException('供应商编码已存在');
      }
    }

    const beforeData = supplier.toJSON();
    await supplier.update(updateData);

    await OperationLogger.update(req, 'supplier', supplier.id, `更新供应商: ${supplier.name}`, beforeData, supplier.toJSON());

    return ResponseUtil.success(res, supplier, '更新成功');
  }

  static async approve(req: Request, res: Response) {
    const { id } = req.params;
    const { remark } = req.body;

    if (req.user?.role !== UserRole.ADMIN) {
      throw new ForbiddenException('只有管理员可以审批供应商');
    }

    const supplier = await Supplier.findByPk(id);
    if (!supplier) {
      throw new NotFoundException('供应商不存在');
    }

    if (supplier.status !== SupplierStatus.PENDING) {
      throw new BadRequestException('只有待审批的供应商可以审批');
    }

    const beforeData = supplier.toJSON();
    await supplier.update({
      status: SupplierStatus.ACTIVE,
      remarks: remark ? `${supplier.remarks || ''}\n审批备注: ${remark}` : supplier.remarks
    });

    await OperationLogger.update(req, 'supplier', supplier.id, `审批通过供应商: ${supplier.name}`, beforeData, supplier.toJSON());

    return ResponseUtil.success(res, supplier, '审批成功');
  }

  static async toggleStatus(req: Request, res: Response) {
    const { id } = req.params;

    const supplier = await Supplier.findByPk(id);
    if (!supplier) {
      throw new NotFoundException('供应商不存在');
    }

    const beforeData = supplier.toJSON();
    const newStatus = supplier.status === SupplierStatus.ACTIVE ? SupplierStatus.INACTIVE : SupplierStatus.ACTIVE;
    await supplier.update({ status: newStatus });

    await OperationLogger.update(
      req,
      'supplier',
      supplier.id,
      `${newStatus === SupplierStatus.ACTIVE ? '启用' : '停用'}供应商: ${supplier.name}`,
      beforeData,
      supplier.toJSON()
    );

    return ResponseUtil.success(res, supplier, '状态更新成功');
  }

  static async getById(req: Request, res: Response) {
    const { id } = req.params;

    const supplier = await Supplier.findByPk(id);
    if (!supplier) {
      throw new NotFoundException('供应商不存在');
    }

    return ResponseUtil.success(res, supplier, '查询成功');
  }

  static async getList(req: Request, res: Response) {
    const { 
      keyword, status, categoryId, supplyCategories,
      expiringInDays, expiredOnly, startDate, endDate,
      page = 1, pageSize = 10, sortBy = 'createdAt', sortOrder = 'DESC'
    } = req.query;

    const where: any = {};
    
    if (keyword) {
      where[Op.or] = [
        { name: { [Op.like]: `%${keyword}%` } },
        { code: { [Op.like]: `%${keyword}%` } },
        { contactPerson: { [Op.like]: `%${keyword}%` } },
        { phone: { [Op.like]: `%${keyword}%` } },
        { businessScope: { [Op.like]: `%${keyword}%` } }
      ];
    }
    
    if (status) where.status = status;
    
    if (categoryId) {
      where.supplyCategories = { [Op.like]: `%${categoryId}%` };
    }
    
    if (supplyCategories) {
      const categories = String(supplyCategories).split(',');
      where[Op.and] = categories.map(cat => ({
        supplyCategories: { [Op.like]: `%${cat}%` }
      }));
    }
    
    const now = new Date();
    if (expiringInDays) {
      const expiryDate = new Date(now.getTime() + Number(expiringInDays) * 24 * 60 * 60 * 1000);
      where.qualificationExpiry = { [Op.between]: [now, expiryDate] };
    }
    
    if (expiredOnly === 'true') {
      where.qualificationExpiry = { [Op.lt]: now };
    }
    
    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate as string), new Date(endDate as string)]
      };
    }

    const order: any[] = [];
    if (sortBy === 'expiry') {
      order.push(['qualificationExpiry', sortOrder as string]);
    } else if (sortBy === 'rating') {
      order.push(['rating', sortOrder as string]);
    } else {
      order.push([sortBy as string, sortOrder as string]);
    }
    order.push(['createdAt', 'DESC']);

    const { count, rows } = await Supplier.findAndCountAll({
      where,
      order,
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

  static async getAllActive(req: Request, res: Response) {
    const suppliers = await Supplier.findAll({
      where: { status: SupplierStatus.ACTIVE },
      order: [['name', 'ASC']]
    });

    return ResponseUtil.success(res, suppliers, '查询成功');
  }

  static async getExpiringSoon(req: Request, res: Response) {
    const days = Number(req.query.days) || 30;
    const now = new Date();
    const expiryDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    const suppliers = await Supplier.findAll({
      where: {
        qualificationExpiry: {
          [Op.between]: [now, expiryDate]
        },
        status: { [Op.in]: [SupplierStatus.ACTIVE, SupplierStatus.PENDING] }
      },
      attributes: {
        include: [
          [
            literal(`DATEDIFF(qualificationExpiry, NOW())`),
            'daysUntilExpiry'
          ]
        ]
      },
      order: [['qualificationExpiry', 'ASC']]
    });

    return ResponseUtil.success(res, suppliers, '查询成功');
  }

  static async getExpired(req: Request, res: Response) {
    const now = new Date();

    const suppliers = await Supplier.findAll({
      where: {
        qualificationExpiry: {
          [Op.lt]: now
        },
        status: { [Op.in]: [SupplierStatus.ACTIVE, SupplierStatus.PENDING] }
      },
      attributes: {
        include: [
          [
            literal(`DATEDIFF(NOW(), qualificationExpiry)`),
            'daysExpired'
          ]
        ]
      },
      order: [['qualificationExpiry', 'ASC']]
    });

    return ResponseUtil.success(res, suppliers, '查询成功');
  }

  static async getStatistics(req: Request, res: Response) {
    const [statusStats, expiringStats, totalStats] = await Promise.all([
      Supplier.findAll({
        attributes: ['status', [literal('COUNT(*)'), 'count']],
        group: ['status']
      }),
      Supplier.count({
        where: {
          qualificationExpiry: {
            [Op.between]: [new Date(), new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)]
          },
          status: SupplierStatus.ACTIVE
        }
      }),
      Supplier.count()
    ]);

    return ResponseUtil.success(res, {
      total: totalStats,
      byStatus: statusStats,
      expiringIn30Days: expiringStats
    }, '查询成功');
  }
}
