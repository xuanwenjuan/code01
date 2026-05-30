import { Router } from 'express';
import { supplierController } from '../controllers/supplier.controller';
import { authMiddleware, roleMiddleware } from '../middlewares/auth';
import { validate, schemas } from '../middlewares/validate';
import { RoleCode } from '../constants/role';

const router = Router();

router.use(authMiddleware);

router.post(
  '/',
  validate(schemas.supplier.create),
  roleMiddleware(RoleCode.ADMIN, RoleCode.MANAGER, RoleCode.PURCHASER),
  supplierController.create.bind(supplierController)
);
router.put(
  '/:id',
  validate(schemas.supplier.update),
  roleMiddleware(RoleCode.ADMIN, RoleCode.MANAGER, RoleCode.PURCHASER),
  supplierController.update.bind(supplierController)
);
router.delete(
  '/:id',
  roleMiddleware(RoleCode.ADMIN, RoleCode.MANAGER),
  supplierController.delete.bind(supplierController)
);
router.get('/:id', supplierController.get.bind(supplierController));
router.get('/list', supplierController.getList.bind(supplierController));

export default router;
