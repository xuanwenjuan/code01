import { Router } from 'express';
import { EnrollmentController } from '../controllers/enrollment.controller';
import { authMiddleware, roleMiddleware } from '../middlewares/auth';
import { operationLogMiddleware } from '../middlewares/operationLog';
import { UserRole } from '../types';

const router = Router();

router.use(authMiddleware);

router.get('/', EnrollmentController.getList);
router.get('/:id', EnrollmentController.getById);

router.use(roleMiddleware(UserRole.ADMIN, UserRole.SUPER_ADMIN));

router.post('/', operationLogMiddleware('报名管理', '创建报名'), EnrollmentController.create);
router.post('/:id/approve', operationLogMiddleware('报名管理', '审核通过'), EnrollmentController.approve);
router.post('/:id/reject', operationLogMiddleware('报名管理', '拒绝报名'), EnrollmentController.reject);
router.post('/:id/payment', operationLogMiddleware('报名管理', '确认缴费'), EnrollmentController.confirmPayment);
router.post('/assign-class', operationLogMiddleware('报名管理', '分配班级'), EnrollmentController.assignClass);
router.patch('/:id/student-status', operationLogMiddleware('报名管理', '更新学员状态'), EnrollmentController.updateStudentStatus);

export default router;
