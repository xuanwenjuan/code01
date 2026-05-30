import { Router } from 'express';
import {
  createPatient,
  updatePatient,
  deletePatient,
  getPatient,
  getPatientList,
  createPatientSchema,
  updatePatientSchema,
} from '../controllers/patient.controller';
import { auth, roleAuth, validate } from '../middleware';
import { UserRole } from '../types';

const router = Router();

router.use(auth);

router.get('/:id', getPatient);
router.get('/', getPatientList);

router.use(roleAuth(UserRole.ADMIN, UserRole.RECEPTIONIST, UserRole.DOCTOR));

router.post('/', validate(createPatientSchema), createPatient);
router.put('/:id', validate(updatePatientSchema), updatePatient);
router.delete('/:id', deletePatient);

export default router;
