import { Router } from 'express';
import {
  createMaterialCategory,
  getMaterialCategories,
  getMaterialCategoryById,
  updateMaterialCategory,
  deleteMaterialCategory,
} from '../controllers/materialCategory.controller';
import { authenticate, authorize } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { createMaterialCategorySchema, updateMaterialCategorySchema } from '../validators/materialCategory.validator';
import { ROLES } from '../config';

const router = Router();

router.get('/', authenticate, getMaterialCategories);
router.get('/:id', authenticate, getMaterialCategoryById);
router.post(
  '/',
  authenticate,
  authorize(ROLES.MATERIAL_ADMIN, ROLES.ADMIN),
  validate(createMaterialCategorySchema),
  createMaterialCategory
);
router.put(
  '/:id',
  authenticate,
  authorize(ROLES.MATERIAL_ADMIN, ROLES.ADMIN),
  validate(updateMaterialCategorySchema),
  updateMaterialCategory
);
router.delete(
  '/:id',
  authenticate,
  authorize(ROLES.MATERIAL_ADMIN, ROLES.ADMIN),
  deleteMaterialCategory
);

export default router;
