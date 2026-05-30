import { Router } from 'express';
import { partController } from '../controllers/part.controller';
import { authMiddleware, roleMiddleware } from '../middlewares/auth';
import { validate, schemas } from '../middlewares/validate';
import { RoleCode } from '../constants/role';

const router = Router();

router.use(authMiddleware);

router.post(
  '/',
  validate(schemas.part.create),
  roleMiddleware(RoleCode.ADMIN, RoleCode.MANAGER, RoleCode.PURCHASER),
  partController.create.bind(partController)
);
router.put(
  '/:id',
  validate(schemas.part.update),
  roleMiddleware(RoleCode.ADMIN, RoleCode.MANAGER, RoleCode.PURCHASER),
  partController.update.bind(partController)
);
router.delete(
  '/:id',
  roleMiddleware(RoleCode.ADMIN, RoleCode.MANAGER),
  partController.delete.bind(partController)
);
router.get('/:id', partController.get.bind(partController));
router.get('/list', partController.getList.bind(partController));

export default router;
