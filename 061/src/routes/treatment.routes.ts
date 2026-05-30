import { Router } from 'express';
import {
  createTreatment,
  updateTreatment,
  deleteTreatment,
  getTreatment,
  getTreatmentList,
  createTreatmentSchema,
  updateTreatmentSchema,
} from '../controllers/treatment.controller';
import { auth, roleAuth, validate } from '../middleware';
import { UserRole } from '../types';

const router = Router();

router.use(auth);

router.get('/:id', getTreatment);
router.get('/', getTreatmentList);

router.use(roleAuth(UserRole.ADMIN));

router.post('/', validate(createTreatmentSchema), createTreatment);
router.put('/:id', validate(updateTreatmentSchema), updateTreatment);
router.delete('/:id', deleteTreatment);

export default router;
