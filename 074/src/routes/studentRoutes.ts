import { Router } from 'express';
import * as studentController from '../controllers/studentController';
import { validate } from '../middleware/validation';
import { authenticate, hasPermission, Permission } from '../middleware/auth';
import { operationLog } from '../middleware/operationLog';
import { studentValidation, idParamValidation } from '../middleware/validationRules';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  hasPermission(Permission.STUDENT.VIEW),
  validate(studentValidation.query),
  studentController.getAllStudents
);
router.get(
  '/:id',
  hasPermission(Permission.STUDENT.VIEW),
  validate(idParamValidation),
  studentController.getStudentById
);

router.post(
  '/',
  hasPermission(Permission.STUDENT.CREATE),
  operationLog('学员档案'),
  validate(studentValidation.create),
  studentController.createStudent
);

router.put(
  '/:id',
  hasPermission(Permission.STUDENT.UPDATE),
  operationLog('学员档案'),
  validate([...idParamValidation, ...studentValidation.update]),
  studentController.updateStudent
);

router.patch(
  '/:id/status',
  hasPermission(Permission.STUDENT.UPDATE),
  operationLog('学员档案'),
  validate(idParamValidation),
  studentController.updateStatus
);

router.delete(
  '/:id',
  hasPermission(Permission.STUDENT.DELETE),
  operationLog('学员档案'),
  validate(idParamValidation),
  studentController.deleteStudent
);

router.post(
  '/enroll',
  hasPermission(Permission.STUDENT.ENROLL),
  operationLog('学员报班'),
  validate(studentValidation.enroll),
  studentController.enrollStudent
);

router.patch(
  '/enroll/:id/approve',
  hasPermission(Permission.STUDENT.ENROLL),
  operationLog('学员报班'),
  validate(idParamValidation),
  studentController.approveEnrollment
);

router.patch(
  '/enroll/:id/reject',
  hasPermission(Permission.STUDENT.ENROLL),
  operationLog('学员报班'),
  validate(idParamValidation),
  studentController.rejectEnrollment
);

router.patch(
  '/enroll/:id/payment',
  hasPermission(Permission.STUDENT.ENROLL),
  operationLog('学员报班'),
  validate([...idParamValidation, ...studentValidation.updatePayment]),
  studentController.updatePayment
);

router.patch(
  '/enroll/:id/convert-trial',
  hasPermission(Permission.STUDENT.ENROLL),
  operationLog('学员报班'),
  validate(idParamValidation),
  studentController.convertTrialToFormal
);

router.patch(
  '/enroll/:id/suspend',
  hasPermission(Permission.STUDENT.ENROLL),
  operationLog('学员报班'),
  validate(idParamValidation),
  studentController.suspendStudent
);

export default router;
