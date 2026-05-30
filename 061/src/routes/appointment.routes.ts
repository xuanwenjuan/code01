import { Router } from 'express';
import {
  createAppointment,
  updateAppointment,
  updateAppointmentStatus,
  deleteAppointment,
  getAppointment,
  getAppointmentList,
  getTodayQueue,
  createAppointmentSchema,
  updateAppointmentSchema,
} from '../controllers/appointment.controller';
import { auth, roleAuth, validate } from '../middleware';
import { UserRole } from '../types';

const router = Router();

router.use(auth);

router.get('/queue/today', getTodayQueue);
router.get('/:id', getAppointment);
router.get('/', getAppointmentList);

router.use(roleAuth(UserRole.ADMIN, UserRole.RECEPTIONIST, UserRole.DOCTOR));

router.post('/', validate(createAppointmentSchema), createAppointment);
router.put('/:id', validate(updateAppointmentSchema), updateAppointment);
router.patch('/:id/status', updateAppointmentStatus);
router.delete('/:id', deleteAppointment);

export default router;
