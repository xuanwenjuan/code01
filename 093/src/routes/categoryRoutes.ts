import { Router } from 'express';
import { categoryController } from '../controllers/categoryController';
import { authenticate, requirePermission, Permission } from '../middlewares/auth';
import { categoryValidators, validate, idValidation, paginationValidation } from '../middlewares/validation';

const router = Router();

router.get('/tree', categoryController.getTree);
router.get('/', paginationValidation, validate, categoryController.getList);
router.get('/:id', idValidation, validate, categoryController.getById);
router.get('/:id/validate', idValidation, validate, categoryController.validateCategory);

router.use(authenticate);

router.post('/',
  categoryValidators.create,
  validate,
  requirePermission(Permission.CATEGORY.CREATE),
  categoryController.create
);

router.put('/:id',
  categoryValidators.update,
  validate,
  requirePermission(Permission.CATEGORY.UPDATE),
  categoryController.update
);

router.delete('/:id',
  idValidation,
  validate,
  requirePermission(Permission.CATEGORY.DELETE),
  categoryController.delete
);

router.patch('/:id/toggle',
  idValidation,
  validate,
  requirePermission(Permission.CATEGORY.UPDATE),
  categoryController.toggleActive
);

export default router;
