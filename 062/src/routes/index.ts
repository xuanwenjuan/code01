import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { RoomTypeController } from '../controllers/roomType.controller';
import { RoomController } from '../controllers/room.controller';
import { ReservationController } from '../controllers/reservation.controller';
import { FinanceController } from '../controllers/finance.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate, schemas } from '../middleware/validation.middleware';

const router = Router();

// 认证接口
router.post('/auth/login', validate(schemas.login), AuthController.login);
router.get('/auth/me', authMiddleware, AuthController.getCurrentUser);

// 房型管理
router.post('/room-types', authMiddleware, validate(schemas.roomType), RoomTypeController.create);
router.put('/room-types/:id', authMiddleware, RoomTypeController.update);
router.delete('/room-types/:id', authMiddleware, RoomTypeController.delete);
router.get('/room-types/:id', authMiddleware, RoomTypeController.getById);
router.get('/room-types', authMiddleware, validate(schemas.pagination), RoomTypeController.getList);
router.get('/room-types/tree', authMiddleware, RoomTypeController.getTree);
router.patch('/room-types/:id/status', authMiddleware, RoomTypeController.toggleStatus);
router.get('/room-types/available/list', authMiddleware, RoomTypeController.getAvailable);

// 客房管理
router.post('/rooms', authMiddleware, validate(schemas.room), RoomController.create);
router.put('/rooms/:id', authMiddleware, RoomController.update);
router.delete('/rooms/:id', authMiddleware, RoomController.delete);
router.get('/rooms/:id', authMiddleware, RoomController.getById);
router.get('/rooms', authMiddleware, validate(schemas.pagination), RoomController.getList);
router.patch('/rooms/:id/status', authMiddleware, validate(schemas.roomStatus), RoomController.updateStatus);
router.post('/rooms/batch-status', authMiddleware, validate(schemas.batchRoomStatus), RoomController.batchUpdateStatus);
router.get('/rooms/stats/overview', authMiddleware, RoomController.getRoomStats);
router.get('/rooms/available/list', authMiddleware, RoomController.getAvailableRooms);
router.get('/rooms/:id/detail', authMiddleware, RoomController.getRoomDetail);
router.get('/rooms/calendar/view', authMiddleware, RoomController.getRoomCalendar);
router.get('/rooms/floor/:floor', authMiddleware, RoomController.getFloorRooms);
router.get('/floors/available/list', authMiddleware, RoomController.getAvailableFloors);
router.post('/rooms/batch/create', authMiddleware, RoomController.batchCreate);
router.post('/rooms/:id/lock', authMiddleware, validate(schemas.lockRoom), RoomController.lockRoom);
router.post('/rooms/:id/unlock', authMiddleware, validate(schemas.unlockRoom), RoomController.unlockRoom);
router.post('/rooms/:id/clean-complete', authMiddleware, validate(schemas.completeCleaning), RoomController.completeCleaning);
router.post('/rooms/:id/maintenance/start', authMiddleware, validate(schemas.startMaintenance), RoomController.startMaintenance);
router.post('/rooms/:id/maintenance/end', authMiddleware, RoomController.endMaintenance);
router.get('/rooms/:id/status-history', authMiddleware, validate(schemas.pagination), RoomController.getStatusHistory);

// 预订与入住管理
router.post('/reservations', authMiddleware, validate(schemas.reservation), ReservationController.create);
router.post('/reservations/check-in', authMiddleware, validate(schemas.checkIn), ReservationController.checkIn);
router.post('/reservations/check-out', authMiddleware, validate(schemas.checkOut), ReservationController.checkOut);
router.post('/reservations/:id/cancel', authMiddleware, ReservationController.cancel);
router.get('/reservations/:id/transitions', authMiddleware, ReservationController.getStatusTransitions);
router.get('/reservations/:id', authMiddleware, ReservationController.getById);
router.get('/reservations', authMiddleware, validate(schemas.pagination), ReservationController.getList);
router.get('/check-in-records', authMiddleware, validate(schemas.pagination), ReservationController.getCheckInRecords);
router.post('/reservations/renew', authMiddleware, validate(schemas.renew), ReservationController.renew);
router.post('/reservations/batch/check-in', authMiddleware, ReservationController.batchCheckIn);
router.get('/reservations/stats/overview', authMiddleware, ReservationController.getReservationStats);

// 宾客管理
router.get('/guests', authMiddleware, validate(schemas.pagination), ReservationController.getGuestList);
router.get('/guests/:id', authMiddleware, ReservationController.getGuestDetail);
router.put('/guests/:id', authMiddleware, validate(schemas.guestUpdate), ReservationController.updateGuest);

// 财务对账
router.get('/finance/summary', authMiddleware, FinanceController.getSummary);
router.get('/finance/daily-stats', authMiddleware, validate(schemas.reportDate), FinanceController.getDailyStats);
router.get('/finance/monthly-stats', authMiddleware, FinanceController.getMonthlyStats);
router.get('/finance/room-type-stats', authMiddleware, validate(schemas.reportDate), FinanceController.getRoomTypeStats);
router.get('/finance/payments', authMiddleware, validate(schemas.pagination), FinanceController.getPaymentList);
router.get('/finance/refunds', authMiddleware, validate(schemas.pagination), FinanceController.getRefunds);
router.post('/finance/refunds', authMiddleware, validate(schemas.refund), FinanceController.createRefund);
router.get('/finance/dashboard/realtime', authMiddleware, FinanceController.getRealtimeDashboard);
router.get('/finance/payment/summary', authMiddleware, validate(schemas.reportDate), FinanceController.getPaymentSummary);
router.get('/finance/bill/:checkInRecordId', authMiddleware, FinanceController.generateBill);
router.get('/finance/transactions/:id', authMiddleware, FinanceController.getTransactionDetail);
router.get('/finance/occupancy/trend', authMiddleware, FinanceController.getOccupancyTrend);
router.get('/finance/report', authMiddleware, validate(schemas.reportDate), FinanceController.generateReport);
router.get('/finance/dashboard', authMiddleware, FinanceController.getDashboard);
router.get('/finance/reconcile/daily', authMiddleware, FinanceController.reconcileDaily);
router.post('/finance/cancel-timeout', authMiddleware, validate(schemas.cancelTimeout), FinanceController.cancelTimeoutReservations);
router.get('/finance/tasks/status', authMiddleware, FinanceController.getTaskStatus);

export default router;
