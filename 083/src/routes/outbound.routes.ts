import { Router } from 'express';
import { outboundController } from '../controllers/outbound.controller';
import { authMiddleware, roleMiddleware } from '../middlewares/auth';
import { validate, schemas } from '../middlewares/validate';
import { RoleCode } from '../constants/role';

const router = Router();

router.use(authMiddleware);

router.post(
  '/',
  validate(schemas.outboundOrder.create),
  roleMiddleware(RoleCode.ADMIN, RoleCode.MANAGER, RoleCode.TECHNICIAN),
  outboundController.create.bind(outboundController)
);
router.post(
  '/:id/approve',
  roleMiddleware(RoleCode.ADMIN, RoleCode.MANAGER),
  outboundController.approve.bind(outboundController)
);
router.post(
  '/:id/outbound',
  roleMiddleware(RoleCode.ADMIN, RoleCode.MANAGER, RoleCode.WAREHOUSE_KEEPER),
  outboundController.confirmOutbound.bind(outboundController)
);
router.post(
  '/:id/scrap',
  validate(schemas.outboundOrder.scrap),
  roleMiddleware(RoleCode.ADMIN, RoleCode.MANAGER, RoleCode.TECHNICIAN),
  outboundController.scrap.bind(outboundController)
);
router.post(
  '/:id/return',
  validate(schemas.outboundOrder.return),
  roleMiddleware(RoleCode.ADMIN, RoleCode.MANAGER, RoleCode.WAREHOUSE_KEEPER),
  outboundController.return.bind(outboundController)
);
router.get('/statistics', outboundController.getStatistics.bind(outboundController));
router.get('/:id', outboundController.get.bind(outboundController));
router.get('/list', outboundController.getList.bind(outboundController));

export default router;
