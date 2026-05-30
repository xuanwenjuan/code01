import { Request, Response } from 'express';
import { MaterialCategory, sequelize } from '../models';
import { success, badRequest, notFound } from '../utils/response';
import { CategoryStatus } from '../types';
import { Op } from 'sequelize';

async function getAllCategoryIds(parentId: number | null): Promise<number[]> {
  const categories = await MaterialCategory.findAll({
    where: { parentId },
    attributes: ['id']
  });

  let ids: number[] = categories.map(c => c.id);

  for (const cat of categories) {
    const childIds = await getAllCategoryIds(cat.id);
    ids = [...ids, ...childIds];
  }

  return ids;
}

export async function createCategory(req: Request, res: Response) {
  const { name, code, parentId, sort, description } = req.body;

  const existing = await MaterialCategory.findOne({ where: { code } });
  if (existing) {
    return res.status(400).json(badRequest('类目编码已存在'));
  }

  let level = 1;
  if (parentId) {
    const parent = await MaterialCategory.findByPk(parentId);
    if (parent) {
      level = parent.level + 1;
    } else {
      return res.status(400).json(badRequest('父级类目不存在'));
    }
  }

  const category = await MaterialCategory.create({
    name,
    code,
    parentId,
    level,
    sort: sort || 0,
    status: CategoryStatus.ACTIVE,
    description
  });

  res.json(success(category, '创建成功'));
}

export async function updateCategory(req: Request, res: Response) {
  const { id } = req.params;
  const { name, sort, description, parentId } = req.body;

  const category = await MaterialCategory.findByPk(id);
  if (!category) {
    return res.status(404).json(notFound('类目不存在'));
  }

  let level = category.level;
  if (parentId !== undefined) {
    if (parentId === null) {
      level = 1;
    } else {
      const parent = await MaterialCategory.findByPk(parentId);
      if (!parent) {
        return res.status(400).json(badRequest('父级类目不存在'));
      }
      level = parent.level + 1;
    }
  }

  await category.update({ name, sort, description, parentId, level });
  res.json(success(category, '更新成功'));
}

export async function sealCategory(req: Request, res: Response) {
  const { id } = req.params;

  const category = await MaterialCategory.findByPk(id);
  if (!category) {
    return res.status(404).json(notFound('类目不存在'));
  }

  const t = await sequelize.transaction();
  try {
    const allChildIds = await getAllCategoryIds(Number(id));
    const allIds = [Number(id), ...allChildIds];

    await MaterialCategory.update(
      { status: CategoryStatus.SEALED },
      { where: { id: { [Op.in]: allIds } }, transaction: t }
    );

    await t.commit();
    res.json(success({ sealedCount: allIds.length }, '类目及子类目封存成功'));
  } catch (error) {
    await t.rollback();
    throw error;
  }
}

export async function activateCategory(req: Request, res: Response) {
  const { id } = req.params;

  const category = await MaterialCategory.findByPk(id);
  if (!category) {
    return res.status(404).json(notFound('类目不存在'));
  }

  if (category.parentId) {
    const parent = await MaterialCategory.findByPk(category.parentId);
    if (parent && parent.status === CategoryStatus.SEALED) {
      return res.status(400).json(badRequest('父级类目处于封存状态，请先启封父级类目'));
    }
  }

  const t = await sequelize.transaction();
  try {
    const allChildIds = await getAllCategoryIds(Number(id));
    const allIds = [Number(id), ...allChildIds];

    await MaterialCategory.update(
      { status: CategoryStatus.ACTIVE },
      { where: { id: { [Op.in]: allIds } }, transaction: t }
    );

    await t.commit();
    res.json(success({ activatedCount: allIds.length }, '类目及子类目启用成功'));
  } catch (error) {
    await t.rollback();
    throw error;
  }
}

export async function deleteCategory(req: Request, res: Response) {
  const { id } = req.params;

  const hasChildren = await MaterialCategory.findOne({ where: { parentId: id } });
  if (hasChildren) {
    return res.status(400).json(badRequest('该类目下存在子类目，无法删除'));
  }

  const count = await MaterialCategory.count({ where: { id } });
  if (count === 0) {
    return res.status(404).json(notFound('类目不存在'));
  }

  await MaterialCategory.destroy({ where: { id } });
  res.json(success(null, '删除成功'));
}

export async function getCategoryTree(req: Request, res: Response) {
  const { status, includeSealed = 'false' } = req.query;

  const where: any = {};
  if (status) {
    where.status = status;
  } else if (includeSealed === 'false') {
    where.status = CategoryStatus.ACTIVE;
  }

  const categories = await MaterialCategory.findAll({
    where,
    order: [['sort', 'ASC'], ['id', 'ASC']]
  });

  const buildTree = (parentId: number | null = null, level: number = 0): any[] => {
    return categories
      .filter(c => c.parentId === parentId)
      .map(c => ({
        id: c.id,
        name: c.name,
        code: c.code,
        parentId: c.parentId,
        level: c.level,
        sort: c.sort,
        status: c.status,
        description: c.description,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        children: buildTree(c.id, level + 1)
      }));
  };

  const tree = buildTree();

  res.json(success({
    tree,
    totalCount: categories.length
  }));
}

export async function getCategoryList(req: Request, res: Response) {
  const { status, keyword, page = 1, pageSize = 10 } = req.query;

  const where: any = {};
  if (status) {
    where.status = status;
  }
  if (keyword) {
    where[Op.or] = [
      { name: { [Op.like]: `%${keyword}%` } },
      { code: { [Op.like]: `%${keyword}%` } }
    ];
  }

  const { count, rows } = await MaterialCategory.findAndCountAll({
    where,
    order: [['level', 'ASC'], ['sort', 'ASC']],
    limit: Number(pageSize),
    offset: (Number(page) - 1) * Number(pageSize)
  });

  res.json(success({
    list: rows,
    total: count,
    page: Number(page),
    pageSize: Number(pageSize)
  }));
}

export async function getCategoryDetail(req: Request, res: Response) {
  const { id } = req.params;

  const category = await MaterialCategory.findByPk(id, {
    include: [{ model: MaterialCategory, as: 'parent' }]
  });

  if (!category) {
    return res.status(404).json(notFound('类目不存在'));
  }

  const childCount = await MaterialCategory.count({ where: { parentId: id } });

  res.json(success({
    ...category.toJSON(),
    childCount
  }));
}

export async function getCategoryPath(req: Request, res: Response) {
  const { id } = req.params;

  const category = await MaterialCategory.findByPk(id);
  if (!category) {
    return res.status(404).json(notFound('类目不存在'));
  }

  const path: any[] = [];
  let currentId: number | null = Number(id);

  while (currentId) {
    const cat = await MaterialCategory.findByPk(currentId, {
      attributes: ['id', 'name', 'code', 'parentId', 'level']
    });
    if (cat) {
      path.unshift(cat);
      currentId = cat.parentId;
    } else {
      break;
    }
  }

  res.json(success(path));
}
