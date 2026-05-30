import { Response, NextFunction } from 'express';
import { Op, Transaction } from 'sequelize';
import MaterialCategory from '../models/MaterialCategory';
import Material from '../models/Material';
import ResponseUtil from '../utils/response';
import { BadRequestError, NotFoundError, ForbiddenError } from '../utils/errors';
import { AuthRequest } from '../middleware/auth';
import sequelize from '../database';

const MAX_TREE_DEPTH = 10;

const buildCategoryTree = (
  categories: any[],
  parentId: number | null = null,
  currentDepth: number = 0,
  maxDepth: number = MAX_TREE_DEPTH
): any[] => {
  if (currentDepth >= maxDepth) {
    return [];
  }
  
  return categories
    .filter((cat) => cat.parentId === parentId)
    .map((cat) => ({
      ...cat.toJSON(),
      children: buildCategoryTree(categories, cat.id, currentDepth + 1, maxDepth),
    }));
};

const checkCategoryChainStatus = async (categoryId: number): Promise<{ valid: boolean; invalidCategory?: string }> => {
  let currentId: number | null = categoryId;
  const visited = new Set<number>();
  
  while (currentId && !visited.has(currentId)) {
    visited.add(currentId);
    const category: any = await MaterialCategory.findByPk(currentId);
    
    if (!category) {
      return { valid: false, invalidCategory: '分类不存在' };
    }
    
    if (!category.status) {
      return { valid: false, invalidCategory: `分类「${category.name}」已停用` };
    }
    
    currentId = category.parentId;
  }
  
  if (visited.size > MAX_TREE_DEPTH) {
    return { valid: false, invalidCategory: '分类层级过深' };
  }
  
  return { valid: true };
};

const getCategoryIdsByParent = async (parentId: number | null): Promise<number[]> => {
  const categories = await MaterialCategory.findAll({
    attributes: ['id', 'parentId'],
  });
  
  const result: number[] = [];
  const collectIds = (pid: number | null) => {
    categories
      .filter((cat) => cat.parentId === pid)
      .forEach((cat) => {
        result.push(cat.id);
        collectIds(cat.id);
      });
  };
  
  collectIds(parentId);
  return result;
};

export const getCategoryTree = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { type, status, parentId, maxDepth = MAX_TREE_DEPTH } = req.query;
    const where: any = {};
    
    if (type) where.type = type;
    if (status !== undefined) where.status = status === 'true';

    const categories = await MaterialCategory.findAll({
      where,
      order: [['sort', 'ASC'], ['id', 'ASC']],
    });

    const rootId = parentId ? Number(parentId) : null;
    const tree = buildCategoryTree(categories, rootId, 0, Number(maxDepth));
    
    ResponseUtil.success(res, {
      total: categories.length,
      tree,
    });
  } catch (error) {
    next(error);
  }
};

export const getCategoryList = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page = 1, pageSize = 10, type, status, keyword } = req.query;
    const where: any = {};
    
    if (type) where.type = type;
    if (status !== undefined) where.status = status === 'true';
    if (keyword) {
      where[Op.or] = [
        { name: { [Op.like]: `%${keyword}%` } },
        { code: { [Op.like]: `%${keyword}%` } },
      ];
    }

    const { count, rows } = await MaterialCategory.findAndCountAll({
      where,
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize),
      order: [['sort', 'ASC'], ['id', 'ASC']],
    });

    ResponseUtil.pagination(
      res,
      {
        list: rows,
        total: count,
        page: Number(page),
        pageSize: Number(pageSize),
      },
      '查询成功'
    );
  } catch (error) {
    next(error);
  }
};

