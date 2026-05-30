import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate, userValidation, roomCategoryValidation, roomValidation, orderValidation, revenueValidation } from '../middleware/validation.middleware';
import * as authController from '../controllers/auth.controller';
import * as roomCategoryController from '../controllers/roomCategory.controller';
import * as roomController from '../controllers/room.controller';
import * as orderController from '../controllers/order.controller';
import * as revenueController from '../controllers/revenue.controller';
import { UserRole } from '../constants';

const router = Router();

router.post('/auth/register', userValidation.register, authController.register);
router.post('/auth/login', userValidation.login, authController.login);
router.get('/auth/profile', authenticate, authController.getProfile);

router.get('/room-categories/tree', roomCategoryController.getCategoryTree);
router.get('/room-categories/:id', roomCategoryController.getCategoryById);
router.post('/room-categories', authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.OPERATION), roomCategoryValidation.create, roomCategoryController.createCategory);
router.put('/room-categories/:id', authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.OPERATION), roomCategoryValidation.update, roomCategoryController.updateCategory);
router.delete('/room-categories/:id', authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.OPERATION), roomCategoryValidation.delete, roomCategoryController.deleteCategory);
router.patch('/room-categories/:id/status', authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.OPERATION), roomCategoryController.toggleCategoryStatus);

router.get('/rooms', roomValidation.filter, roomController.getRoomList);
router.get('/rooms/maintenance', authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.OPERATION, UserRole.BUILDING_ADMIN, UserRole.STAFF), roomController.getMaintenanceRooms);
router.get('/rooms/:id', roomController.getRoomById);
router.post('/rooms', authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.OPERATION), roomValidation.create, roomController.createRoom);
router.put('/rooms/:id', authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.OPERATION, UserRole.BUILDING_ADMIN), roomValidation.update, roomController.updateRoom);
router.delete('/rooms/:id', authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.OPERATION), roomController.deleteRoom);
router.patch('/rooms/:id/status', authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.OPERATION, UserRole.BUILDING_ADMIN, UserRole.STAFF), roomValidation.updateStatus, roomController.updateRoomStatus);
router.patch('/rooms/:id/maintenance', authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.OPERATION, UserRole.BUILDING_ADMIN, UserRole.STAFF), roomValidation.updateMaintenance, roomController.updateMaintenanceDate);

router.get('/orders', authenticate, orderValidation.query, orderController.getOrderList);
router.get('/orders/:id', authenticate, orderController.getOrderById);
router.post('/orders', authenticate, orderValidation.create, orderController.createOrder);
router.post('/orders/:id/pay', authenticate, orderValidation.pay, orderController.payOrder);
router.post('/orders/:id/check-in', authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.OPERATION, UserRole.BUILDING_ADMIN, UserRole.STAFF), orderValidation.checkIn, orderController.checkIn);
router.post('/orders/:id/check-out', authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.OPERATION, UserRole.BUILDING_ADMIN, UserRole.STAFF), orderValidation.checkOut, orderController.checkOut);
router.post('/orders/:id/cancel', authenticate, orderValidation.cancel, orderController.cancelOrder);

router.get('/revenue/statistics', authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.OPERATION, UserRole.FINANCE), revenueValidation.query, revenueController.getRevenueStatistics);
router.get('/revenue/orders', authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.OPERATION, UserRole.FINANCE), revenueValidation.query, revenueController.getOrderDetails);
router.post('/revenue/reports/:date?', authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.OPERATION, UserRole.FINANCE), revenueController.generateDailyReport);
router.get('/revenue/reports', authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.OPERATION, UserRole.FINANCE), revenueValidation.queryReports, revenueController.getReportsList);

export default router;
