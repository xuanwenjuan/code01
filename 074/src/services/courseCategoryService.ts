import { CourseCategory } from '../models';
import { AppError } from '../middleware/errorHandler';
import { buildTree } from '../utils/treeBuilder';
import { CourseCategoryStatus } from '../types';

export const createCategory = async (data: any) => {
  if (data.parentId) {
    const parent = await CourseCategory.findByPk(data.parentId);
    if (!parent) {
      throw new AppError('父级分类不存在', 404);
    }
    if (parent.status === CourseCategoryStatus.CLOSED) {
      throw new AppError('父级分类已停招，无法添加子分类', 400);
    }
  }

  const category = await CourseCategory.create(data);
  return category;
};

export const updateCategory = async (id: number, data: any) => {
  const category = await CourseCategory.findByPk(id);
  if (!category) {
    throw new AppError('分类不存在', 404);
  }

  if (data.parentId && data.parentId !== category.parentId) {
    const parent = await CourseCategory.findByPk(data.parentId);
    if (!parent) {
      throw new AppError('父级分类不存在', 404);
    }
    if (parent.status === CourseCategoryStatus.CLOSED) {
      throw new AppError('父级分类已停招，无法移动到该分类下', 400);
    }
  }

  if (data.status === CourseCategoryStatus.CLOSED && category.status !== CourseCategoryStatus.CLOSED) {
    const hasActiveClasses = false;
    if (hasActiveClasses) {
      throw new AppError('该分类下存在进行中的班级，无法停招', 400);
    }
  }

  await category.update(data);
  return category;
};

export const deleteCategory = async (id: number) => {
  const category = await CourseCategory.findByPk(id);
  if (!category) {
    throw new AppError('分类不存在', 404);
  }

  const childCount = await CourseCategory.count({ where: { parentId: id } });
  if (childCount > 0) {
    throw new AppError('该分类下存在子分类，无法删除', 400);
  }

  await category.destroy();
  return { message: '删除成功' };
};

export const getCategoryById = async (id: number) => {
  const category = await CourseCategory.findByPk(id, {
    include: [{ model: CourseCategory, as: 'parent' }]
  });
  if (!category) {
    throw new AppError('分类不存在', 404);
  }
  return category;
};

export const getAllCategories = async (status?: string) => {
  const where: any = {};
  if (status) {
    where.status = status;
  }

  const categories = await CourseCategory.findAll({
    where,
    order: [['sortOrder', 'ASC'], ['createdAt', 'DESC']]
  });

  return categories;
};

export const getCategoryTree = async (status?: string) => {
  const categories = await getAllCategories(status);
  return buildTree(categories.map(c => c.toJSON()));
};

export const getCategoryChildren = async (parentId: number | null, status?: string) => {
  const where: any = { parentId };
  if (status) {
    where.status = status;
  }

  const children = await CourseCategory.findAll({
    where,
    order: [['sortOrder', 'ASC'], ['createdAt', 'DESC']]
  });

  const result = [];
  for (const child of children) {
    const hasChildren = await CourseCategory.count({
      where: { parentId: child.id, ...(status ? { status } : {}) }
    });
    result.push({
      ...child.toJSON(),
      hasChildren: hasChildren > 0
    });
  }

  return result;
};

export const getCategoryTreeLazy = async (parentId: number | null = null, status?: string, maxDepth: number = 3) => {
  const buildLazyTree = async (currentParentId: number | null, currentDepth: number): Promise<any[]> => {
    if (currentDepth > maxDepth) {
      return [];
    }

    const where: any = { parentId: currentParentId };
    if (status) {
      where.status = status;
    }

    const categories = await CourseCategory.findAll({
      where,
      order: [['sortOrder', 'ASC'], ['createdAt', 'DESC']]
    });

    const result = [];
    for (const category of categories) {
      const node = category.toJSON();
      if (currentDepth < maxDepth) {
        node.children = await buildLazyTree(category.id, currentDepth + 1);
        node.hasChildren = node.children.length > 0;
      } else {
        const hasChildren = await CourseCategory.count({
          where: { parentId: category.id, ...(status ? { status } : {}) }
        });
        node.hasChildren = hasChildren > 0;
      }
      result.push(node);
    }

    return result;
  };

  return buildLazyTree(parentId, 1);
};

export const updateStatus = async (id: number, status: CourseCategoryStatus) => {
  const category = await CourseCategory.findByPk(id);
  if (!category) {
    throw new AppError('分类不存在', 404);
  }

  category.status = status;
  await category.save();
  return category;
};

export const updateSortOrder = async (items: { id: number; sortOrder: number }[]) => {
  for (const item of items) {
    await CourseCategory.update(
      { sortOrder: item.sortOrder },
      { where: { id: item.id } }
    );
  }
  return { message: '排序更新成功' };
};