export const getCategoryById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const category = await MaterialCategory.findByPk(id, {
      include: [
        {
          model: MaterialCategory,
          as: 'parent',
        },
        {
          model: Material,
          as: 'materials',
        },
      ],
    });

    if (!category) {
      throw new NotFoundError('分类不存在');
    }

    ResponseUtil.success(res, category);
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { code, parentId } = req.body;

    const existingCategory = await MaterialCategory.findOne({ where: { code } });
    if (existingCategory) {
      throw new BadRequestError('分类编码已存在');
    }

    if (parentId) {
      const parentCategory = await MaterialCategory.findByPk(parentId);
      if (!parentCategory) {
        throw new BadRequestError('父分类不存在');
      }
      req.body.level = parentCategory.level + 1;
    }

    const category = await MaterialCategory.create(req.body);
    ResponseUtil.success(res, category, '创建成功');
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { code, parentId } = req.body;

    const category = await MaterialCategory.findByPk(id);
    if (!category) {
      throw new NotFoundError('分类不存在');
    }

    if (code && code !== category.code) {
      const existingCategory = await MaterialCategory.findOne({ where: { code } });
      if (existingCategory) {
        throw new BadRequestError('分类编码已存在');
      }
    }

    if (parentId && parentId !== category.parentId) {
      const parentCategory = await MaterialCategory.findByPk(parentId);
      if (!parentCategory) {
        throw new BadRequestError('父分类不存在');
      }
      req.body.level = parentCategory.level + 1;
    }

    await category.update(req.body);
    ResponseUtil.success(res, category, '更新成功');
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const category = await MaterialCategory.findByPk(id);
    if (!category) {
      throw new NotFoundError('分类不存在');
    }

    const childCount = await MaterialCategory.count({ where: { parentId: id } });
    if (childCount > 0) {
      throw new BadRequestError('该分类下还有子分类，无法删除');
    }

    const materialCount = await Material.count({ where: { categoryId: id } });
    if (materialCount > 0) {
      throw new BadRequestError('该分类下还有原料，无法删除');
    }

    await category.destroy();
    ResponseUtil.success(res, null, '删除成功');
  } catch (error) {
    next(error);
  }
};

export const getMaterialList = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page = 1, pageSize = 10, categoryId, status, keyword } = req.query;
    const where: any = {};
    
    if (categoryId) where.categoryId = categoryId;
    if (status !== undefined) where.status = status === 'true';
    if (keyword) {
      where[Op.or] = [
        { name: { [Op.like]: `%${keyword}%` } },
        { code: { [Op.like]: `%${keyword}%` } },
      ];
    }

    const { count, rows } = await Material.findAndCountAll({
      where,
      include: [
        {
          model: MaterialCategory,
          as: 'category',
          attributes: ['id', 'name', 'type'],
        },
      ],
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize),
      order: [['id', 'DESC']],
    });

    ResponseUtil.pagination(
      res,
      {
        list: rows,
        total: count,
        page: Number(page),
        pageSize: Number(pageSize),
      },
      '查询成功'
    );
  } catch (error) {
    next(error);
  }
};

export const getMaterialById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const material = await Material.findByPk(id, {
      include: [
        {
          model: MaterialCategory,
          as: 'category',
        },
      ],
    });

    if (!material) {
      throw new NotFoundError('原料不存在');
    }

    ResponseUtil.success(res, material);
  } catch (error) {
    next(error);
  }
};

