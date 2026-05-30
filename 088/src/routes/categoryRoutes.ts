import { Router } from 'express';
import * as categoryController from '../controllers/categoryController';
import { authenticate, authorize } from '../middleware/auth';
import { logOperation } from '../middleware/operationLog';
import { validate, validateParams, validateQuery } from '../middleware/validation';
import { 
  createCategorySchema, 
  updateCategorySchema, 
  updateSortOrderSchema, 
  idParamSchema 
} from '../validation/schemas';
import { UserRole, CategoryType } from '../types';

const router = Router();

router.get('/tree',
  validateQuery({}),
  categoryController.getCategoryTree
);

router.get('/type/:type',
  (req, res, next) => {
    const validTypes = Object.values(CategoryType);
    if (!validTypes.includes(req.params.type as CategoryType)) {
      return res.status(400).json({ message: '无效的类目类型' });
    }
    next();
  },
  categoryController.getCategoriesByType
);

router.get('/:id/stats',
  validateParams(idParamSchema),
  categoryController.getCategoryStats
);

router.get('/:id',
  validateParams(idParamSchema),
  categoryController.getCategoryById
);

router.get('/:id/with-children',
  validateParams(idParamSchema),
  categoryController.getCategoryWithChildren
);

router.post('/',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.COLLECTION_MANAGER),
  validate(createCategorySchema),
  logOperation('类目管理', '创建类目'),
  categoryController.createCategory
);

router.put('/sort/batch',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.COLLECTION_MANAGER),
  validate(updateSortOrderSchema),
  logOperation('类目管理', '更新排序'),
  categoryController.updateSortOrder
);

router.put('/:id',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.COLLECTION_MANAGER),
  validateParams(idParamSchema),
  validate(updateCategorySchema),
  logOperation('类目管理', '更新类目'),
  categoryController.updateCategory
);

router.put('/:id/archive',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.COLLECTION_MANAGER),
  validateParams(idParamSchema),
  logOperation('类目管理', '封存类目'),
  categoryController.archiveCategory
);

router.put('/:id/unarchive',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.COLLECTION_MANAGER),
  validateParams(idParamSchema),
  logOperation('类目管理', '解封类目'),
  categoryController.unarchiveCategory
);

export default router;
