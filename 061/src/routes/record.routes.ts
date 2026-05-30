import { Router } from 'express';
import {
  createRecord,
  updateRecord,
  deleteRecord,
  getRecord,
  getRecordList,
  getPatientRecords,
  createRecordSchema,
  updateRecordSchema,
} from '../controllers/record.controller';
import { auth, roleAuth, validate } from '../middleware';
import { UserRole } from '../types';

const router = Router();

router.use(auth);

router.get('/patient/:patientId', getPatientRecords);
router.get('/:id', getRecord);
router.get('/', getRecordList);

router.use(roleAuth(UserRole.ADMIN, UserRole.DOCTOR));

router.post('/', validate(createRecordSchema), createRecord);
router.put('/:id', validate(updateRecordSchema), updateRecord);
router.delete('/:id', deleteRecord);

export default router;
