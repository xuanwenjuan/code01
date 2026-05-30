import { Router } from 'express';
import * as courseCategoryController from '../controllers/courseCategoryController';
import { validate } from '../middleware/validation';
import { authenticate, hasPermission, Permission } from '../middleware/auth';
import { operationLog } from '../middleware/operationLog';
import { courseCategoryValidation, idParamValidation } from '../middleware/validationRules';

const router = Router();

router.use(authenticate);

router.get(
  '/tree',
  hasPermission(Permission.COURSE_CATEGORY.VIEW),
  validate(courseCategoryValidation.query),
  courseCategoryController.getCategoryTree
);
router.get(
  '/tree/lazy/:parentId?',
  hasPermission(Permission.COURSE_CATEGORY.VIEW),
  validate(courseCategoryValidation.query),
  courseCategoryController.getCategoryTreeLazy
);
router.get(
  '/children/:parentId?',
  hasPermission(Permission.COURSE_CATEGORY.VIEW),
  validate(courseCategoryValidation.query),
  courseCategoryController.getCategoryChildren
);
router.get(
  '/',
  hasPermission(Permission.COURSE_CATEGORY.VIEW),
  validate(courseCategoryValidation.query),
  courseCategoryController.getAllCategories
);
router.get(
  '/:id',
  hasPermission(Permission.COURSE_CATEGORY.VIEW),
  validate(idParamValidation),
  courseCategoryController.getCategoryById
);

router.post(
  '/',
  hasPermission(Permission.COURSE_CATEGORY.CREATE),
  operationLog('课程类目'),
  validate(courseCategoryValidation.create),
  courseCategoryController.createCategory
);

router.put(
  '/:id',
  hasPermission(Permission.COURSE_CATEGORY.UPDATE),
  operationLog('课程类目'),
  validate([...idParamValidation, ...courseCategoryValidation.update]),
  courseCategoryController.updateCategory
);

router.patch(
  '/:id/status',
  hasPermission(Permission.COURSE_CATEGORY.UPDATE),
  operationLog('课程类目'),
  validate(idParamValidation),
  courseCategoryController.updateStatus
);

router.patch(
  '/sort-order',
  hasPermission(Permission.COURSE_CATEGORY.UPDATE),
  operationLog('课程类目'),
  courseCategoryController.updateSortOrder
);

router.delete(
  '/:id',
  hasPermission(Permission.COURSE_CATEGORY.DELETE),
  operationLog('课程类目'),
  validate(idParamValidation),
  courseCategoryController.deleteCategory
);

export default router;
