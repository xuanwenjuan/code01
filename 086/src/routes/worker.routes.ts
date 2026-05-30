import { Router } from 'express';
import WorkerController from '../controllers/worker.controller';
import { authenticate, requireAdmin, requireWorker } from '../middleware/auth';
import { validate } from '../middleware/validation';
import {
  createWorkerSchema,
  updateWorkerSchema,
  updateWorkerStatusSchema,
  getWorkerListSchema
} from '../validations/worker.validation';

const router = Router();

router.get('/', validate(getWorkerListSchema), WorkerController.getWorkerList);
router.get('/dispatch', WorkerController.getWorkersForDispatch);
router.get('/:id', WorkerController.getWorkerById);
router.get('/user/:userId', WorkerController.getWorkerByUserId);

router.use(authenticate);
router.patch('/:id/status', validate(updateWorkerStatusSchema), WorkerController.updateWorkerStatus);

router.use(requireAdmin);
router.post('/', validate(createWorkerSchema), WorkerController.createWorker);
router.put('/:id', validate(updateWorkerSchema), WorkerController.updateWorker);
router.get('/certificates/expiring', WorkerController.getExpiringCertificates);

export default router;
