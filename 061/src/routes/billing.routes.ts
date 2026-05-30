import { Router } from 'express';
import {
  createBilling,
  updateBilling,
  payBilling,
  refundBilling,
  deleteBilling,
  getBilling,
  getBillingList,
  getRevenueStatistics,
  createBillingSchema,
  updateBillingSchema,
  payBillingSchema,
} from '../controllers/billing.controller';
import { auth, roleAuth, validate } from '../middleware';
import { UserRole } from '../types';

const router = Router();

router.use(auth);

router.get('/statistics', getRevenueStatistics);
router.get('/:id', getBilling);
router.get('/', getBillingList);

router.use(roleAuth(UserRole.ADMIN, UserRole.RECEPTIONIST));

router.post('/', validate(createBillingSchema), createBilling);
router.put('/:id', validate(updateBillingSchema), updateBilling);
router.post('/:id/pay', validate(payBillingSchema), payBilling);
router.post('/:id/refund', refundBilling);
router.delete('/:id', deleteBilling);

export default router;
