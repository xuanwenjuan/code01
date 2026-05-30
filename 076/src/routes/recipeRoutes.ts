import { Router } from 'express';
import {
  createRecipe,
  updateRecipe,
  deleteRecipe,
  getRecipe,
  getRecipeList,
  addRecipeItem,
  updateRecipeItem,
  deleteRecipeItem
} from '../controllers/recipeController';
import { authenticate, requireStaff, requireStoreManager } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';
import { recipeSchemas } from '../validation/schemas';

const router = Router();

router.use(authenticate, requireStaff);
router.get('/', getRecipeList);
router.get('/:id', getRecipe);
router.post('/', validateRequest({ body: recipeSchemas.create }), createRecipe);
router.put('/:id', validateRequest({ body: recipeSchemas.update }), updateRecipe);
router.delete('/:id', deleteRecipe);
router.post('/:recipeId/items', validateRequest({ body: recipeSchemas.item }), addRecipeItem);
router.put('/items/:id', updateRecipeItem);
router.delete('/items/:id', deleteRecipeItem);

export default router;
