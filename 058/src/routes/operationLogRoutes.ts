import { Router } from 'express';
import * as operationLogController from '../controllers/operationLogController';
import { auth, requireAdmin } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';
import { validateQuery } from '../middleware/validate';
import Joi from 'joi';

const router = Router();

const logListSchema = {
  module: Joi.string(),
  operationType: Joi.string(),
  operatorId: Joi.number(),
  startDate: Joi.date(),
  endDate: Joi.date(),
  page: Joi.number().min(1).default(1),
  pageSize: Joi.number().min(1).max(100).default(20)
};

router.get('/list', auth, requireAdmin, validateQuery(logListSchema), asyncHandler(operationLogController.getOperationLogList));

export default router;
