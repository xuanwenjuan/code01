import { Response } from 'express'
import { Product, Category, Brand, Supplier } from '../models'
import { ResponseUtil } from '../utils/response'
import { AppError, NotFoundError, BadRequestError } from '../middlewares/error.middleware'
import { AuthRequest } from '../middlewares/auth.middleware'
import { CategoryType, CooperationStatus, OperationModule, OperationAction } from '../types'
import { Op, fn, col } from 'sequelize'
import { StockService } from '../services/stock.service'
import { logOperation } from '../middlewares/log.middleware'

export const createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  const startTime = Date.now()
  const { name, code, categoryId, brandId, supplierId, specification, unit, purchasePrice, wholesalePrice, retailPrice, stock, minOrderQuantity, image, images, description, isHot, isNew, sortOrder } = req.body

  try {
    const existingProduct = await Product.findOne({ where: { code } })
    if (existingProduct) {
      throw new BadRequestError('商品编码已存在')
    }

    const category = await Category.findByPk(categoryId)
    if (!category) {
      throw new BadRequestError('类目不存在')
    }

    const brand = await Brand.findByPk(brandId)
    if (!brand) {
      throw new BadRequestError('品牌不存在')
    }

    const supplier = await Supplier.findByPk(supplierId)
    if (!supplier) {
      throw new BadRequestError('供货商不存在')
    }

    const product = await Product.create({
      name,
      code,
      categoryId,
      brandId,
      supplierId,
      specification,
      unit: unit || '件',
      purchasePrice,
      wholesalePrice,
      retailPrice,
      stock: stock || 0,
      lockedStock: 0,
      minOrderQuantity: minOrderQuantity || 1,
      image,
      images,
      description,
      isHot: isHot || false,
      isNew: isNew || false,
      status: true,
      sortOrder: sortOrder || 0
    })

    await logOperation(OperationModule.PRODUCT, OperationAction.CREATE, req, true, {
      params: req.body,
      result: JSON.stringify({ productId: product.id }),
      duration: Date.now() - startTime
    })

    res.json(ResponseUtil.success(product, '创建成功'))
  } catch (error) {
    await logOperation(OperationModule.PRODUCT, OperationAction.CREATE, req, false, {
      params: req.body,
      errorMsg: error instanceof Error ? error.message : '创建失败',
      duration: Date.now() - startTime
    })
    throw error
  }
}

export const updateProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  const startTime = Date.now()
  const { id } = req.params
  const updateData = req.body

  try {
    const product = await Product.findByPk(id)
    if (!product) {
      throw new NotFoundError('商品不存在')
    }

    if (updateData.code && updateData.code !== product.code) {
      const existingProduct = await Product.findOne({ where: { code: updateData.code } })
      if (existingProduct) {
        throw new BadRequestError('商品编码已存在')
      }
    }

    await product.update(updateData)

    await logOperation(OperationModule.PRODUCT, OperationAction.UPDATE, req, true, {
      params: { id, ...updateData },
      result: JSON.stringify({ productId: product.id }),
      duration: Date.now() - startTime
    })

    res.json(ResponseUtil.success(product, '更新成功'))
  } catch (error) {
    await logOperation(OperationModule.PRODUCT, OperationAction.UPDATE, req, false, {
      params: { id, ...updateData },
      errorMsg: error instanceof Error ? error.message : '更新失败',
      duration: Date.now() - startTime
    })
    throw error
  }
}

export const deleteProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  const startTime = Date.now()
  const { id } = req.params

  try {
    const product = await Product.findByPk(id)
    if (!product) {
      throw new NotFoundError('商品不存在')
    }

    await product.destroy()

    await logOperation(OperationModule.PRODUCT, OperationAction.CREATE, req, true, {
      params: { id },
      result: JSON.stringify({ productId: id }),
      duration: Date.now() - startTime
    })

    res.json(ResponseUtil.success(null, '删除成功'))
  } catch (error) {
    await logOperation(OperationModule.PRODUCT, OperationAction.CREATE, req, false, {
      params: { id },
      errorMsg: error instanceof Error ? error.message : '删除失败',
      duration: Date.now() - startTime
    })
    throw error
  }
}

