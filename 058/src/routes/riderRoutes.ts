import { Router } from 'express';
import * as riderController from '../controllers/riderController';
import { validate } from '../middleware/validate';
import { auth, requireRole } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';
import { UserRole } from '../types';
import {
  applyRiderSchema,
  auditRiderSchema,
  updateRiderStatusSchema,
  updateRiderInfoSchema,
  receiveOrderPermissionSchema,
  riderListSchema
} from '../validations/riderValidation';
import Joi from 'joi';

const router = Router();

router.post('/apply', auth, validate(applyRiderSchema), asyncHandler(riderController.applyRider));
router.get('/me', auth, requireRole(UserRole.RIDER), asyncHandler(riderController.getMyRiderInfo));
router.put('/status', auth, requireRole(UserRole.RIDER, UserRole.ADMIN), validate(updateRiderStatusSchema), asyncHandler(riderController.updateRiderStatus));
router.put('/delivery-area', auth, requireRole(UserRole.RIDER), validate({
  riderId: Joi.number().required(),
  deliveryArea: Joi.string().required()
}), asyncHandler(riderController.updateDeliveryArea));

router.get('/available', auth, requireRole(UserRole.USER, UserRole.ADMIN), asyncHandler(riderController.getAvailableRiders));

router.get('/list', auth, requireRole(UserRole.ADMIN), validate(riderListSchema), asyncHandler(riderController.getRiderList));
router.get('/:riderId', auth, requireRole(UserRole.ADMIN), asyncHandler(riderController.getRiderById));
router.put('/audit', auth, requireRole(UserRole.ADMIN), validate(auditRiderSchema), asyncHandler(riderController.auditRider));
router.put('/permission', auth, requireRole(UserRole.ADMIN), validate(receiveOrderPermissionSchema), asyncHandler(riderController.updateReceiveOrderPermission));
router.get('/:riderId/balance', auth, requireRole(UserRole.ADMIN, UserRole.RIDER), asyncHandler(riderController.getRiderBalance));
router.put('/info', auth, requireRole(UserRole.RIDER), validate(updateRiderInfoSchema), asyncHandler(riderController.updateRiderInfo));

export default router;
