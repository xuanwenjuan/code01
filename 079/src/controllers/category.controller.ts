import { Response } from 'express'
import { Category, Product } from '../models'
import { ResponseUtil } from '../utils/response'
import { AppError } from '../middlewares/error.middleware'
import { AuthRequest } from '../middlewares/auth.middleware'
import { CategoryType, Season } from '../types'
import { Op, col, fn } from 'sequelize'

const buildTree = (categories: Category[], parentId: number | null = null): any[] => {
  return categories
    .filter((cat) => cat.parentId === parentId)
    .map((cat) => ({
      ...cat.toJSON(),
      children: buildTree(categories, cat.id)
    }))
}

const getAllChildCategoryIds = async (parentId: number): Promise<number[]> => {
  const childIds: number[] = []
  const children = await Category.findAll({ where: { parentId } })
  
  for (const child of children) {
    childIds.push(child.id)
    const grandChildIds = await getAllChildCategoryIds(child.id)
    childIds.push(...grandChildIds)
  }
  
  return childIds
}

export const createCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, type, parentId, sortOrder, icon, description, season } = req.body

  let level = 1
  if (parentId) {
    const parent = await Category.findByPk(parentId)
    if (!parent) {
      throw new AppError('父级分类不存在', 400)
    }
    level = parent.level + 1
  }

  const category = await Category.create({
    name,
    type,
    parentId,
    level,
    sortOrder: sortOrder || 0,
    icon,
    description,
    season: season || Season.ALL,
    isActive: true
  })

  res.json(ResponseUtil.success(category, '创建成功'))
}

export const updateCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params
  const { name, type, parentId, sortOrder, icon, description, season, isActive } = req.body

  const category = await Category.findByPk(id)
  if (!category) {
    throw new AppError('分类不存在', 404)
  }

  let level = category.level
  if (parentId !== undefined && parentId !== category.parentId) {
    if (parentId === null) {
      level = 1
    } else {
      const parent = await Category.findByPk(parentId)
      if (!parent) {
        throw new AppError('父级分类不存在', 400)
      }
      level = parent.level + 1
    }
  }

  await category.update({
    name,
    type,
    parentId,
    level,
    sortOrder,
    icon,
    description,
    season,
    isActive
  })

  res.json(ResponseUtil.success(category, '更新成功'))
}

export const deleteCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params

  const category = await Category.findByPk(id)
  if (!category) {
    throw new AppError('分类不存在', 404)
  }

  const allChildIds = await getAllChildCategoryIds(Number(id))
  const allCategoryIds = [Number(id), ...allChildIds]

  if (allChildIds.length > 0) {
    throw new AppError(`该分类下存在 ${allChildIds.length} 个子分类，请先删除子分类`, 400)
  }

  const productCount = await Product.count({
    where: {
      categoryId: {
        [Op.in]: allCategoryIds
      }
    }
  })

  if (productCount > 0) {
    throw new AppError(`该分类及其子分类下共存在 ${productCount} 个商品，请先删除商品`, 400)
  }

  await category.destroy()

  res.json(ResponseUtil.success({
    deletedId: id,
    childCount: allChildIds.length,
    productCount: 0
  }, '删除成功'))
}

export const getCategoryTree = async (req: AuthRequest, res: Response): Promise<void> => {
  const { type, season, isActive, parentId } = req.query

  const where: any = {}
  if (type) where.type = type
  if (season) where.season = season
  if (isActive !== undefined) where.isActive = isActive

  const categories = await Category.findAll({
    where,
    order: [
      ['level', 'ASC'],
      ['sortOrder', 'ASC']
    ],
    include: [{
      model: Product,
      as: 'products',
      attributes: ['id', 'name', 'code'],
      limit: 5
    }]
  })

  const rootParentId = parentId ? Number(parentId) : null
  const tree = buildTree(categories, rootParentId)

  res.json(ResponseUtil.success({
    total: categories.length,
    tree,
    filters: { type, season, isActive, parentId }
  }, '获取成功'))
}

export const getCategoryList = async (req: AuthRequest, res: Response): Promise<void> => {
  const { page = 1, pageSize = 10, type, isActive, keyword } = req.query

  const where: any = {}
  if (type) where.type = type
  if (isActive !== undefined) where.isActive = isActive
  if (keyword) {
    where.name = { [Op.like]: `%${keyword}%` }
  }

  const { count, rows } = await Category.findAndCountAll({
    where,
    order: [
      ['sortOrder', 'ASC'],
      ['createdAt', 'DESC']
    ],
    offset: (Number(page) - 1) * Number(pageSize),
    limit: Number(pageSize)
  })

  res.json(ResponseUtil.paginated(rows, count, Number(page), Number(pageSize)))
}

export const getCategoryDetail = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params

  const category = await Category.findByPk(id, {
    include: [{ model: Category, as: 'parent' }]
  })

  if (!category) {
    throw new AppError('分类不存在', 404)
  }

  res.json(ResponseUtil.success(category, '获取成功'))
}
