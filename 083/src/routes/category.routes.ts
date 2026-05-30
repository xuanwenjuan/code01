import { Router } from 'express';
import { categoryController } from '../controllers/category.controller';
import { authMiddleware, roleMiddleware } from '../middlewares/auth';
import { validate, schemas } from '../middlewares/validate';
import { RoleCode } from '../constants/role';

const router = Router();

router.use(authMiddleware);

router.post(
  '/',
  validate(schemas.category.create),
  roleMiddleware(RoleCode.ADMIN, RoleCode.MANAGER),
  categoryController.create.bind(categoryController)
);
router.put(
  '/:id',
  validate(schemas.category.update),
  roleMiddleware(RoleCode.ADMIN, RoleCode.MANAGER),
  categoryController.update.bind(categoryController)
);
router.delete(
  '/:id',
  roleMiddleware(RoleCode.ADMIN, RoleCode.MANAGER),
  categoryController.delete.bind(categoryController)
);
router.get('/:id', categoryController.get.bind(categoryController));
router.get('/tree', categoryController.getTree.bind(categoryController));
router.get('/list', categoryController.getList.bind(categoryController));

export default router;
