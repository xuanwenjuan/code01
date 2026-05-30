import { Router } from 'express';
import { purchaseController } from '../controllers/purchase.controller';
import { authMiddleware, roleMiddleware } from '../middlewares/auth';
import { validate, schemas } from '../middlewares/validate';
import { RoleCode } from '../constants/role';

const router = Router();

router.use(authMiddleware);

router.post(
  '/',
  validate(schemas.purchaseOrder.create),
  roleMiddleware(RoleCode.ADMIN, RoleCode.MANAGER, RoleCode.PURCHASER),
  purchaseController.create.bind(purchaseController)
);
router.put(
  '/:id',
  validate(schemas.purchaseOrder.update),
  roleMiddleware(RoleCode.ADMIN, RoleCode.MANAGER, RoleCode.PURCHASER),
  purchaseController.update.bind(purchaseController)
);
router.post(
  '/:id/accept',
  roleMiddleware(RoleCode.ADMIN, RoleCode.MANAGER, RoleCode.PURCHASER),
  purchaseController.accept.bind(purchaseController)
);
router.post(
  '/:id/arrival',
  roleMiddleware(RoleCode.ADMIN, RoleCode.MANAGER, RoleCode.WAREHOUSE_KEEPER),
  purchaseController.confirmArrival.bind(purchaseController)
);
router.post(
  '/:id/inspect',
  validate(schemas.purchaseOrder.inspect),
  roleMiddleware(RoleCode.ADMIN, RoleCode.MANAGER, RoleCode.WAREHOUSE_KEEPER),
  purchaseController.inspect.bind(purchaseController)
);
router.post(
  '/:id/inbound',
  validate(schemas.purchaseOrder.inbound),
  roleMiddleware(RoleCode.ADMIN, RoleCode.MANAGER, RoleCode.WAREHOUSE_KEEPER),
  purchaseController.inbound.bind(purchaseController)
);
router.post(
  '/:id/reject',
  roleMiddleware(RoleCode.ADMIN, RoleCode.MANAGER),
  purchaseController.reject.bind(purchaseController)
);
router.get('/:id', purchaseController.get.bind(purchaseController));
router.get('/list', purchaseController.getList.bind(purchaseController));

export default router;
