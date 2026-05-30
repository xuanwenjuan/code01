import { Response } from 'express'
import { Supplier, Brand, Product } from '../models'
import { ResponseUtil } from '../utils/response'
import { AppError } from '../middlewares/error.middleware'
import { AuthRequest } from '../middlewares/auth.middleware'
import { Op } from 'sequelize'

export const createSupplier = async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, contactPerson, phone, email, address, licenseNumber, businessLicense, authorizationCert, cooperationStartDate, cooperationEndDate, minOrderAmount, remarks } = req.body

  const existingSupplier = await Supplier.findOne({ where: { name } })
  if (existingSupplier) {
    throw new AppError('供货商名称已存在', 400)
  }

  const supplier = await Supplier.create({
    name,
    contactPerson,
    phone,
    email,
    address,
    licenseNumber,
    businessLicense,
    authorizationCert,
    cooperationStartDate,
    cooperationEndDate,
    minOrderAmount: minOrderAmount || 0,
    rating: 5.0,
    status: true,
    remarks
  })

  res.json(ResponseUtil.success(supplier, '创建成功'))
}

export const updateSupplier = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params
  const { name, contactPerson, phone, email, address, licenseNumber, businessLicense, authorizationCert, cooperationStartDate, cooperationEndDate, minOrderAmount, rating, status, remarks } = req.body

  const supplier = await Supplier.findByPk(id)
  if (!supplier) {
    throw new AppError('供货商不存在', 404)
  }

  if (name && name !== supplier.name) {
    const existingSupplier = await Supplier.findOne({ where: { name } })
    if (existingSupplier) {
      throw new AppError('供货商名称已存在', 400)
    }
  }

  await supplier.update({
    name,
    contactPerson,
    phone,
    email,
    address,
    licenseNumber,
    businessLicense,
    authorizationCert,
    cooperationStartDate,
    cooperationEndDate,
    minOrderAmount,
    rating,
    status,
    remarks
  })

  res.json(ResponseUtil.success(supplier, '更新成功'))
}

export const deleteSupplier = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params

  const supplier = await Supplier.findByPk(id)
  if (!supplier) {
    throw new AppError('供货商不存在', 404)
  }

  const brandCount = await Brand.count({ where: { supplierId: id } })
  if (brandCount > 0) {
    throw new AppError('该供货商下存在品牌，无法删除', 400)
  }

  const productCount = await Product.count({ where: { supplierId: id } })
  if (productCount > 0) {
    throw new AppError('该供货商下存在商品，无法删除', 400)
  }

  await supplier.destroy()

  res.json(ResponseUtil.success(null, '删除成功'))
}

export const getSupplierList = async (req: AuthRequest, res: Response): Promise<void> => {
  const { page = 1, pageSize = 10, status, keyword, expiringSoon } = req.query

  const where: any = {}
  if (status !== undefined) where.status = status
  if (keyword) {
    where[Op.or] = [
      { name: { [Op.like]: `%${keyword}%` } },
      { contactPerson: { [Op.like]: `%${keyword}%` } },
      { phone: { [Op.like]: `%${keyword}%` } }
    ]
  }

  if (expiringSoon === 'true') {
    const thirtyDaysLater = new Date()
    thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30)
    where.cooperationEndDate = {
      [Op.between]: [new Date(), thirtyDaysLater]
    }
  }

  const { count, rows } = await Supplier.findAndCountAll({
    where,
    order: [['createdAt', 'DESC']],
    offset: (Number(page) - 1) * Number(pageSize),
    limit: Number(pageSize)
  })

  res.json(ResponseUtil.paginated(rows, count, Number(page), Number(pageSize)))
}

export const getSupplierDetail = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params

  const supplier = await Supplier.findByPk(id, {
    include: [
      { model: Brand, as: 'brands' },
      { model: Product, as: 'products', limit: 10 }
    ]
  })

  if (!supplier) {
    throw new AppError('供货商不存在', 404)
  }

  res.json(ResponseUtil.success(supplier, '获取成功'))
}

export const getExpiringSuppliers = async (req: AuthRequest, res: Response): Promise<void> => {
  const thirtyDaysLater = new Date()
  thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30)

  const suppliers = await Supplier.findAll({
    where: {
      cooperationEndDate: {
        [Op.between]: [new Date(), thirtyDaysLater]
      },
      status: true
    },
    order: [['cooperationEndDate', 'ASC']]
  })

  res.json(ResponseUtil.success(suppliers, '获取成功'))
}
