import { Request, Response, NextFunction } from 'express';
import { body, query } from 'express-validator';
import { Op } from 'sequelize';
import { Material, MaterialCategory } from '../models';
import { ResponseUtil } from '../utils/response';
import { BadRequestException, NotFoundException } from '../exceptions/HttpException';

export const createMaterialValidation = [
  body('materialName').notEmpty().withMessage('原料名称不能为空').isLength({ max: 100 }).withMessage('原料名称不能超过100个字符'),
  body('materialCode').notEmpty().withMessage('原料编码不能为空').isLength({ max: 50 }).withMessage('原料编码不能超过50个字符'),
  body('categoryId').isInt({ min: 1 }).withMessage('分类ID必须大于0'),
  body('unit').notEmpty().withMessage('单位不能为空').isLength({ max: 20 }).withMessage('单位不能超过20个字符'),
  body('specification').isFloat({ gt: 0 }).withMessage('规格必须大于0'),
  body('warningStock').optional().isFloat({ min: 0 }).withMessage('预警库存不能为负'),
  body('shelfLifeDays').optional().isInt({ min: 0 }).withMessage('保质期天数不能为负'),
  body('isActive').optional().isBoolean().withMessage('状态必须是布尔值')
];

export const updateMaterialValidation = [
  body('materialName').optional().notEmpty().withMessage('原料名称不能为空').isLength({ max: 100 }).withMessage('原料名称不能超过100个字符'),
  body('categoryId').optional().isInt({ min: 1 }).withMessage('分类ID必须大于0'),
  body('unit').optional().notEmpty().withMessage('单位不能为空').isLength({ max: 20 }).withMessage('单位不能超过20个字符'),
  body('specification').optional().isFloat({ gt: 0 }).withMessage('规格必须大于0'),
  body('warningStock').optional().isFloat({ min: 0 }).withMessage('预警库存不能为负'),
  body('shelfLifeDays').optional().isInt({ min: 0 }).withMessage('保质期天数不能为负'),
  body('isActive').optional().isBoolean().withMessage('状态必须是布尔值')
];

export const createMaterial = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { materialName, materialCode, categoryId, unit, specification, warningStock, shelfLifeDays, description } = req.body;

    const existingCode = await Material.findOne({ where: { materialCode } });
    if (existingCode) {
      throw new BadRequestException('原料编码已存在');
    }

    const category = await MaterialCategory.findByPk(categoryId);
    if (!category) {
      throw new BadRequestException('原料分类不存在');
    }

    if (!category.isActive) {
      throw new BadRequestException('该类目已停用，无法新增原料，请先启用类目');
    }

    const material = await Material.create({
      materialName,
      materialCode,
      categoryId,
      unit,
      specification,
      warningStock: warningStock || 0,
      shelfLifeDays: shelfLifeDays || 0,
      description,
      isActive: true
    });

    ResponseUtil.success(res, material, '原料创建成功');
  } catch (error) {
    next(error);
  }
};

export const updateMaterialValidation = [
  body('materialName').optional().notEmpty().withMessage('原料名称不能为空'),
  body('categoryId').optional().isInt().withMessage('分类ID必须是数字')
];

export const updateMaterial = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { materialName, categoryId, unit, specification, warningStock, shelfLifeDays, description, isActive } = req.body;

    const material = await Material.findByPk(id);
    if (!material) {
      throw new NotFoundException('原料不存在');
    }

    if (categoryId && categoryId !== material.categoryId) {
      const category = await MaterialCategory.findByPk(categoryId);
      if (!category) {
        throw new BadRequestException('原料分类不存在');
      }
    }

    await material.update({
      materialName: materialName || material.materialName,
      categoryId: categoryId !== undefined ? categoryId : material.categoryId,
      unit: unit !== undefined ? unit : material.unit,
      specification: specification !== undefined ? specification : material.specification,
      warningStock: warningStock !== undefined ? warningStock : material.warningStock,
      shelfLifeDays: shelfLifeDays !== undefined ? shelfLifeDays : material.shelfLifeDays,
      description: description !== undefined ? description : material.description,
      isActive: isActive !== undefined ? isActive : material.isActive
    });

    ResponseUtil.success(res, material, '原料更新成功');
  } catch (error) {
    next(error);
  }
};

export const deleteMaterial = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const material = await Material.findByPk(id);
    if (!material) {
      throw new NotFoundException('原料不存在');
    }

    const { Inventory } = await import('../models');
    const inventoryCount = await Inventory.count({ where: { materialId: id } });
    if (inventoryCount > 0) {
      throw new BadRequestException('该原料存在库存记录，无法删除');
    }

    await material.destroy();
    ResponseUtil.success(res, null, '原料删除成功');
  } catch (error) {
    next(error);
  }
};

export const getMaterialList = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page = 1, pageSize = 10, categoryId, isActive, keyword } = req.query;

    const where: any = {};
    if (categoryId) {
      where.categoryId = categoryId;
    }
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }
    if (keyword) {
      where[Op.or] = [
        { materialName: { [Op.like]: `%${keyword}%` } },
        { materialCode: { [Op.like]: `%${keyword}%` } }
      ];
    }

    const { count, rows } = await Material.findAndCountAll({
      where,
      include: [{ association: 'category', attributes: ['id', 'categoryName'] }],
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

export const getMaterialDetail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const material = await Material.findByPk(id, {
      include: [{ association: 'category', attributes: ['id', 'categoryName'] }]
    });

    if (!material) {
      throw new NotFoundException('原料不存在');
    }

    ResponseUtil.success(res, material);
  } catch (error) {
    next(error);
  }
};
