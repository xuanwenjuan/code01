import { Router } from 'express'
import { createSupplier, updateSupplier, deleteSupplier, getSupplierList, getSupplierDetail, getExpiringSuppliers } from '../controllers/supplier.controller'
import { authenticate, authorize } from '../middlewares/auth.middleware'
import { validate, validateParams } from '../middlewares/validation.middleware'
import { createSupplierSchema, updateSupplierSchema, supplierIdSchema } from '../validations/supplier.validation'
import { UserRole } from '../types'

const router = Router()

router.use(authenticate)

router.get('/', getSupplierList)
router.get('/expiring', getExpiringSuppliers)
router.get('/:id', validateParams(supplierIdSchema), getSupplierDetail)

router.use(authorize(UserRole.ADMIN, UserRole.MANAGER))

router.post('/', validate(createSupplierSchema), createSupplier)
router.put('/:id', validateParams(supplierIdSchema), validate(updateSupplierSchema), updateSupplier)
router.delete('/:id', validateParams(supplierIdSchema), deleteSupplier)

export default router
