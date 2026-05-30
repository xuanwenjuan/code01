import { Router } from 'express';
import * as attendanceController from '../controllers/attendance.controller';
import { validate, validateId, validatePagination } from '../middleware/validation';
import { 
  clockInSchema, 
  clockOutSchema, 
  leaveRequestSchema, 
  makeupCardSchema 
} from '../validation/attendance.validation';
import { authenticate, requireManagerOrAdmin } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/clock-in', validate(clockInSchema), attendanceController.clockIn);
router.post('/clock-out', validate(clockOutSchema), attendanceController.clockOut);
router.get('/today', attendanceController.getTodayAttendance);
router.get('/records', validatePagination, attendanceController.getAttendanceRecords);
router.get('/stats', attendanceController.getAttendanceStats);
router.get('/report/monthly', attendanceController.getMonthlyAttendanceReport);

router.post('/leave', validate(leaveRequestSchema), attendanceController.createLeaveRequest);
router.get('/leave', validatePagination, attendanceController.getLeaveRequests);
router.get('/leave/:id', validateId(), attendanceController.getLeaveRequestById);
router.put('/leave/:id/cancel', validateId(), attendanceController.cancelLeaveRequest);

router.post('/makeup-card', validate(makeupCardSchema), attendanceController.createMakeupCardRequest);
router.get('/makeup-card', validatePagination, attendanceController.getMakeupCardRequests);
router.get('/makeup-card/:id', validateId(), attendanceController.getMakeupCardRequestById);

router.use(requireManagerOrAdmin);

router.put('/leave/:id/approve', validateId(), attendanceController.approveLeaveRequest);
router.put('/makeup-card/:id/approve', validateId(), attendanceController.approveMakeupCardRequest);

export default router;
