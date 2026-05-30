import { Router } from 'express';
import { validate } from '../middleware/validate';
import { authenticate, requireRoles } from '../middleware/auth';
import { operationLog } from '../middleware/operationLog';
import { UserRole } from '../types';
import {
  createCategory,
  createCategoryValidation,
  updateCategory,
  updateCategoryValidation,
  deleteCategory,
  getCategoryTree,
  getCategoryList,
  getCategoryDetail
} from '../controllers/materialCategoryController';

const router = Router();

router.use(authenticate);

router.get('/tree', getCategoryTree);
router.get('/', getCategoryList);
router.get('/:id', getCategoryDetail);

router.use(requireRoles(UserRole.HEADQUARTERS));

router.post(
  '/',
  validate(createCategoryValidation),
  operationLog('创建原料分类'),
  createCategory
);

router.put(
  '/:id',
  validate(updateCategoryValidation),
  operationLog('更新原料分类'),
  updateCategory
);

router.delete(
  '/:id',
  operationLog('删除原料分类'),
  deleteCategory
);

export default router;
