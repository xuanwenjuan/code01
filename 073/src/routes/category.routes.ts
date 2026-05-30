import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.middleware';
import { validate, schemas } from '../middlewares/validation.middleware';
import { UserRole } from '../types';

const router = Router();

router.get('/tree', CategoryController.getTree);
router.get('/list', CategoryController.getList);
router.get('/path/:id', validate(schemas.category.getById), CategoryController.getPath);
router.get('/children/:parentId', CategoryController.getChildren);
router.get('/:id', validate(schemas.category.getById), CategoryController.getById);

router.use(authMiddleware);
router.post('/', roleMiddleware(UserRole.ADMIN, UserRole.WAREHOUSE), validate(schemas.category.create), CategoryController.create);
router.put('/:id', roleMiddleware(UserRole.ADMIN, UserRole.WAREHOUSE), validate(schemas.category.update), CategoryController.update);
router.patch('/:id/status', roleMiddleware(UserRole.ADMIN, UserRole.WAREHOUSE), validate(schemas.category.getById), CategoryController.toggleStatus);

export default router;
