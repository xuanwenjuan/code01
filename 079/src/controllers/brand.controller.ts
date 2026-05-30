import { Response } from 'express'
import { Brand, Product } from '../models'
import { ResponseUtil } from '../utils/response'
import { AppError } from '../middlewares/error.middleware'
import { AuthRequest } from '../middlewares/auth.middleware'
import { Op } from 'sequelize'

export const createBrand = async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, supplierId, logo, description, origin, authorizationLevel, authorizationStartDate, authorizationEndDate, sortOrder } = req.body

  const existingBrand = await Brand.findOne({ where: { name, supplierId } })
  if (existingBrand) {
    throw new AppError('该供货商下已存在同名品牌', 400)
  }

  const brand = await Brand.create({
    name,
    supplierId,
    logo,
    description,
    origin,
    authorizationLevel,
    authorizationStartDate,
    authorizationEndDate,
    sortOrder: sortOrder || 0,
    status: true
  })

  res.json(ResponseUtil.success(brand, '创建成功'))
}

export const updateBrand = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params
  const { name, supplierId, logo, description, origin, authorizationLevel, authorizationStartDate, authorizationEndDate, sortOrder, status } = req.body

  const brand = await Brand.findByPk(id)
  if (!brand) {
    throw new AppError('品牌不存在', 404)
  }

  if (name && supplierId && (name !== brand.name || supplierId !== brand.supplierId)) {
    const existingBrand = await Brand.findOne({ where: { name, supplierId } })
    if (existingBrand && existingBrand.id !== brand.id) {
      throw new AppError('该供货商下已存在同名品牌', 400)
    }
  }

  await brand.update({
    name,
    supplierId,
    logo,
    description,
    origin,
    authorizationLevel,
    authorizationStartDate,
    authorizationEndDate,
    sortOrder,
    status
  })

  res.json(ResponseUtil.success(brand, '更新成功'))
}

export const deleteBrand = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params

  const brand = await Brand.findByPk(id)
  if (!brand) {
    throw new AppError('品牌不存在', 404)
  }

  const productCount = await Product.count({ where: { brandId: id } })
  if (productCount > 0) {
    throw new AppError('该品牌下存在商品，无法删除', 400)
  }

  await brand.destroy()

  res.json(ResponseUtil.success(null, '删除成功'))
}

export const getBrandList = async (req: AuthRequest, res: Response): Promise<void> => {
  const { page = 1, pageSize = 10, supplierId, status, keyword, expiringSoon } = req.query

  const where: any = {}
  if (supplierId) where.supplierId = supplierId
  if (status !== undefined) where.status = status
  if (keyword) {
    where.name = { [Op.like]: `%${keyword}%` }
  }

  if (expiringSoon === 'true') {
    const thirtyDaysLater = new Date()
    thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30)
    where.authorizationEndDate = {
      [Op.between]: [new Date(), thirtyDaysLater]
    }
  }

  const { count, rows } = await Brand.findAndCountAll({
    where,
    include: [{ model: require('../models/Supplier').default, as: 'supplier' }],
    order: [
      ['sortOrder', 'ASC'],
      ['createdAt', 'DESC']
    ],
    offset: (Number(page) - 1) * Number(pageSize),
    limit: Number(pageSize)
  })

  res.json(ResponseUtil.paginated(rows, count, Number(page), Number(pageSize)))
}

export const getBrandDetail = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params

  const brand = await Brand.findByPk(id, {
    include: [
      { model: require('../models/Supplier').default, as: 'supplier' },
      { model: Product, as: 'products', limit: 10 }
    ]
  })

  if (!brand) {
    throw new AppError('品牌不存在', 404)
  }

  res.json(ResponseUtil.success(brand, '获取成功'))
}
