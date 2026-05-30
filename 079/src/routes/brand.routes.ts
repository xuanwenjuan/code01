import { Router } from 'express'
import { createBrand, updateBrand, deleteBrand, getBrandList, getBrandDetail } from '../controllers/brand.controller'
import { authenticate, authorize } from '../middlewares/auth.middleware'
import { validate, validateParams } from '../middlewares/validation.middleware'
import { createBrandSchema, updateBrandSchema, brandIdSchema } from '../validations/brand.validation'
import { UserRole } from '../types'

const router = Router()

router.use(authenticate)

router.get('/', getBrandList)
router.get('/:id', validateParams(brandIdSchema), getBrandDetail)

router.use(authorize(UserRole.ADMIN, UserRole.MANAGER))

router.post('/', validate(createBrandSchema), createBrand)
router.put('/:id', validateParams(brandIdSchema), validate(updateBrandSchema), updateBrand)
router.delete('/:id', validateParams(brandIdSchema), deleteBrand)

export default router
