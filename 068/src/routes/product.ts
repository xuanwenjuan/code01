import { Router } from 'express';
import Joi from 'joi';
import {
  createProduct,
  getProductList,
  getProductById,
  updateProduct,
  deleteProduct,
  batchUpdatePrice,
  updateStock,
} from '../controllers/productController';
import { authMiddleware, requirePermission } from '../middlewares/auth';
import { validate, validateIdParam, paginationSchema } from '../middlewares/validate';

const router = Router();

const productQuerySchema = paginationSchema.concat(
  Joi.object({
    keyword: Joi.string().optional(),
    categoryId: Joi.number().integer().positive().optional(),
    status: Joi.number().valid(0, 1).optional(),
    sortBy: Joi.string().valid('id', 'price', 'stock', 'sort', 'createdAt').default('id'),
    sortOrder: Joi.string().valid('ASC', 'DESC').default('DESC'),
    minPrice: Joi.number().positive().optional(),
    maxPrice: Joi.number().positive().optional(),
    tags: Joi.string().optional(),
  })
);

const productSchema = Joi.object({
  categoryId: Joi.number().integer().positive().required(),
  name: Joi.string().required(),
  description: Joi.string().optional(),
  flowerLanguage: Joi.string().optional(),
  specs: Joi.string().optional(),
  price: Joi.number().positive().precision(2).required(),
  originalPrice: Joi.number().positive().precision(2).optional(),
  stock: Joi.number().integer().min(0).default(0),
  images: Joi.string().optional(),
  tags: Joi.string().optional(),
  discountStart: Joi.date().optional(),
  discountEnd: Joi.date().optional(),
  sort: Joi.number().integer().default(0),
  status: Joi.number().valid(0, 1).default(1),
});

const batchPriceSchema = Joi.object({
  ids: Joi.array().items(Joi.number().integer().positive()).required(),
  priceAdjustment: Joi.number().optional(),
  percentage: Joi.number().optional(),
});

const stockSchema = Joi.object({
  stock: Joi.number().integer().min(0).required(),
});

router.get('/list', validate({ query: productQuerySchema }), getProductList);
router.get('/:id', validate({ params: validateIdParam }), getProductById);

router.use(authMiddleware);
router.post('/', requirePermission('product:write'), validate({ body: productSchema }), createProduct);
router.put('/:id', requirePermission('product:write'), validate({ params: validateIdParam, body: productSchema }), updateProduct);
router.delete('/:id', requirePermission('product:write'), validate({ params: validateIdParam }), deleteProduct);
router.post('/batch-price', requirePermission('product:write'), validate({ body: batchPriceSchema }), batchUpdatePrice);
router.put('/:id/stock', requirePermission('product:write'), validate({ params: validateIdParam, body: stockSchema }), updateStock);

export default router;
