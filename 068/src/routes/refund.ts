import { Router } from 'express';
import Joi from 'joi';
import {
  createRefund,
  getRefundList,
  getRefundById,
  auditRefund,
  getAdminRefundList,
  getRefundStatistics,
} from '../controllers/refundController';
import { authMiddleware, adminMiddleware } from '../middlewares/auth';
import { validate, validateIdParam, paginationSchema } from '../middlewares/validate';
import { RefundStatus, RefundType } from '../models/Refund';

const router = Router();

const createRefundSchema = Joi.object({
  orderId: Joi.number().integer().positive().required(),
  type: Joi.string().valid(...Object.values(RefundType)).required(),
  amount: Joi.number().positive().required(),
  reason: Joi.string().required(),
  images: Joi.string().optional(),
});

const auditRefundSchema = Joi.object({
  status: Joi.string().valid(RefundStatus.APPROVED, RefundStatus.REJECTED).required(),
  auditRemark: Joi.string().optional(),
});

const refundQuerySchema = paginationSchema.concat(
  Joi.object({
    status: Joi.string().valid(...Object.values(RefundStatus)).optional(),
    type: Joi.string().valid(...Object.values(RefundType)).optional(),
    startDate: Joi.date().optional(),
    endDate: Joi.date().optional(),
  })
);

router.use(authMiddleware);
router.post('/', validate({ body: createRefundSchema }), createRefund);
router.get('/list', validate({ query: paginationSchema }), getRefundList);
router.get('/:id', validate({ params: validateIdParam }), getRefundById);

router.use(adminMiddleware);
router.get('/admin/list', validate({ query: refundQuerySchema }), getAdminRefundList);
router.put('/:id/audit', validate({ params: validateIdParam, body: auditRefundSchema }), auditRefund);
router.get('/admin/statistics', getRefundStatistics);

export default router;