export const createMaterial = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const transaction: Transaction = await sequelize.transaction();
  
  try {
    const { code, categoryId, stock = 0 } = req.body;

    const existingMaterial = await Material.findOne({ where: { code }, transaction });
    if (existingMaterial) {
      throw new BadRequestError('原料编码已存在');
    }

    const category = await MaterialCategory.findByPk(categoryId, { transaction });
    if (!category) {
      throw new BadRequestError('分类不存在');
    }

    const categoryStatus = await checkCategoryChainStatus(categoryId);
    if (!categoryStatus.valid) {
      throw new BadRequestError(categoryStatus.invalidCategory || '分类状态异常');
    }

    if (stock > 0 && !category.status) {
      throw new BadRequestError(`分类「${category.name}」已停用，无法进行入库操作`);
    }

    const material = await Material.create(req.body, { transaction });
    
    await transaction.commit();
    ResponseUtil.success(res, material, '创建成功');
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

export const updateMaterial = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const transaction: Transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { code, categoryId, stock } = req.body;

    const material = await Material.findByPk(id, { transaction });
    if (!material) {
      throw new NotFoundError('原料不存在');
    }

    if (code && code !== material.code) {
      const existingMaterial = await Material.findOne({ where: { code }, transaction });
      if (existingMaterial) {
        throw new BadRequestError('原料编码已存在');
      }
    }

    let targetCategoryId = categoryId || material.categoryId;
    
    if (categoryId && categoryId !== material.categoryId) {
      const category = await MaterialCategory.findByPk(categoryId, { transaction });
      if (!category) {
        throw new BadRequestError('分类不存在');
      }
    }

    const categoryStatus = await checkCategoryChainStatus(targetCategoryId);
    if (!categoryStatus.valid) {
      throw new BadRequestError(categoryStatus.invalidCategory || '分类状态异常');
    }

    if (stock !== undefined && Number(stock) > Number(material.stock)) {
      const category = await MaterialCategory.findByPk(targetCategoryId, { transaction });
      if (category && !category.status) {
        throw new BadRequestError(`分类「${category.name}」已停用，无法进行入库操作`);
      }
    }

    await material.update(req.body, { transaction });
    
    await transaction.commit();
    ResponseUtil.success(res, material, '更新成功');
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

export const deleteMaterial = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const material = await Material.findByPk(id);
    if (!material) {
      throw new NotFoundError('原料不存在');
    }

    await material.destroy();
    ResponseUtil.success(res, null, '删除成功');
  } catch (error) {
    next(error);
  }
};

export const batchStockIn = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const transaction: Transaction = await sequelize.transaction();
  
  try {
    const { items } = req.body;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new BadRequestError('入库列表不能为空');
    }

    const results = [];
    
    for (const item of items) {
      const { materialId, quantity, remark } = item;
      
      if (!materialId || !quantity || quantity <= 0) {
        throw new BadRequestError('原料ID和入库数量不能为空且数量必须大于0');
      }

      const material = await Material.findByPk(materialId, { transaction });
      if (!material) {
        throw new BadRequestError(`原料ID ${materialId} 不存在`);
      }

      const categoryStatus = await checkCategoryChainStatus(material.categoryId);
      if (!categoryStatus.valid) {
        throw new BadRequestError(categoryStatus.invalidCategory || '分类状态异常');
      }

      const category = await MaterialCategory.findByPk(material.categoryId, { transaction });
      if (category && !category.status) {
        throw new BadRequestError(`分类「${category.name}」已停用，原料「${material.name}」无法进行入库操作`);
      }

      const newStock = Number(material.stock) + Number(quantity);
      await material.update({ stock: newStock }, { transaction });
      
      results.push({
        materialId,
        materialName: material.name,
        originalStock: material.stock - quantity,
        addStock: quantity,
        currentStock: newStock,
      });
    }

    await transaction.commit();
    ResponseUtil.success(res, {
      total: items.length,
      results,
    }, '批量入库成功');
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

export const updateCategoryStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const transaction: Transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { status, cascade = false } = req.body;

    const category = await MaterialCategory.findByPk(id, { transaction });
    if (!category) {
      throw new NotFoundError('分类不存在');
    }

    const affectedCategoryIds = [Number(id)];
    
    if (cascade) {
      const childIds = await getCategoryIdsByParent(Number(id));
      affectedCategoryIds.push(...childIds);
    }

    await MaterialCategory.update(
      { status },
      { where: { id: { [Op.in]: affectedCategoryIds } }, transaction }
    );

    if (!status) {
      await Material.update(
        { status: false },
        { where: { categoryId: { [Op.in]: affectedCategoryIds } }, transaction }
      );
    }

    await transaction.commit();
    ResponseUtil.success(res, {
      updatedCategories: affectedCategoryIds.length,
      affectedCategoryIds,
      cascade,
    }, status ? '分类启用成功' : '分类停用成功');
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};
