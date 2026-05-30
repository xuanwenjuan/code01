import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { Reagent, ReagentCategory, Supplier } from '../models';
import { ResponseUtil } from '../utils/response';
import { NotFoundException, BadRequestException } from '../exceptions/HttpException';
import { OperationLogger } from '../utils/operationLogger';

export class ReagentController {
  static async create(req: Request, res: Response) {
    const {
      name, code, casNo, molecularFormula, specification,
      unit, categoryId, supplierId, price, safetyLevel,
      storageCondition, description
    } = req.body;

    const existing = await Reagent.findOne({ where: { code } });
    if (existing) {
      throw new BadRequestException('试剂编码已存在');
    }

    const category = await ReagentCategory.findByPk(categoryId);
    if (!category) {
      throw new NotFoundException('分类不存在');
    }

    const supplier = await Supplier.findByPk(supplierId);
    if (!supplier) {
      throw new NotFoundException('供应商不存在');
    }

    const reagent = await Reagent.create({
      name,
      code,
      casNo,
      molecularFormula,
      specification,
      unit,
      categoryId,
      supplierId,
      price,
      safetyLevel,
      storageCondition,
      description,
      status: true
    });

    await OperationLogger.create(req, 'reagent', reagent.id, `创建试剂: ${name}`);

    return ResponseUtil.success(res, reagent, '创建成功');
  }

  static async update(req: Request, res: Response) {
    const { id } = req.params;
    const updateData = req.body;

    const reagent = await Reagent.findByPk(id);
    if (!reagent) {
      throw new NotFoundException('试剂不存在');
    }

    if (updateData.code && updateData.code !== reagent.code) {
      const existing = await Reagent.findOne({ where: { code: updateData.code } });
      if (existing) {
        throw new BadRequestException('试剂编码已存在');
      }
    }

    if (updateData.categoryId) {
      const category = await ReagentCategory.findByPk(updateData.categoryId);
      if (!category) {
        throw new NotFoundException('分类不存在');
      }
    }

    if (updateData.supplierId) {
      const supplier = await Supplier.findByPk(updateData.supplierId);
      if (!supplier) {
        throw new NotFoundException('供应商不存在');
      }
    }

    const beforeData = reagent.toJSON();
    await reagent.update(updateData);

    await OperationLogger.update(req, 'reagent', reagent.id, `更新试剂: ${reagent.name}`, beforeData, reagent.toJSON());

    return ResponseUtil.success(res, reagent, '更新成功');
  }

  static async toggleStatus(req: Request, res: Response) {
    const { id } = req.params;

    const reagent = await Reagent.findByPk(id);
    if (!reagent) {
      throw new NotFoundException('试剂不存在');
    }

    const beforeData = reagent.toJSON();
    await reagent.update({ status: !reagent.status });

    await OperationLogger.update(
      req,
      'reagent',
      reagent.id,
      `${reagent.status ? '停用' : '启用'}试剂: ${reagent.name}`,
      beforeData,
      reagent.toJSON()
    );

    return ResponseUtil.success(res, reagent, '状态更新成功');
  }

  static async getById(req: Request, res: Response) {
    const { id } = req.params;

    const reagent = await Reagent.findByPk(id, {
      include: [
        { model: ReagentCategory, as: 'category' },
        { model: Supplier, as: 'supplier' }
      ]
    });

    if (!reagent) {
      throw new NotFoundException('试剂不存在');
    }

    return ResponseUtil.success(res, reagent, '查询成功');
  }

  static async getList(req: Request, res: Response) {
    const { keyword, categoryId, supplierId, status, page = 1, pageSize = 10 } = req.query;

    const where: any = {};
    if (keyword) {
      where[Op.or] = [
        { name: { [Op.like]: `%${keyword}%` } },
        { code: { [Op.like]: `%${keyword}%` } },
        { casNo: { [Op.like]: `%${keyword}%` } }
      ];
    }
    if (categoryId) where.categoryId = categoryId;
    if (supplierId) where.supplierId = supplierId;
    if (status !== undefined) where.status = status === 'true';

    const { count, rows } = await Reagent.findAndCountAll({
      where,
      include: [
        { model: ReagentCategory, as: 'category' },
        { model: Supplier, as: 'supplier' }
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

  static async getAllActive(req: Request, res: Response) {
    const reagents = await Reagent.findAll({
      where: { status: true },
      include: [
        { model: ReagentCategory, as: 'category' },
        { model: Supplier, as: 'supplier' }
      ],
      order: [['name', 'ASC']]
    });

    return ResponseUtil.success(res, reagents, '查询成功');
  }
}
