import { Router } from 'express';
import { applicationController } from '../controllers/application.controller';
import { authenticate, authorize } from '../middlewares/auth';
import { validate } from '../middlewares/validation';
import { applicationSchemas } from '../validations';

const router = Router();

router.post('/', authenticate, authorize('application:create'), validate({ body: applicationSchemas.create.body }), applicationController.createApplication);
router.get('/', authenticate, authorize('application:read'), validate({ query: applicationSchemas.list.query }), applicationController.getApplications);
router.get('/statistics', authenticate, authorize('cost:read'), applicationController.getStatistics);
router.get('/:id', authenticate, authorize('application:read'), validate({ params: applicationSchemas.update.params }), applicationController.getApplication);
router.put('/:id/approve', authenticate, authorize('application:approve'), validate({ params: applicationSchemas.update.params, body: applicationSchemas.approve.body }), applicationController.approveApplication);
router.put('/:id/deliver', authenticate, authorize('application:deliver'), validate({ params: applicationSchemas.update.params, body: applicationSchemas.deliver.body }), applicationController.deliverApplication);
router.put('/:id/return', authenticate, authorize('application:return'), validate({ params: applicationSchemas.update.params, body: applicationSchemas.returnItems.body }), applicationController.returnItems);
router.put('/:id/damage', authenticate, authorize('application:damage'), validate({ params: applicationSchemas.update.params, body: applicationSchemas.damage.body }), applicationController.reportDamage);
router.put('/:id/complete', authenticate, authorize('application:complete'), validate({ params: applicationSchemas.update.params }), applicationController.completeApplication);
router.put('/:id/reject', authenticate, authorize('application:reject'), validate({ params: applicationSchemas.update.params, body: applicationSchemas.reject.body }), applicationController.rejectApplication);
router.put('/:id/cancel', authenticate, authorize('application:cancel'), validate({ params: applicationSchemas.update.params }), applicationController.cancelApplication);

export default router;
