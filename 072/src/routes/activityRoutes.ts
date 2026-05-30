import { Router } from 'express';
import {
  getActivities,
  getActivityById,
  createActivity,
  updateActivity,
  updateActivityStatus,
  deleteActivity,
  registerActivity,
  approveRegistration,
  checkIn,
  cancelRegistration,
  getMyRegistrations,
  getRegistrationStatistics,
  getDepartmentRegistrations
} from '../controllers/activityController';
import { authenticate, requireRole } from '../middleware/auth';
import { operationLog } from '../middleware/operationLog';
import { validate } from '../middleware/validation';
import {
  createActivitySchema,
  updateActivitySchema,
  updateActivityStatusSchema,
  registerActivitySchema,
  approveRegistrationSchema,
  cancelRegistrationSchema
} from '../validation/activityValidation';
import { UserRole } from '../types';

const router = Router();

router.get('/', getActivities);
router.get('/:id', getActivityById);

router.use(authenticate);

router.get('/statistics',
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DEPARTMENT_MANAGER),
  getRegistrationStatistics
);

router.get('/registrations/my', getMyRegistrations);
router.get('/registrations/department',
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DEPARTMENT_MANAGER),
  getDepartmentRegistrations
);

router.post('/',
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  operationLog({ module: '活动管理', operation: '创建活动' }),
  validate(createActivitySchema),
  createActivity
);

router.put('/:id',
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  operationLog({ module: '活动管理', operation: '更新活动' }),
  validate(updateActivitySchema),
  updateActivity
);

router.patch('/:id/status',
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  operationLog({ module: '活动管理', operation: '状态流转' }),
  validate(updateActivityStatusSchema),
  updateActivityStatus
);

router.delete('/:id',
  requireRole(UserRole.SUPER_ADMIN),
  operationLog({ module: '活动管理', operation: '删除活动' }),
  deleteActivity
);

router.post('/register',
  operationLog({ module: '报名签到', operation: '报名活动' }),
  validate(registerActivitySchema),
  registerActivity
);

router.patch('/registrations/:id/approve',
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DEPARTMENT_MANAGER),
  operationLog({ module: '报名签到', operation: '审批报名' }),
  validate(approveRegistrationSchema),
  approveRegistration
);

router.patch('/registrations/:id/checkin',
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  operationLog({ module: '报名签到', operation: '签到' }),
  checkIn
);

router.patch('/registrations/:id/cancel',
  operationLog({ module: '报名签到', operation: '取消报名' }),
  validate(cancelRegistrationSchema),
  cancelRegistration
);

export default router;
