import { Router } from 'express';
import { validate } from '../middleware/validate';
import { authenticate, requireRoles } from '../middleware/auth';
import { operationLog } from '../middleware/operationLog';
import { UserRole } from '../types';
import {
  createMaterial,
  createMaterialValidation,
  updateMaterial,
  updateMaterialValidation,
  deleteMaterial,
  getMaterialList,
  getMaterialDetail
} from '../controllers/materialController';

const router = Router();

router.use(authenticate);

router.get('/', getMaterialList);
router.get('/:id', getMaterialDetail);

router.use(requireRoles(UserRole.HEADQUARTERS));

router.post(
  '/',
  validate(createMaterialValidation),
  operationLog('创建原料'),
  createMaterial
);

router.put(
  '/:id',
  validate(updateMaterialValidation),
  operationLog('更新原料'),
  updateMaterial
);

router.delete(
  '/:id',
  operationLog('删除原料'),
  deleteMaterial
);

export default router;
