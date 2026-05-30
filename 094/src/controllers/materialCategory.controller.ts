import { Request, Response, NextFunction } from 'express';
import { Op } from 'sequelize';
import { MaterialCategory, Material } from '../models';
import { successResponse, notFoundError, conflictError, badRequestError } from '../utils/response';
import logger from '../utils/logger';

export const createMaterialCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, code, parentId, description, sortOrder, isActive, isPurchasable } = req.body;

    const existingCategory = await MaterialCategory.findOne({ where: { code } });
    if (existingCategory) {
      throw conflictError('类目编码已存在');
    }

    let level = 1;
    let path = '';
    if (parentId) {
      const parent = await MaterialCategory.findByPk(parentId);
      if (!parent) {
        throw notFoundError('父类目不存在');
      }
      level = parent.level + 1;
      path = parent.path ? `${parent.path}-${parentId}` : `${parentId}`;
    }

    const category = await MaterialCategory.create({
      name,
      code,
      parentId,
      level,
      path,
      description,
      sortOrder: sortOrder || 0,
      isActive: isActive !== undefined ? isActive : true,
      isPurchasable: isPurchasable !== undefined ? isPurchasable : true,
      createdBy: req.user?.id,
    });

    logger.info(`创建物料类目成功: ${code} - ${name}`);
    successResponse(res, category, '创建成功', 201);
  } catch (error) {
    next(error);
  }
};

export const getMaterialCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { isActive, isPurchasable, asTree = 'true' } = req.query;

    const result = await MaterialCategory.buildTree(null, isActive === undefined);

    if (isPurchasable !== undefined) {
      const filterPurchasable = (categories: any[]): any[] => {
        return categories
          .filter((cat) => cat.isPurchasable === (isPurchasable === 'true'))
          .map((cat) => ({
            ...cat,
            children: filterPurchasable(cat.children || []),
          }));
      };
      const filtered = filterPurchasable(result);
      successResponse(res, filtered, '获取成功');
      return;
    }

    successResponse(res, result, '获取成功');
  } catch (error) {
    next(error);
  }
};

export const getMaterialCategoryById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const category = await MaterialCategory.findByPk(id, {
      include: [
        {
          model: MaterialCategory,
          as: 'parent',
        },
        {
          model: MaterialCategory,
          as: 'children',
        },
      ],
    });

    if (!category) {
      throw notFoundError('物料类目不存在');
    }

    successResponse(res, category, '获取成功');
  } catch (error) {
    next(error);
  }
};

export const updateMaterialCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, code, parentId, description, sortOrder, isActive, isPurchasable } = req.body;

    const category = await MaterialCategory.findByPk(id);
    if (!category) {
      throw notFoundError('物料类目不存在');
    }

    if (code && code !== category.code) {
      const existingCategory = await MaterialCategory.findOne({
        where: { code, id: { [Op.ne]: Number(id) } },
      });
      if (existingCategory) {
        throw conflictError('类目编码已存在');
      }
    }

    if (parentId !== undefined && parentId !== category.parentId) {
      if (parentId === Number(id)) {
        throw conflictError('不能将自己设为父类目');
      }

      if (parentId) {
        const parent = await MaterialCategory.findByPk(parentId);
        if (!parent) {
          throw notFoundError('父类目不存在');
        }
        const newLevel = parent.level + 1;
        const newPath = parent.path ? `${parent.path}-${parentId}` : `${parentId}`;
        await category.update({ parentId, level: newLevel, path: newPath });
      } else {
        await category.update({ parentId: null, level: 1, path: '' });
      }
    }

    await category.update({
      name: name || category.name,
      code: code || category.code,
      description: description !== undefined ? description : category.description,
      sortOrder: sortOrder !== undefined ? sortOrder : category.sortOrder,
      isActive: isActive !== undefined ? isActive : category.isActive,
      isPurchasable: isPurchasable !== undefined ? isPurchasable : category.isPurchasable,
    });

    if (isPurchasable === false) {
      await Material.update(
        { isPurchasable: false },
        { where: { categoryId: Number(id) } }
      );
      logger.info(`类目「${category.name}」设为停采，已自动更新该类目下所有物料为停采状态`);
    }

    logger.info(`更新物料类目成功: ${category.code}`);
    successResponse(res, category, '更新成功');
  } catch (error) {
    next(error);
  }
};

export const deleteMaterialCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const category = await MaterialCategory.findByPk(id);
    if (!category) {
      throw notFoundError('物料类目不存在');
    }

    const childCount = await MaterialCategory.count({ where: { parentId: Number(id) } });
    if (childCount > 0) {
      throw conflictError('该类目下还有子类目，无法删除');
    }

    const materialCount = await Material.count({ where: { categoryId: Number(id) } });
    if (materialCount > 0) {
      throw conflictError('该类目下还有物料，无法删除');
    }

    await category.destroy();

    logger.info(`删除物料类目成功: ${category.code}`);
    successResponse(res, null, '删除成功');
  } catch (error) {
    next(error);
  }
};
