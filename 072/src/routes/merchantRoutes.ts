import { Router } from 'express';
import {
  getMerchants,
  getMerchantById,
  createMerchant,
  updateMerchant,
  auditMerchant,
  deleteMerchant,
  getMerchantSchedules,
  createMerchantSchedule,
  updateMerchantSchedule,
  toggleScheduleLock,
  deleteMerchantSchedule,
  getPricePackages,
  createPricePackage,
  updatePricePackage,
  deletePricePackage
} from '../controllers/merchantController';
import { authenticate, requireRole } from '../middleware/auth';
import { operationLog } from '../middleware/operationLog';
import { validate } from '../middleware/validation';
import {
  createMerchantSchema,
  updateMerchantSchema,
  auditMerchantSchema,
  createScheduleSchema,
  toggleScheduleLockSchema,
  createPricePackageSchema
} from '../validation/merchantValidation';
import { UserRole } from '../types';

const router = Router();

router.use(authenticate);

router.get('/', getMerchants);
router.get('/:id', getMerchantById);
router.get('/:merchantId/schedules', getMerchantSchedules);
router.get('/price-packages/list', getPricePackages);

router.post('/',
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  operationLog({ module: '合作商家', operation: '创建商家' }),
  validate(createMerchantSchema),
  createMerchant
);

router.put('/:id',
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  operationLog({ module: '合作商家', operation: '更新商家' }),
  validate(updateMerchantSchema),
  updateMerchant
);

router.patch('/:id/audit',
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  operationLog({ module: '合作商家', operation: '审核商家' }),
  validate(auditMerchantSchema),
  auditMerchant
);

router.delete('/:id',
  requireRole(UserRole.SUPER_ADMIN),
  operationLog({ module: '合作商家', operation: '删除商家' }),
  deleteMerchant
);

router.post('/schedules',
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  operationLog({ module: '商家档期', operation: '创建档期' }),
  validate(createScheduleSchema),
  createMerchantSchedule
);

router.put('/schedules/:id',
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  operationLog({ module: '商家档期', operation: '更新档期' }),
  updateMerchantSchedule
);

router.patch('/schedules/:id/lock',
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  operationLog({ module: '商家档期', operation: '锁定切换' }),
  validate(toggleScheduleLockSchema),
  toggleScheduleLock
);

router.delete('/schedules/:id',
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  operationLog({ module: '商家档期', operation: '删除档期' }),
  deleteMerchantSchedule
);

router.post('/price-packages',
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  operationLog({ module: '报价套餐', operation: '创建套餐' }),
  validate(createPricePackageSchema),
  createPricePackage
);

router.put('/price-packages/:id',
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  operationLog({ module: '报价套餐', operation: '更新套餐' }),
  updatePricePackage
);

router.delete('/price-packages/:id',
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  operationLog({ module: '报价套餐', operation: '删除套餐' }),
  deletePricePackage
);

export default router;
