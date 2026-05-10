import express from 'express';
import * as controller from '../controllers/category.controller';

const router = express.Router();

router.get('/', controller.getCategories);
router.get('/tree', controller.getCategoriesTree);
router.get('/:id', controller.getCategory);
router.post('/', controller.createCategory);
router.put('/:id', controller.updateCategory);
router.delete('/:id', controller.deleteCategory);

export default router;
