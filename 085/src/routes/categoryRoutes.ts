import express from 'express';
import {
  createCategory,
  getCategoryTree,
  getCategoryById,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus
} from '../controllers/categoryController';
import { authenticate, requireAdmin } from '../middleware/auth';
import { operationLog } from '../middleware/operationLog';
import { validate, schemas } from '../middleware/validate';

const router = express.Router();

router.get('/tree', validate(schemas.category.tree, 'query'), getCategoryTree);
router.get('/:id', getCategoryById);

router.use(authenticate, requireAdmin);
router.post('/', validate(schemas.category.create, 'body'), operationLog('category', '创建分类'), createCategory);
router.put('/:id', validate(schemas.category.update, 'body'), operationLog('category', '更新分类'), updateCategory);
router.delete('/:id', operationLog('category', '删除分类'), deleteCategory);
router.patch('/:id/toggle-status', operationLog('category', '切换分类状态'), toggleCategoryStatus);

export default router;
