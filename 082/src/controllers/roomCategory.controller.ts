import { Request, Response } from 'express';
import { RoomCategory, Room } from '../models';
import { ResponseUtil } from '../utils/response';
import { Op, Transaction } from 'sequelize';
import sequelize from '../config/database';

const buildTree = (categories: any[], parentId: number | null = null): any[] => {
  const tree: any[] = [];
  for (const category of categories) {
    if (category.parentId === parentId) {
      const children = buildTree(categories, category.id);
      const categoryData = category.toJSON ? category.toJSON() : category;
      if (children.length > 0) {
        categoryData.children = children;
      }
      tree.push(categoryData);
    }
  }
  return tree;
};

const getAllDescendantIds = async (categoryId: number): Promise<number[]> => {
  const categories = await RoomCategory.findAll({ attributes: ['id', 'parentId'] });
  const categoryMap = new Map<number, number[]>();
  for (const cat of categories) {
    const parentId = cat.parentId;
    if (parentId !== null && parentId !== undefined) {
      if (!categoryMap.has(parentId)) categoryMap.set(parentId, []);
      categoryMap.get(parentId)!.push(cat.id);
    }
  }
  const getAllIds = (id: number): number[] => {
    let ids: number[] = [id];
    const children = categoryMap.get(id) || [];
    for (const childId of children) {
      ids = ids.concat(getAllIds(childId));
    }
    return ids;
  };
  return getAllIds(categoryId);
};

export const createCategory = async (req: Request, res: Response) => {
  const { name, parentId, sort, description, icon } = req.body;
  let level = 1;
  if (parentId) {
    const parent = await RoomCategory.findByPk(parentId);
    if (!parent) return res.status(400).json(ResponseUtil.badRequest('父分类不存在'));
    level = parent.level + 1;
  }
  const category = await RoomCategory.create({ name, parentId: parentId || null, level, sort: sort || 0, description, status: true, icon });
  res.status(201).json(ResponseUtil.success(category, '创建分类成功'));
};

export const getCategoryTree = async (req: Request, res: Response) => {
  const { status } = req.query;
  const where: any = {};
  if (status !== undefined) where.status = status === 'true';
  const categories = await RoomCategory.findAll({ where, order: [['sort', 'ASC'], ['id', 'ASC']] });
  const tree = buildTree(categories);
  res.json(ResponseUtil.success(tree));
};

export const getCategoryById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const category = await RoomCategory.findByPk(id);
  if (!category) return res.status(404).json(ResponseUtil.notFound('分类不存在'));
  res.json(ResponseUtil.success(category));
};

export const updateCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, parentId, sort, description, status, icon } = req.body;
  const category = await RoomCategory.findByPk(id);
  if (!category) return res.status(404).json(ResponseUtil.notFound('分类不存在'));
  if (parentId !== undefined) {
    if (parentId === parseInt(id)) return res.status(400).json(ResponseUtil.badRequest('不能将自己设为父分类'));
    const allDescendantIds = await getAllDescendantIds(parseInt(id));
    if (allDescendantIds.includes(parentId)) return res.status(400).json(ResponseUtil.badRequest('不能将子分类设为父分类'));
    if (parentId === null) {
      category.level = 1;
    } else {
      const parent = await RoomCategory.findByPk(parentId);
      if (!parent) return res.status(400).json(ResponseUtil.badRequest('父分类不存在'));
      category.level = parent.level + 1;
    }
    category.parentId = parentId;
  }
  if (name !== undefined) category.name = name;
  if (sort !== undefined) category.sort = sort;
  if (description !== undefined) category.description = description;
  if (status !== undefined) category.status = status;
  if (icon !== undefined) category.icon = icon;
  await category.save();
  res.json(ResponseUtil.success(category, '更新分类成功'));
};

export const deleteCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  const t = await sequelize.transaction();
  try {
    const category = await RoomCategory.findByPk(id, { transaction: t });
    if (!category) {
      await t.rollback();
      return res.status(404).json(ResponseUtil.notFound('分类不存在'));
    }
    const childCount = await RoomCategory.count({ where: { parentId: id }, transaction: t });
    if (childCount > 0) {
      await t.rollback();
      return res.status(400).json(ResponseUtil.badRequest('该分类下存在子分类，无法删除'));
    }
    const roomCount = await Room.count({ where: { categoryId: id }, transaction: t });
    if (roomCount > 0) {
      await t.rollback();
      return res.status(400).json(ResponseUtil.badRequest('该分类下存在房源，无法删除'));
    }
    await category.destroy({ transaction: t });
    await t.commit();
    res.json(ResponseUtil.success(null, '删除分类成功'));
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

export const toggleCategoryStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const t = await sequelize.transaction();
  try {
    const category = await RoomCategory.findByPk(id, { transaction: t });
    if (!category) {
      await t.rollback();
      return res.status(404).json(ResponseUtil.notFound('分类不存在'));
    }
    if (status === false) {
      const allDescendantIds = await getAllDescendantIds(parseInt(id));
      const roomCount = await Room.count({ where: { categoryId: { [Op.in]: allDescendantIds } }, transaction: t });
      if (roomCount > 0) {
        await t.rollback();
        return res.status(400).json(ResponseUtil.badRequest('该分类或其子分类下存在房源，无法下架'));
      }
      await RoomCategory.update({ status: false }, { where: { id: { [Op.in]: allDescendantIds } }, transaction: t });
    } else {
      category.status = true;
      await category.save({ transaction: t });
    }
    await t.commit();
    res.json(ResponseUtil.success(null, status ? '分类已启用' : '分类已下架'));
  } catch (error) {
    await t.rollback();
    throw error;
  }
};
