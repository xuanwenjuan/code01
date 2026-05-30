import { Router } from 'express';
import {
  assetValidationRules,
  createAsset,
  updateAsset,
  deleteAsset,
  batchScrapAssets,
  getAssetList,
  getAssetDetail,
  updateAssetStatus,
  getAssetStatistics,
  calculateAssetDepreciation
} from '../controllers/asset.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { UserRole } from '../types';

const router = Router();

router.get('/', authenticate, assetValidationRules.getList, getAssetList);
router.get('/statistics', authenticate, getAssetStatistics);
router.get('/:id', authenticate, assetValidationRules.getDetail, getAssetDetail);

router.post(
  '/',
  authenticate,
  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  assetValidationRules.create,
  createAsset
);

router.post(
  '/batch-scrap',
  authenticate,
  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  assetValidationRules.batchDelete,
  batchScrapAssets
);

router.post(
  '/calculate-depreciation',
  authenticate,
  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  calculateAssetDepreciation
);

router.put(
  '/:id',
  authenticate,
  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  assetValidationRules.update,
  updateAsset
);

router.patch(
  '/:id/status',
  authenticate,
  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  assetValidationRules.updateStatus,
  updateAssetStatus
);

router.delete(
  '/:id',
  authenticate,
  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  assetValidationRules.delete,
  deleteAsset
);

export default router;
