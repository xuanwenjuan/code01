import { Request, Response, NextFunction } from 'express';
import { body, query } from 'express-validator';
import { Op } from 'sequelize';
import { MaterialCategory, Material } from '../models';
import { ResponseUtil } from '../utils/response';
import { BadRequestException, NotFoundException } from '../exceptions/HttpException';

export const createCategoryValidation = [
  body('categoryName').notEmpty().withMessage('分类名称不能为空').isLength({ max: 100 }).withMessage('分类名称不能超过100个字符'),
  body('categoryCode').notEmpty().withMessage('分类编码不能为空').isLength({ max: 50 }).withMessage('分类编码不能超过50个字符'),
  body('parentId').optional().isInt({ min: 1 }).withMessage('父分类ID必须大于0'),
  body('sort').optional().isInt({ min: 0 }).withMessage('排序必须大于等于0'),
  body('isActive').optional().isBoolean().withMessage('状态必须是布尔值'),
  body('storeAvailable').optional().isBoolean().withMessage('门店可用必须是布尔值')
];

export const updateCategoryValidation = [
  body('categoryName').optional().notEmpty().withMessage('分类名称不能为空').isLength({ max: 100 }).withMessage('分类名称不能超过100个字符'),
  body('parentId').optional().isInt({ min: 1 }).withMessage('父分类ID必须大于0'),
  body('sort').optional().isInt({ min: 0 }).withMessage('排序必须大于等于0'),
  body('isActive').optional().isBoolean().withMessage('状态必须是布尔值'),
  body('storeAvailable').optional().isBoolean().withMessage('门店可用必须是布尔值')
];

export const createCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { categoryName, categoryCode, parentId, sort, unit, description, storeAvailable } = req.body;

    const existingCode = await MaterialCategory.findOne({ where: { categoryCode } });
    if (existingCode) {
      throw new BadRequestException('分类编码已存在');
    }

    if (parentId) {
      const parent = await MaterialCategory.findByPk(parentId);
      if (!parent) {
        throw new BadRequestException('父分类不存在');
      }
    }

    const category = await MaterialCategory.create({
      categoryName,
      categoryCode,
      parentId: parentId || null,
      sort: sort || 0,
      unit,
      description,
      storeAvailable: storeAvailable !== undefined ? storeAvailable : true,
      isActive: true
    });

    ResponseUtil.success(res, category, '分类创建成功');
  } catch (error) {
    next(error);
  }
};

export const updateCategoryValidation = [
  body('categoryName').optional().notEmpty().withMessage('分类名称不能为空').isLength({ max: 100 }).withMessage('分类名称不能超过100个字符'),
  body('parentId').optional().isInt({ min: 1 }).withMessage('父分类ID必须大于0'),
  body('sort').optional().isInt({ min: 0 }).withMessage('排序必须大于等于0'),
  body('isActive').optional().isBoolean().withMessage('状态必须是布尔值'),
  body('storeAvailable').optional().isBoolean().withMessage('门店可用必须是布尔值')
];

const checkParentCycle = async (categoryId: number, parentId: number): Promise<boolean> => {
  let currentId = parentId;
  const visited = new Set<number>();
  
  while (currentId) {
    if (visited.has(currentId)) {
      return true;
    }
    if (currentId === categoryId) {
      return true;
    }
    visited.add(currentId);
    
    const category = await MaterialCategory.findByPk(currentId);
    if (!category || !category.parentId) {
      break;
    }
    currentId = category.parentId;
  }
  return false;
};

