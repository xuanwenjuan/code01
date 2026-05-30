import { Router } from 'express';
import { ReagentController } from '../controllers/reagent.controller';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.middleware';
import { validate, schemas } from '../middlewares/validation.middleware';
import { UserRole } from '../types';

const router = Router();

router.use(authMiddleware);
router.get('/', ReagentController.getList);
router.get('/active', ReagentController.getAllActive);
router.get('/:id', ReagentController.getById);

router.use(roleMiddleware(UserRole.ADMIN, UserRole.WAREHOUSE));
router.post('/', validate(schemas.reagent.create), ReagentController.create);
router.put('/:id', validate(schemas.reagent.update), ReagentController.update);
router.patch('/:id/status', ReagentController.toggleStatus);

export default router;
