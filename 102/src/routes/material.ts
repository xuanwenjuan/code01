import { Router } from 'express';
import {
  getCategoryTree,
  getCategoryList,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  updateCategoryStatus,
  getMaterialList,
  getMaterialById,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  batchStockIn,
} from '../controllers/materialController';
import { authenticate, requirePermission } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { operationLog } from '../middleware/operationLog';
import {
  createCategorySchema,
  updateCategorySchema,
  createMaterialSchema,
  updateMaterialSchema,
  batchStockInSchema,
  updateCategoryStatusSchema,
} from '../validation/material';

const router = Router();

router.use(authenticate);

router.get('/categories/tree', requirePermission('material:view'), getCategoryTree);
router.get('/categories', requirePermission('material:view'), getCategoryList);
router.get('/categories/:id', requirePermission('material:view'), getCategoryById);
router.post('/categories', requirePermission('material:create'), operationLog('原料管理', '创建分类'), validate(createCategorySchema, 'body'), createCategory);
router.put('/categories/:id', requirePermission('material:update'), operationLog('原料管理', '更新分类'), validate(updateCategorySchema, 'body'), updateCategory);
router.put('/categories/:id/status', requirePermission('material:update'), operationLog('原料管理', '更新分类状态'), validate(updateCategoryStatusSchema, 'body'), updateCategoryStatus);
router.delete('/categories/:id', requirePermission('material:delete'), operationLog('原料管理', '删除分类'), deleteCategory);

router.get('/', requirePermission('material:view'), getMaterialList);
router.get('/:id', requirePermission('material:view'), getMaterialById);
router.post('/', requirePermission('material:create'), operationLog('原料管理', '创建原料'), validate(createMaterialSchema, 'body'), createMaterial);
router.put('/:id', requirePermission('material:update'), operationLog('原料管理', '更新原料'), validate(updateMaterialSchema, 'body'), updateMaterial);
router.delete('/:id', requirePermission('material:delete'), operationLog('原料管理', '删除原料'), deleteMaterial);
router.post('/batch-stock-in', requirePermission('material:update'), operationLog('原料管理', '批量入库'), validate(batchStockInSchema, 'body'), batchStockIn);

export default router;
