import { Router } from 'express'
import { createProduct, updateProduct, deleteProduct, getProductList, getProductDetail, updateStock } from '../controllers/product.controller'
import { authenticate, authorize } from '../middlewares/auth.middleware'
import { validate, validateParams } from '../middlewares/validation.middleware'
import { createProductSchema, updateProductSchema, updateStockSchema, productIdSchema } from '../validations/product.validation'
import { UserRole } from '../types'

const router = Router()

router.get('/', getProductList)
router.get('/:id', validateParams(productIdSchema), getProductDetail)

router.use(authenticate)

router.patch('/:id/stock', validateParams(productIdSchema), validate(updateStockSchema), authorize(UserRole.ADMIN, UserRole.MANAGER, UserRole.WAREHOUSE), updateStock)

router.use(authorize(UserRole.ADMIN, UserRole.MANAGER))

router.post('/', validate(createProductSchema), createProduct)
router.put('/:id', validateParams(productIdSchema), validate(updateProductSchema), updateProduct)
router.delete('/:id', validateParams(productIdSchema), deleteProduct)

export default router
