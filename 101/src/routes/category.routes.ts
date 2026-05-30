import { Router } from 'express';
import {
  createCategory,
  getCategoryTree,
  getCategoryList,
  getCategoryById,
  updateCategory,
  toggleCategoryStatus,
  deleteCategory,
  getActiveCategories,
  createCategorySchema,
  updateCategorySchema
} from '../controllers/category.controller';
import { validate } from '../middlewares/validation.middleware';
import { authMiddleware, roleMiddleware, permissionMiddleware } from '../middlewares/auth.middleware';
import { UserRole } from '../constants/enum';

const router = Router();

router.get('/tree', getCategoryTree);
router.get('/active', getActiveCategories);
router.get('/', authMiddleware, permissionMiddleware('category:read'), getCategoryList);
router.get('/:id', authMiddleware, permissionMiddleware('category:read'), getCategoryById);

router.post(
  '/',
  authMiddleware,
  roleMiddleware(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.BREEDER),
  permissionMiddleware('category:write'),
  validate(createCategorySchema),
  createCategory
);

router.put(
  '/:id',
  authMiddleware,
  roleMiddleware(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.BREEDER),
  permissionMiddleware('category:write'),
  validate(updateCategorySchema),
  updateCategory
);

router.patch(
  '/:id/status',
  authMiddleware,
  roleMiddleware(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.BREEDER),
  permissionMiddleware('category:status'),
  toggleCategoryStatus
);

router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  permissionMiddleware('category:delete'),
  deleteCategory
);

export default router;
