import { Router } from 'express';
import * as classController from '../controllers/classController';
import { validate } from '../middleware/validation';
import { authenticate, hasPermission, Permission } from '../middleware/auth';
import { operationLog } from '../middleware/operationLog';
import { classValidation, idParamValidation } from '../middleware/validationRules';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  hasPermission(Permission.CLASS.VIEW),
  validate(classValidation.query),
  classController.getAllClasses
);
router.get(
  '/:id',
  hasPermission(Permission.CLASS.VIEW),
  validate(idParamValidation),
  classController.getClassById
);
router.get(
  '/:id/attendance',
  hasPermission(Permission.CLASS.VIEW),
  validate([...idParamValidation, ...classValidation.attendanceQuery]),
  classController.getClassAttendance
);
router.get(
  '/:id/attendance/stats',
  hasPermission(Permission.CLASS.VIEW),
  validate([...idParamValidation, ...classValidation.attendanceQuery]),
  classController.getClassAttendanceStats
);
router.get(
  '/student/:studentId/attendance',
  hasPermission(Permission.STUDENT.VIEW),
  classController.getStudentAttendance
);

router.post(
  '/',
  hasPermission(Permission.CLASS.CREATE),
  operationLog('班级管理'),
  validate(classValidation.create),
  classController.createClass
);

router.put(
  '/:id',
  hasPermission(Permission.CLASS.UPDATE),
  operationLog('班级管理'),
  validate([...idParamValidation, ...classValidation.update]),
  classController.updateClass
);

router.patch(
  '/:id/status',
  hasPermission(Permission.CLASS.UPDATE),
  operationLog('班级管理'),
  validate(idParamValidation),
  classController.updateStatus
);

router.delete(
  '/:id',
  hasPermission(Permission.CLASS.DELETE),
  operationLog('班级管理'),
  validate(idParamValidation),
  classController.deleteClass
);

router.post(
  '/attendance',
  hasPermission(Permission.CLASS.ATTENDANCE),
  operationLog('考勤管理'),
  validate(classValidation.attendance),
  classController.recordAttendance
);

router.patch(
  '/attendance/:id',
  hasPermission(Permission.CLASS.ATTENDANCE),
  operationLog('考勤管理'),
  validate(idParamValidation),
  classController.updateAttendance
);

router.delete(
  '/attendance/:id',
  hasPermission(Permission.CLASS.ATTENDANCE),
  operationLog('考勤管理'),
  validate(idParamValidation),
  classController.deleteAttendance
);

export default router;
