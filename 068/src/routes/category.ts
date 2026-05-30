import { Router } from 'express';
import Joi from 'joi';
import {
  createCategory,
  getCategoryTree,
  getCategoryById,
  updateCategory,
  deleteCategory,
  getCategoryList,
} from '../controllers/categoryController';
import { authMiddleware, requirePermission } from '../middlewares/auth';
import { validate, validateIdParam, paginationSchema } from '../middlewares/validate';

const router = Router();

const categorySchema = Joi.object({
  name: Joi.string().required(),
  parentId: Joi.number().integer().positive().allow(null).optional(),
  icon: Joi.string().optional(),
  sort: Joi.number().integer().default(0),
  status: Joi.number().valid(0, 1).default(1),
});

const categoryQuerySchema = paginationSchema.concat(
  Joi.object({
    status: Joi.number().valid(0, 1).optional(),
    keyword: Joi.string().optional(),
  })
);

router.get('/tree', getCategoryTree);
router.get('/list', validate({ query: categoryQuerySchema }), getCategoryList);
router.get('/:id', validate({ params: validateIdParam }), getCategoryById);

router.use(authMiddleware);
router.post('/', requirePermission('category:write'), validate({ body: categorySchema }), createCategory);
router.put('/:id', requirePermission('category:write'), validate({ params: validateIdParam, body: categorySchema }), updateCategory);
router.delete('/:id', requirePermission('category:write'), validate({ params: validateIdParam }), deleteCategory);

export default router;