export const getProductList = async (req: AuthRequest, res: Response): Promise<void> => {
  const {
    page = 1,
    pageSize = 10,
    categoryId,
    brandId,
    supplierId,
    categoryType,
    status,
    isHot,
    isNew,
    keyword,
    minPrice,
    maxPrice,
    cooperationStatus,
    sortBy,
    sortOrder
  } = req.query

  const where: any = {}

  if (categoryId) where.categoryId = categoryId
  if (brandId) where.brandId = brandId
  if (supplierId) where.supplierId = supplierId
  if (status !== undefined) where.status = status
  if (isHot !== undefined) where.isHot = isHot
  if (isNew !== undefined) where.isNew = isNew

  if (keyword) {
    where[Op.or] = [
      { name: { [Op.like]: `%${keyword}%` } },
      { code: { [Op.like]: `%${keyword}%` } }
    ]
  }

  if (minPrice || maxPrice) {
    where.wholesalePrice = {}
    if (minPrice) where.wholesalePrice[Op.gte] = Number(minPrice)
    if (maxPrice) where.wholesalePrice[Op.lte] = Number(maxPrice)
  }

  const include: any[] = [
    { model: Category, as: 'category' },
    { model: Brand, as: 'brand' },
    { model: Supplier, as: 'supplier' }
  ]

  if (categoryType) {
    include[0].where = { type: categoryType }
  }

  if (cooperationStatus) {
    const now = new Date()
    const supplierWhere: any = {}

    switch (cooperationStatus) {
      case CooperationStatus.ACTIVE:
        supplierWhere[Op.or] = [
          { cooperationEndDate: { [Op.gt]: now } },
          { cooperationEndDate: null }
        ]
        supplierWhere.status = true
        break
      case CooperationStatus.EXPIRING_SOON:
        const thirtyDaysLater = new Date(now)
        thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30)
        supplierWhere.cooperationEndDate = {
          [Op.between]: [now, thirtyDaysLater]
        }
        supplierWhere.status = true
        break
      case CooperationStatus.EXPIRED:
        supplierWhere.cooperationEndDate = { [Op.lte]: now }
        break
      case CooperationStatus.SUSPENDED:
        supplierWhere.status = false
        break
    }

    include[2].where = supplierWhere
  }

  const order: any[] = []
  if (sortBy) {
    order.push([sortBy as string, sortOrder === 'desc' ? 'DESC' : 'ASC'])
  } else {
    order.push(['sortOrder', 'ASC'], ['createdAt', 'DESC'])
  }

  const { count, rows } = await Product.findAndCountAll({
    where,
    include,
    order,
    offset: (Number(page) - 1) * Number(pageSize),
    limit: Number(pageSize),
    distinct: true
  })

  const products = rows.map(product => {
    const productJSON = product.toJSON()
    productJSON.availableStock = product.stock - product.lockedStock
    return productJSON
  })

  res.json(ResponseUtil.paginated(products, count, Number(page), Number(pageSize)))
}

export const getProductDetail = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params

  const product = await Product.findByPk(id, {
    include: [
      { model: Category, as: 'category' },
      { model: Brand, as: 'brand' },
      { model: Supplier, as: 'supplier' }
    ]
  })

  if (!product) {
    throw new NotFoundError('商品不存在')
  }

  const productJSON = product.toJSON()
  productJSON.availableStock = product.stock - product.lockedStock

  res.json(ResponseUtil.success(productJSON, '获取成功'))
}

export const updateStock = async (req: AuthRequest, res: Response): Promise<void> => {
  const startTime = Date.now()
  const { id } = req.params
  const { stock, operatorId } = req.body

  try {
    await StockService.addStock(Number(id), Number(stock), req.user?.userId || Number(operatorId))

    await logOperation(OperationModule.STOCK, OperationAction.UPDATE, req, true, {
      params: { id, stock },
      result: JSON.stringify({ productId: id, stock }),
      duration: Date.now() - startTime
    })

    res.json(ResponseUtil.success(null, '库存更新成功'))
  } catch (error) {
    await logOperation(OperationModule.STOCK, OperationAction.UPDATE, req, false, {
      params: { id, stock },
      errorMsg: error instanceof Error ? error.message : '库存更新失败',
      duration: Date.now() - startTime
    })
    throw error
  }
}

export const getProductStock = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params

  const stockInfo = await StockService.getProductStock(Number(id))

  res.json(ResponseUtil.success(stockInfo, '获取成功'))
}