export const updateCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { categoryName, parentId, sort, unit, description, storeAvailable, isActive } = req.body;

    const category = await MaterialCategory.findByPk(id);
    if (!category) {
      throw new NotFoundException('分类不存在');
    }

    if (parentId !== undefined && parentId !== null && parentId !== category.parentId) {
      if (Number(parentId) === Number(id)) {
        throw new BadRequestException('不能将自己设为父分类');
      }
      const parent = await MaterialCategory.findByPk(parentId);
      if (!parent) {
        throw new BadRequestException('父分类不存在');
      }
      const hasCycle = await checkParentCycle(Number(id), Number(parentId));
      if (hasCycle) {
        throw new BadRequestException('分类层级存在循环，无法设置该父分类');
      }
    }

    await category.update({
      categoryName: categoryName || category.categoryName,
      parentId: parentId !== undefined ? parentId : category.parentId,
      sort: sort !== undefined ? sort : category.sort,
      unit: unit !== undefined ? unit : category.unit,
      description: description !== undefined ? description : category.description,
      storeAvailable: storeAvailable !== undefined ? storeAvailable : category.storeAvailable,
      isActive: isActive !== undefined ? isActive : category.isActive
    });

    ResponseUtil.success(res, category, '分类更新成功');
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const category = await MaterialCategory.findByPk(id);
    if (!category) {
      throw new NotFoundException('分类不存在');
    }

    const childCount = await MaterialCategory.count({ where: { parentId: id } });
    if (childCount > 0) {
      throw new BadRequestException('该分类下还有子分类，无法删除');
    }

    const materialCount = await Material.count({ where: { categoryId: id } });
    if (materialCount > 0) {
      throw new BadRequestException(`该分类下还有${materialCount}个原料，无法删除`);
    }

    await category.destroy();
    ResponseUtil.success(res, null, '分类删除成功');
  } catch (error) {
    next(error);
  }
};

export const getCategoryTree = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { storeAvailable, keyword, isActive } = req.query;

    const allCategories = await MaterialCategory.findAll({
      order: [['sort', 'ASC'], ['id', 'ASC']]
    });

    const categoryMap = new Map<number, any>();
    allCategories.forEach(cat => {
      categoryMap.set(cat.id, { ...cat.toJSON(), children: [] });
    });

    const getAncestorIds = (categoryId: number): number[] => {
      const ids: number[] = [];
      let currentId = categoryId;
      while (currentId) {
        const category = categoryMap.get(currentId);
        if (category && category.parentId) {
          ids.push(category.parentId);
          currentId = category.parentId;
        } else {
          break;
        }
      }
      return ids;
    };

    const matchedIds = new Set<number>();
    allCategories.forEach(cat => {
      let isMatch = true;
      if (storeAvailable !== undefined) {
        isMatch = isMatch && (cat.storeAvailable === (storeAvailable === 'true'));
      }
      if (isActive !== undefined) {
        isMatch = isMatch && (cat.isActive === (isActive === 'true'));
      }
      if (keyword) {
        isMatch = isMatch && cat.categoryName.includes(keyword as string);
      }
      if (isMatch) {
        matchedIds.add(cat.id);
        getAncestorIds(cat.id).forEach(id => matchedIds.add(id));
      }
    });

    const buildTree = (parentId: number | null): any[] => {
      const result: any[] = [];
      allCategories.forEach(cat => {
        if ((cat.parentId === parentId || (cat.parentId === null && parentId === null)) && matchedIds.has(cat.id)) {
          const category = categoryMap.get(cat.id)!;
          category.children = buildTree(cat.id);
          result.push(category);
        }
      });
      return result;
    };

    const tree = buildTree(null);
    ResponseUtil.success(res, tree);
  } catch (error) {
    next(error);
  }
};

export const getCategoryList = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page = 1, pageSize = 10, isActive, keyword } = req.query;

    const where: any = {};
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }
    if (keyword) {
      where.categoryName = { [Op.like]: `%${keyword}%` };
    }

    const { count, rows } = await MaterialCategory.findAndCountAll({
      where,
      include: [{ association: 'parent', attributes: ['id', 'categoryName'] }],
      order: [['sort', 'ASC'], ['id', 'DESC']],
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

export const getCategoryDetail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const category = await MaterialCategory.findByPk(id, {
      include: [{ association: 'parent', attributes: ['id', 'categoryName'] }]
    });

    if (!category) {
      throw new NotFoundException('分类不存在');
    }

    ResponseUtil.success(res, category);
  } catch (error) {
    next(error);
  }
};
