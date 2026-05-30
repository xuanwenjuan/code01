import { Router } from 'express'
import { createCategory, updateCategory, deleteCategory, getCategoryTree, getCategoryList, getCategoryDetail } from '../controllers/category.controller'
import { authenticate, authorize } from '../middlewares/auth.middleware'
import { validate, validateParams } from '../middlewares/validation.middleware'
import { createCategorySchema, updateCategorySchema, categoryIdSchema } from '../validations/category.validation'
import { UserRole } from '../types'

const router = Router()

router.get('/tree', getCategoryTree)
router.get('/', getCategoryList)
router.get('/:id', validateParams(categoryIdSchema), getCategoryDetail)

router.use(authenticate)
router.use(authorize(UserRole.ADMIN, UserRole.MANAGER))

router.post('/', validate(createCategorySchema), createCategory)
router.put('/:id', validateParams(categoryIdSchema), validate(updateCategorySchema), updateCategory)
router.delete('/:id', validateParams(categoryIdSchema), deleteCategory)

export default router
