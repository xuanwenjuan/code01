import { Category, Collection } from '../models';
import { AppError } from '../middleware/errorHandler';
import { CategoryType } from '../types';
import { Op } from 'sequelize';

export const createCategory = async (categoryData: {
  name: string;
  type: CategoryType;
  parentId?: number;
  sortOrder?: number;
  description?: string;
}): Promise<Category> => {
  if (categoryData.parentId) {
    const parent = await Category.findByPk(categoryData.parentId);
    if (!parent) {
      throw new AppError('父级类目不存在', 404);
    }
    if (parent.isArchived) {
      throw new AppError('父级类目已封存，无法创建子类目', 400);
    }
  }

  return Category.create({
    ...categoryData,
    sortOrder: categoryData.sortOrder || 0,
    isArchived: false
  });
};

const getAllChildIds = async (categoryId: number): Promise<number[]> => {
  const children = await Category.findAll({
    where: { parentId: categoryId },
    attributes: ['id']
  });

  const childIds: number[] = children.map(c => c.id);
  
  for (const childId of childIds) {
    const grandChildIds = await getAllChildIds(childId);
    childIds.push(...grandChildIds);
  }

  return childIds;
};

export const getCategoryTree = async (includeArchived: boolean = false): Promise<any[]> => {
  const where: any = includeArchived ? {} : { isArchived: false };

  const allCategories = await Category.findAll({
    where,
    order: [['sortOrder', 'ASC'], ['id', 'ASC']]
  });

  const categoryMap = new Map<number, any>();
  allCategories.forEach(cat => {
    categoryMap.set(cat.id, {
      ...cat.toJSON(),
      children: []
    });
  });

  const tree: any[] = [];
  allCategories.forEach(cat => {
    const node = categoryMap.get(cat.id);
    if (cat.parentId === null || cat.parentId === undefined) {
      tree.push(node);
    } else {
      const parent = categoryMap.get(cat.parentId);
      if (parent) {
        parent.children.push(node);
      }
    }
  });

  return tree;
};

export const getCategoryById = async (id: number): Promise<Category> => {
  const category = await Category.findByPk(id, {
    include: [{ association: 'parent' }]
  });

  if (!category) {
    throw new AppError('分类不存在', 404);
  }

  return category;
};

export const getCategoryWithChildren = async (id: number): Promise<any> => {
  const category = await getCategoryById(id);
  const allCategories = await Category.findAll({
    where: { isArchived: false },
    order: [['sortOrder', 'ASC']]
  });

  const buildSubTree = (parentId: number): any[] => {
    return allCategories
      .filter(cat => cat.parentId === parentId)
      .map(cat => ({
        ...cat.toJSON(),
        children: buildSubTree(cat.id)
      }));
  };

  return {
    ...category.toJSON(),
    children: buildSubTree(id)
  };
};

export const updateCategory = async (id: number, categoryData: Partial<Category>): Promise<Category> => {
  const category = await getCategoryById(id);

  if (categoryData.parentId !== undefined) {
    if (categoryData.parentId === id) {
      throw new AppError('不能将类目设置为自己的子类目', 400);
    }

    if (categoryData.parentId !== null) {
      const childIds = await getAllChildIds(id);
      if (childIds.includes(categoryData.parentId)) {
        throw new AppError('不能将父级类目移动到自己的子级下', 400);
      }

      const newParent = await Category.findByPk(categoryData.parentId);
      if (!newParent) {
        throw new AppError('父级类目不存在', 404);
      }
      if (newParent.isArchived) {
        throw new AppError('父级类目已封存', 400);
      }
    }
  }

  await category.update(categoryData);
  return category;
};

export const archiveCategory = async (id: number): Promise<Category> => {
  const collectionCount = await Collection.count({ where: { categoryId: id } });
  if (collectionCount > 0) {
    throw new AppError('该类目下还有藏品，无法封存', 400);
  }

  const childIds = await getAllChildIds(id);
  for (const childId of childIds) {
    const childCollectionCount = await Collection.count({ where: { categoryId: childId } });
    if (childCollectionCount > 0) {
      throw new AppError('子类目下还有藏品，无法封存', 400);
    }
  }

  const transaction = await Category.sequelize!.transaction();
  
  try {
    await Category.update(
      { isArchived: true },
      { where: { id: { [Op.in]: [id, ...childIds] } }, transaction }
    );

    const category = await Category.findByPk(id, { transaction });
    await transaction.commit();
    
    return category!;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const unarchiveCategory = async (id: number): Promise<Category> => {
  const category = await getCategoryById(id);
  
  if (category.parentId) {
    const parent = await Category.findByPk(category.parentId);
    if (parent && parent.isArchived) {
      throw new AppError('父级类目已封存，请先解封父级类目', 400);
    }
  }

  await category.update({ isArchived: false });
  return category;
};

export const updateSortOrder = async (sortData: { id: number; sortOrder: number }[]): Promise<void> => {
  const transaction = await Category.sequelize!.transaction();
  
  try {
    for (const item of sortData) {
      await Category.update(
        { sortOrder: item.sortOrder },
        { where: { id: item.id }, transaction }
      );
    }
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const getCategoriesByType = async (type: CategoryType): Promise<Category[]> => {
  return Category.findAll({
    where: { type, isArchived: false },
    order: [['sortOrder', 'ASC']]
  });
};

export const getCategoryStats = async (id: number): Promise<any> => {
  const category = await getCategoryById(id);
  const childIds = await getAllChildIds(id);
  const allCategoryIds = [id, ...childIds];

  const totalCollections = await Collection.count({
    where: { categoryId: { [Op.in]: allCategoryIds } }
  });

  return {
    category: {
      id: category.id,
      name: category.name,
      type: category.type
    },
    totalCollections,
    subCategoryCount: childIds.length
  };
};
