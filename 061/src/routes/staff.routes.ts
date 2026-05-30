import { Router } from 'express';
import {
  createStaff,
  updateStaff,
  deleteStaff,
  getStaff,
  getStaffList,
  getDoctorList,
  createStaffSchema,
  updateStaffSchema,
} from '../controllers/staff.controller';
import { auth, roleAuth, validate } from '../middleware';
import { UserRole } from '../types';

const router = Router();

router.use(auth);

router.get('/doctors', getDoctorList);
router.get('/:id', getStaff);
router.get('/', getStaffList);

router.use(roleAuth(UserRole.ADMIN));

router.post('/', validate(createStaffSchema), createStaff);
router.put('/:id', validate(updateStaffSchema), updateStaff);
router.delete('/:id', deleteStaff);

export default router;
