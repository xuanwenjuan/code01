import { Router } from 'express';
import * as collectionController from '../controllers/collectionController';
import { authenticate, authorize } from '../middleware/auth';
import { logOperation } from '../middleware/operationLog';
import { validate, validateParams, validateQuery } from '../middleware/validation';
import { 
  createCollectionSchema, 
  updateCollectionSchema, 
  updateCollectionStatusSchema, 
  recordMaintenanceSchema, 
  queryCollectionsSchema, 
  idParamSchema, 
  collectionIdParamSchema 
} from '../validation/schemas';
import { UserRole } from '../types';

const router = Router();

router.get('/',
  validateQuery(queryCollectionsSchema),
  collectionController.getAllCollections
);

router.get('/maintenance/due-soon',
  collectionController.getMaintenanceDueSoon
);

router.get('/:id',
  validateParams(idParamSchema),
  collectionController.getCollectionById
);

router.post('/',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.COLLECTION_MANAGER),
  validate(createCollectionSchema),
  logOperation('藏品管理', '创建藏品'),
  collectionController.createCollection
);

router.put('/:id',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.COLLECTION_MANAGER),
  validateParams(idParamSchema),
  validate(updateCollectionSchema),
  logOperation('藏品管理', '更新藏品'),
  collectionController.updateCollection
);

router.put('/:id/status',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.COLLECTION_MANAGER),
  validateParams(idParamSchema),
  validate(updateCollectionStatusSchema),
  logOperation('藏品管理', '更新藏品状态'),
  collectionController.updateCollectionStatus
);

router.post('/:collectionId/maintenance',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.COLLECTION_MANAGER, UserRole.RESTORATION_TECHNICIAN),
  validateParams(collectionIdParamSchema),
  validate(recordMaintenanceSchema),
  logOperation('藏品管理', '记录保养'),
  collectionController.recordMaintenance
);

router.post('/batch/import',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.COLLECTION_MANAGER),
  logOperation('藏品管理', '批量导入藏品'),
  collectionController.batchImportCollections
);

router.get('/export/data',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.COLLECTION_MANAGER),
  collectionController.exportCollections
);

router.get('/statistics/summary',
  authenticate,
  collectionController.getCollectionStatistics
);

router.put('/:id/archive',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.COLLECTION_MANAGER),
  validateParams(idParamSchema),
  logOperation('藏品管理', '封存藏品'),
  collectionController.archiveCollection
);

router.put('/:id/unarchive',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.COLLECTION_MANAGER),
  validateParams(idParamSchema),
  logOperation('藏品管理', '解封藏品'),
  collectionController.unarchiveCollection
);

export default router;
