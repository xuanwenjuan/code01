import { Router } from 'express';
import { AttendanceController } from '../controllers/attendance.controller';
import { authMiddleware, roleMiddleware } from '../middlewares/auth';
import { operationLogMiddleware } from '../middlewares/operationLog';
import { UserRole } from '../types';

const router = Router();

router.use(authMiddleware);

router.get('/lesson/:lessonId', AttendanceController.getByLessonId);
router.get('/student/:studentId', AttendanceController.getByStudentId);
router.get('/statistics', AttendanceController.getStatistics);
router.get('/student-summary', AttendanceController.getStudentAttendanceSummary);
router.get('/class-summary', AttendanceController.getClassAttendanceSummary);
router.post('/check-in', AttendanceController.checkIn);
router.post('/check-out', AttendanceController.checkOut);

router.use(roleMiddleware(UserRole.SUPER_ADMIN, UserRole.ACADEMIC_ADMIN, UserRole.TEACHER));

router.post('/bulk', operationLogMiddleware('考勤管理', '批量创建考勤'), AttendanceController.bulkCreate);
router.put('/:id', operationLogMiddleware('考勤管理', '更新考勤'), AttendanceController.update);
router.post('/:lessonId/auto-mark-absent', operationLogMiddleware('考勤管理', '自动标记缺勤'), AttendanceController.autoMarkAbsent);
router.post('/batch-update-status', operationLogMiddleware('考勤管理', '批量更新状态'), AttendanceController.batchUpdateStatus);

export default router;
