import { Router } from 'express';
import {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategory,
  getCategoryList,
  getCategoryTree,
  batchUpdateStatus
} from '../controllers/category.controller';
import { authenticateJWT, requireAdmin } from '../middlewares/jwt.middleware';
import { validate, validateId, createCategorySchema, updateCategorySchema } from '../middlewares/validate.middleware';

const router = Router();

router.get('/tree', getCategoryTree);
router.get('/:id', validate(validateId, 'params'), getCategory);
router.get('/', getCategoryList);

router.use(authenticateJWT);
router.use(requireAdmin);

router.post('/', validate(createCategorySchema), createCategory);
router.put('/:id', validate(validateId, 'params'), validate(updateCategorySchema), updateCategory);
router.delete('/:id', validate(validateId, 'params'), deleteCategory);
router.patch('/batch/status', batchUpdateStatus);

export default router;
