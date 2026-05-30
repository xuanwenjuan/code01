import { Router } from 'express';
import {
  createIngredient,
  updateIngredient,
  updateStock,
  recordLoss,
  deleteIngredient,
  getIngredient,
  getIngredientList,
  getLowStockAlert
} from '../controllers/ingredientController';
import { authenticate, requireStaff } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';
import { ingredientSchemas } from '../validation/schemas';

const router = Router();

router.use(authenticate, requireStaff);
router.get('/low-stock', getLowStockAlert);
router.post('/', validateRequest({ body: ingredientSchemas.create }), createIngredient);
router.get('/', validateRequest({ query: ingredientSchemas.query }), getIngredientList);
router.get('/:id', getIngredient);
router.put('/:id', validateRequest({ body: ingredientSchemas.update }), updateIngredient);
router.put('/:id/stock', validateRequest({ body: ingredientSchemas.updateStock }), updateStock);
router.post('/loss', validateRequest({ body: ingredientSchemas.loss }), recordLoss);
router.delete('/:id', deleteIngredient);

export default router;
