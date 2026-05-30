import { Router } from 'express';
import * as exhibitionController from '../controllers/exhibitionController';
import { authenticate, authorize } from '../middleware/auth';
import { logOperation } from '../middleware/operationLog';
import { validate, validateParams, validateQuery } from '../middleware/validation';
import { 
  createExhibitionSchema, 
  updateExhibitionSchema, 
  queryExhibitionsSchema, 
  getExhibitionLedgerSchema, 
  idParamSchema 
} from '../validation/schemas';
import { UserRole } from '../types';

const router = Router();

router.get('/',
  validateQuery(queryExhibitionsSchema),
  exhibitionController.getAllExhibitions
);

router.get('/ledger',
  validateQuery(getExhibitionLedgerSchema),
  exhibitionController.getExhibitionLedger
);

router.get('/:id',
  validateParams(idParamSchema),
  exhibitionController.getExhibitionById
);

router.get('/:id/stats',
  validateParams(idParamSchema),
  exhibitionController.getExhibitionStats
);

router.post('/',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.COLLECTION_MANAGER),
  validate(createExhibitionSchema),
  logOperation('展览管理', '创建展览'),
  exhibitionController.createExhibition
);

router.put('/:id',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.COLLECTION_MANAGER),
  validateParams(idParamSchema),
  validate(updateExhibitionSchema),
  logOperation('展览管理', '更新展览'),
  exhibitionController.updateExhibition
);

router.post('/:exhibitionId/collections/:collectionId',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.COLLECTION_MANAGER),
  logOperation('展览管理', '添加藏品到展览'),
  exhibitionController.addCollectionToExhibition
);

router.delete('/:exhibitionId/collections/:collectionId',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.COLLECTION_MANAGER),
  logOperation('展览管理', '从展览移除藏品'),
  exhibitionController.removeCollectionFromExhibition
);

export default router;
