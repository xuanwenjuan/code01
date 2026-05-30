import { Request, Response } from 'express';
import { Op, Transaction } from 'sequelize';
import { ApiResponse } from '../utils/response';
import Category from '../database/models/Category.model';
import Equipment from '../database/models/Equipment.model';
import { BadRequestException, NotFoundException } from '../exceptions/http.exception';
import { sequelize } from '../database';

const getAllChildIds = async (parentId: number): Promise<number[]> => {
  const childIds: number[] = [];
  const findChildren = async (pid: number) => {
    const children = await Category.findAll({
      where: { parentId: pid },
      attributes: ['id']
    });
    for (const child of children) {
      childIds.push(child.id);
      await findChildren(child.id);
    }
  };
  await findChildren(parentId);
  return childIds;
};

export const createCategory = async (req: Request, res: Response) => {
  const { name, parentId, sort, icon, description } = req.body;

  if (!name || !name.trim()) {
    throw new BadRequestException('类目名称不能为空');
  }

  if (name.length > 50) {
    throw new BadRequestException('类目名称不能超过50个字符');
  }

  let level = 1;
  if (parentId) {
    const parentCategory = await Category.findByPk(parentId);
    if (!parentCategory) {
      throw new BadRequestException('父级类目不存在');
    }
    level = parentCategory.level + 1;
  }

  const existingCategory = await Category.findOne({
    where: {
      name,
      parentId: parentId || null
    }
  });

  if (existingCategory) {
    throw new BadRequestException('同级下已存在相同名称的类目');
  }

  const category = await Category.create({
    name: name.trim(),
    parentId: parentId || null,
    level,
    sort: sort || 0,
    icon,
    description,
    status: 1
  });

  res.json(ApiResponse.success(category, '类目创建成功'));
};

export const updateCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, parentId, sort, icon, description, status } = req.body;

  const categoryId = parseInt(id);
  if (isNaN(categoryId)) {
    throw new BadRequestException('无效的类目ID');
  }

  const category = await Category.findByPk(categoryId);
  if (!category) {
    throw new NotFoundException('类目不存在');
  }

  if (parentId !== undefined && parentId !== null && parentId === categoryId) {
    throw new BadRequestException('不能将自己设为父级类目');
  }

  if (parentId !== undefined && parentId !== null) {
    const childIds = await getAllChildIds(categoryId);
    if (childIds.includes(parentId)) {
      throw new BadRequestException('不能将子类目设为父级类目');
    }
  }

  let level = category.level;
  if (parentId !== undefined) {
    if (parentId === null) {
      level = 1;
    } else {
      const parentCategory = await Category.findByPk(parentId);
      if (!parentCategory) {
        throw new BadRequestException('父级类目不存在');
      }
      level = parentCategory.level + 1;
    }
  }

  if (name && name.trim()) {
    const existingCategory = await Category.findOne({
      where: {
        name: name.trim(),
        parentId: parentId !== undefined ? parentId || null : category.parentId,
        id: { [Op.ne]: categoryId }
      }
    });

    if (existingCategory) {
      throw new BadRequestException('同级下已存在相同名称的类目');
    }
  }

  await category.update({
    name: name?.trim() || category.name,
    parentId: parentId !== undefined ? parentId || null : category.parentId,
    level,
    sort: sort !== undefined ? sort : category.sort,
    icon: icon !== undefined ? icon : category.icon,
    description: description !== undefined ? description : category.description,
    status: status !== undefined ? status : category.status
  });

  res.json(ApiResponse.success(category, '类目更新成功'));
};

