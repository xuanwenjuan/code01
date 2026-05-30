import { Router } from 'express';
import CollectionController from '../controllers/CollectionController';
import { authenticate, authorize } from '../middlewares/auth';
import { validateBody, validateQuery, validateParams } from '../middlewares/validate';
import { operationLog, LogModules, LogOperations } from '../middlewares/operationLog';
import {
  createCollectionSchema,
  updateCollectionSchema,
  getCollectionListSchema,
  collectionIdSchema,
  batchUpdateStatusSchema,
  batchDeleteSchema
} from '../validations/collection.validation';

const router = Router();

router.get(
  '/list',
  validateQuery(getCollectionListSchema),
  operationLog({ module: LogModules.COLLECTION, operation: LogOperations.LIST }),
  CollectionController.getCollectionList
);
router.get(
  '/maintenance-reminders',
  operationLog({ module: LogModules.COLLECTION, operation: '保养提醒' }),
  CollectionController.getMaintenanceReminders
);
router.get(
  '/statistics',
  operationLog({ module: LogModules.COLLECTION, operation: '统计' }),
  CollectionController.getStatistics
);
router.get(
  '/:id',
  validateParams(collectionIdSchema),
  operationLog({ module: LogModules.COLLECTION, operation: LogOperations.VIEW }),
  CollectionController.getCollectionById
);

router.use(authenticate);

router.post(
  '/',
  authorize('collection:create'),
  validateBody(createCollectionSchema),
  operationLog({ module: LogModules.COLLECTION, operation: LogOperations.CREATE }),
  CollectionController.createCollection
);
router.put(
  '/:id',
  authorize('collection:update'),
  validateParams(collectionIdSchema),
  validateBody(updateCollectionSchema),
  operationLog({ module: LogModules.COLLECTION, operation: LogOperations.UPDATE }),
  CollectionController.updateCollection
);
router.delete(
  '/:id',
  authorize('collection:delete'),
  validateParams(collectionIdSchema),
  operationLog({ module: LogModules.COLLECTION, operation: LogOperations.DELETE }),
  CollectionController.deleteCollection
);
router.patch(
  '/:id/status',
  authorize('collection:update'),
  validateParams(collectionIdSchema),
  operationLog({ module: LogModules.COLLECTION, operation: '更新状态' }),
  CollectionController.updateCollectionStatus
);
router.patch(
  '/:id/trigger-maintenance',
  authorize('collection:update'),
  validateParams(collectionIdSchema),
  operationLog({ module: LogModules.COLLECTION, operation: '触发保养' }),
  CollectionController.triggerMaintenance
);
router.post(
  '/batch/update-status',
  authorize('collection:batchUpdate'),
  validateBody(batchUpdateStatusSchema),
  operationLog({ module: LogModules.COLLECTION, operation: LogOperations.BATCH_UPDATE }),
  CollectionController.batchUpdateStatus
);
router.post(
  '/batch/delete',
  authorize('collection:batchUpdate'),
  validateBody(batchDeleteSchema),
  operationLog({ module: LogModules.COLLECTION, operation: LogOperations.BATCH_DELETE }),
  CollectionController.batchDelete
);

export default router;