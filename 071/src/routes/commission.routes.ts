import express from 'express';
import commissionController from '../controllers/commission.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import {
  getCommissionListSchema,
  settleCommissionSchema,
  withdrawCommissionSchema
} from '../validations/commission.validation';
import { UserRole } from '../models/User.model';

const router = express.Router();

router.use(authMiddleware());
router.post('/', commissionController.create);
router.get('/my/commissions', commissionController.getMyCommissions);
router.get('/statistics', commissionController.getStatistics);
router.get('/periods', commissionController.getSettlementPeriods);
router.get('/:id', commissionController.getById);
router.get('/', validate(getCommissionListSchema), commissionController.getList);
router.post('/withdraw', validate(withdrawCommissionSchema), commissionController.withdraw);

router.use(authMiddleware([UserRole.ADMIN]));
router.post('/settle', validate(settleCommissionSchema), commissionController.settle);

export default router;
