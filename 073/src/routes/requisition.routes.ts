import { Router } from 'express';
import { RequisitionController } from '../controllers/requisition.controller';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.middleware';
import { validate, schemas } from '../middlewares/validation.middleware';
import { UserRole } from '../types';

const router = Router();

router.use(authMiddleware);
router.get('/', RequisitionController.getList);
router.get('/my', RequisitionController.getMyRequisitions);
router.get('/pending-approvals', RequisitionController.getPendingApprovals);
router.get('/statistics', RequisitionController.getStatistics);
router.get('/:id', RequisitionController.getById);

router.post('/', validate(schemas.requisition.create), RequisitionController.create);
router.put('/:id/submit', RequisitionController.submitForApproval);
router.put('/:id/cancel', RequisitionController.cancel);

router.use(roleMiddleware(UserRole.ADMIN, UserRole.TEACHER));
router.put('/:id/approve', validate(schemas.requisition.approve), RequisitionController.approve);
router.put('/:id/reject', validate(schemas.requisition.reject), RequisitionController.reject);

router.use(roleMiddleware(UserRole.ADMIN, UserRole.WAREHOUSE));
router.put('/:id/deliver', RequisitionController.deliver);
router.put('/:id/return', validate(schemas.requisition.returnItem), RequisitionController.return);
router.put('/:id/scrap', validate(schemas.requisition.scrap), RequisitionController.scrap);

export default router;
