import { Router } from 'express';
import * as teacherController from '../controllers/teacherController';
import { validate } from '../middleware/validation';
import { authenticate, hasPermission, Permission } from '../middleware/auth';
import { operationLog } from '../middleware/operationLog';
import { teacherValidation, idParamValidation } from '../middleware/validationRules';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  hasPermission(Permission.TEACHER.VIEW),
  validate(teacherValidation.query),
  teacherController.getAllTeachers
);
router.get(
  '/expiring-qualifications',
  hasPermission(Permission.TEACHER.VIEW),
  teacherController.getExpiringQualifications
);
router.get(
  '/:id',
  hasPermission(Permission.TEACHER.VIEW),
  validate(idParamValidation),
  teacherController.getTeacherById
);
router.patch(
  '/:id/rate',
  hasPermission(Permission.TEACHER.RATE),
  validate([...idParamValidation, ...teacherValidation.rating]),
  teacherController.rateTeacher
);

router.get(
  '/available',
  hasPermission(Permission.TEACHER.VIEW),
  validate(teacherValidation.query),
  teacherController.getAvailableTeachers
);

router.post(
  '/',
  hasPermission(Permission.TEACHER.CREATE),
  operationLog('教师档案'),
  validate(teacherValidation.create),
  teacherController.createTeacher
);

router.put(
  '/:id',
  hasPermission(Permission.TEACHER.UPDATE),
  operationLog('教师档案'),
  validate([...idParamValidation, ...teacherValidation.update]),
  teacherController.updateTeacher
);

router.patch(
  '/:id/status',
  hasPermission(Permission.TEACHER.UPDATE),
  operationLog('教师档案'),
  validate(idParamValidation),
  teacherController.updateStatus
);

router.delete(
  '/:id',
  hasPermission(Permission.TEACHER.DELETE),
  operationLog('教师档案'),
  validate(idParamValidation),
  teacherController.deleteTeacher
);

export default router;