export const deleteCategory = async (req: Request, res: Response) => {
  const { id } = req.params;

  const categoryId = parseInt(id);
  if (isNaN(categoryId)) {
    throw new BadRequestException('无效的类目ID');
  }

  const category = await Category.findByPk(categoryId);
  if (!category) {
    throw new NotFoundException('类目不存在');
  }

  await sequelize.transaction(async (t: Transaction) => {
    const childCount = await Category.count({
      where: { parentId: categoryId },
      transaction: t
    });
    if (childCount > 0) {
      throw new BadRequestException(`该类目下存在 ${childCount} 个子类目，无法删除`);
    }

    const equipmentCount = await Equipment.count({
      where: { categoryId },
      transaction: t
    });
    if (equipmentCount > 0) {
      throw new BadRequestException(`该类目下存在 ${equipmentCount} 个设备，无法删除`);
    }

    await category.destroy({ transaction: t });
  });

  res.json(ApiResponse.success(null, '类目删除成功'));
};

export const getCategory = async (req: Request, res: Response) => {
  const { id } = req.params;

  const categoryId = parseInt(id);
  if (isNaN(categoryId)) {
    throw new BadRequestException('无效的类目ID');
  }

  const category = await Category.findByPk(categoryId, {
    include: [{
      model: Category,
      as: 'children',
      separate: true,
      order: [['sort', 'ASC']]
    }]
  });

  if (!category) {
    throw new NotFoundException('类目不存在');
  }

  res.json(ApiResponse.success(category));
};

export const getCategoryList = async (req: Request, res: Response) => {
  const { name, status, page = 1, pageSize = 10 } = req.query;

  const pageNum = parseInt(page as string);
  const size = parseInt(pageSize as string);

  if (isNaN(pageNum) || pageNum < 1) {
    throw new BadRequestException('无效的页码');
  }
  if (isNaN(size) || size < 1 || size > 100) {
    throw new BadRequestException('无效的每页数量');
  }

  const where: any = {};
  if (name) {
    where.name = { [Op.like]: `%${name}%` };
  }
  if (status !== undefined && status !== '') {
    const statusVal = parseInt(status as string);
    if (statusVal === 0 || statusVal === 1) {
      where.status = statusVal;
    }
  }

  const { count, rows } = await Category.findAndCountAll({
    where,
    order: [['sort', 'ASC'], ['createdAt', 'DESC']],
    offset: (pageNum - 1) * size,
    limit: size
  });

  res.json(ApiResponse.successPage(rows, count, pageNum, size));
};

export const getCategoryTree = async (req: Request, res: Response) => {
  const { status = 1 } = req.query;

  const where: any = {};
  if (status !== undefined && status !== '') {
    const statusVal = parseInt(status as string);
    if (statusVal === 0 || statusVal === 1) {
      where.status = statusVal;
    }
  }

  const allCategories = await Category.findAll({
    where,
    order: [['sort', 'ASC'], ['createdAt', 'DESC']],
    raw: true
  });

  const buildTree = (parentId: number | null): any[] => {
    return allCategories
      .filter(cat => cat.parentId === parentId)
      .map(cat => ({
        id: cat.id,
        name: cat.name,
        parentId: cat.parentId,
        level: cat.level,
        sort: cat.sort,
        icon: cat.icon,
        description: cat.description,
        status: cat.status,
        children: buildTree(cat.id)
      }));
  };

  const tree = buildTree(null);

  res.json(ApiResponse.success(tree, '获取成功'));
};

export const batchUpdateStatus = async (req: Request, res: Response) => {
  const { ids, status } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    throw new BadRequestException('请选择要操作的类目');
  }

  if (status !== 0 && status !== 1) {
    throw new BadRequestException('无效的状态值');
  }

  await sequelize.transaction(async (t: Transaction) => {
    for (const id of ids) {
      const category = await Category.findByPk(id, { transaction: t });
      if (category) {
        const childIds = await getAllChildIds(id);
        const allIds = [id, ...childIds];
        
        await Category.update(
          { status },
          { where: { id: { [Op.in]: allIds } }, transaction: t }
        );
      }
    }
  });

  res.json(ApiResponse.success(null, '批量更新状态成功'));
};
