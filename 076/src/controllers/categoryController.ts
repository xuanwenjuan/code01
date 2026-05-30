import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { Category } from '../models';
import { ResponseUtil } from '../utils/response';
import { BadRequestException, NotFoundException } from '../exceptions/HttpException';
import { CategoryStatus } from '../types';

const buildTree = (categories: any[], parentId: number | null = null): any[] => {
  return categories
    .filter(cat => cat.parentId === parentId)
    .map(cat => ({
      ...cat.toJSON(),
      children: buildTree(categories, cat.id)
    }));
};

export const createCategory = async (req: Request, res: Response) => {
  const { name, parentId, icon, sort, description } = req.body;

  if (!name) {
    throw new BadRequestException('分类名称不能为空');
  }

  const existingCategory = await Category.findOne({ where: { name } });
  if (existingCategory) {
    throw new BadRequestException('分类名称已存在');
  }

  let level = 1;
  if (parentId && parentId > 0) {
    const parent = await Category.findByPk(parentId);
    if (!parent) {
      throw new BadRequestException('父分类不存在');
    }
    level = parent.level + 1;
  }

  const category = await Category.create({
    name,
    parentId: parentId || 0,
    level,
    icon,
    sort: sort || 0,
    status: CategoryStatus.ACTIVE,
    description
  });

  res.status(201).json(ResponseUtil.created(category, '分类创建成功'));
};

export const updateCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, parentId, icon, sort, status, description } = req.body;

  const category = await Category.findByPk(id);
  if (!category) {
    throw new NotFoundException('分类不存在');
  }

  if (name) {
    const existingCategory = await Category.findOne({
      where: { name, id: { [Op.ne]: id } }
    });
    if (existingCategory) {
      throw new BadRequestException('分类名称已存在');
    }
  }

  let level = category.level;
  if (parentId !== undefined && parentId !== category.parentId) {
    if (parentId > 0) {
      const parent = await Category.findByPk(parentId);
      if (!parent) {
        throw new BadRequestException('父分类不存在');
      }
      level = parent.level + 1;
    } else {
      level = 1;
    }
  }

  await category.update({
    name: name || category.name,
    parentId: parentId !== undefined ? parentId : category.parentId,
    level,
    icon: icon !== undefined ? icon : category.icon,
    sort: sort !== undefined ? sort : category.sort,
    status: status || category.status,
    description: description !== undefined ? description : category.description
  });

  res.json(ResponseUtil.success(category, '分类更新成功'));
};

export const deleteCategory = async (req: Request, res: Response) => {
  const { id } = req.params;

  const category = await Category.findByPk(id);
  if (!category) {
    throw new NotFoundException('分类不存在');
  }

  const childCount = await Category.count({ where: { parentId: id } });
  if (childCount > 0) {
    throw new BadRequestException('该分类下还有子分类，无法删除');
  }

  await category.destroy();

  res.json(ResponseUtil.success(null, '分类删除成功'));
};

export const getCategory = async (req: Request, res: Response) => {
  const { id } = req.params;

  const category = await Category.findByPk(id, {
    include: [{ model: Category, as: 'parent' }]
  });
  if (!category) {
    throw new NotFoundException('分类不存在');
  }

  res.json(ResponseUtil.success(category));
};

export const getCategoryList = async (req: Request, res: Response) => {
  const { status, keyword } = req.query;

  const where: any = {};
  if (status) {
    where.status = status;
  }
  if (keyword) {
    where.name = { [Op.like]: `%${keyword}%` };
  }

  const categories = await Category.findAll({
    where,
    order: [['sort', 'ASC'], ['createdAt', 'DESC']]
  });

  res.json(ResponseUtil.success(categories));
};

export const getCategoryTree = async (req: Request, res: Response) => {
  const { status = CategoryStatus.ACTIVE } = req.query;

  const where: any = {};
  if (status === 'all') {
    // 不添加状态过滤
  } else {
    where.status = status;
  }

  const categories = await Category.findAll({
    where,
    order: [['sort', 'ASC'], ['createdAt', 'DESC']]
  });

  const tree = buildTree(categories, 0);

  res.json(ResponseUtil.success(tree));
};

export const getCategoryTreeLazy = async (req: Request, res: Response) => {
  const { parentId = 0, status = CategoryStatus.ACTIVE } = req.query;

  const where: any = {
    parentId: Number(parentId)
  };
  
  if (status !== 'all') {
    where.status = status;
  }

  const categories = await Category.findAll({
    where,
    order: [['sort', 'ASC'], ['createdAt', 'DESC']]
  });

  const categoryIds = categories.map(c => c.id);
  
  const childCounts = await Category.findAll({
    where: {
      parentId: { [Op.in]: categoryIds }
    },
    attributes: ['parentId', [fn('COUNT', 'id'), 'count']],
    group: ['parentId']
  });

  const childCountMap = new Map();
  childCounts.forEach((item: any) => {
    childCountMap.set(item.parentId, item.dataValues.count);
  });

  const result = categories.map(category => ({
    ...category.toJSON(),
    hasChildren: childCountMap.get(category.id) > 0
  }));

  res.json(ResponseUtil.success(result));
};
