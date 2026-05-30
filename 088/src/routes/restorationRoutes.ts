import { Router } from 'express';
import * as restorationController from '../controllers/restorationController';
import { authenticate, authorize } from '../middleware/auth';
import { logOperation } from '../middleware/operationLog';
import { validate, validateParams, validateQuery } from '../middleware/validation';
import { 
  createRestorationSchema, 
  approveRestorationPlanSchema, 
  completeRestorationSchema, 
  acceptRestorationSchema, 
  queryRestorationsSchema, 
  idParamSchema 
} from '../validation/schemas';
import { UserRole } from '../types';

const router = Router();

router.get('/',
  validateQuery(queryRestorationsSchema),
  restorationController.getAllRestorations
);

router.get('/:id',
  validateParams(idParamSchema),
  restorationController.getRestorationById
);

router.post('/',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.COLLECTION_MANAGER),
  validate(createRestorationSchema),
  logOperation('修复管理', '创建修复记录'),
  restorationController.createRestoration
);

router.put('/:id/approve',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.COLLECTION_MANAGER),
  validateParams(idParamSchema),
  validate(approveRestorationPlanSchema),
  logOperation('修复管理', '审批修复方案'),
  restorationController.approvePlan
);

router.put('/:id/start',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.RESTORATION_TECHNICIAN),
  validateParams(idParamSchema),
  logOperation('修复管理', '开始修复'),
  restorationController.startRestoration
);

router.put('/:id/complete',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.RESTORATION_TECHNICIAN),
  validateParams(idParamSchema),
  validate(completeRestorationSchema),
  logOperation('修复管理', '完成修复'),
  restorationController.completeRestoration
);

router.put('/:id/accept',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.COLLECTION_MANAGER),
  validateParams(idParamSchema),
  validate(acceptRestorationSchema),
  logOperation('修复管理', '验收修复'),
  restorationController.acceptRestoration
);

export default router;
