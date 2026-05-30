import { Router } from 'express';
import { forageController } from '../controllers/forage.controller';
import { authenticate, authorize } from '../middlewares/auth';
import { validate } from '../middlewares/validation';
import { categorySchemas } from '../validations';

const router = Router();

router.post('/categories', authenticate, authorize('forage:write'), validate({ body: categorySchemas.create.body }), forageController.createCategory);
router.get('/categories/tree', authenticate, authorize('forage:read'), forageController.getCategoryTree);
router.get('/categories', authenticate, authorize('forage:read'), validate({ query: categorySchemas.list.query }), forageController.getCategories);
router.get('/categories/:id', authenticate, authorize('forage:read'), validate({ params: categorySchemas.update.params }), forageController.getCategory);
router.put('/categories/:id', authenticate, authorize('forage:write'), validate({ params: categorySchemas.update.params, body: categorySchemas.update.body }), forageController.updateCategory);
router.delete('/categories/:id', authenticate, authorize('forage:delete'), validate({ params: categorySchemas.update.params }), forageController.deleteCategory);
router.put('/categories/:id/inventory', authenticate, authorize('inventory:write'), validate({ params: categorySchemas.inventoryUpdate.params, body: categorySchemas.inventoryUpdate.body }), forageController.updateInventory);

export default router;
