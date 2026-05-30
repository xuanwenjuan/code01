import { Router } from 'express';
import { validate } from '../middlewares/validate';
import { authMiddleware, roleGuard } from '../middlewares/auth';
import * as auntController from '../controllers/aunt.controller';
import { UserRole } from '../types';

const router = Router();

router.get('/list', validate(auntController.getAuntListSchema), auntController.getAuntProfileList);
router.get('/detail/:id', validate(auntController.getAuntProfileByIdSchema), auntController.getAuntProfileById);

router.use(authMiddleware);

router.get('/my/profile', auntController.getMyAuntProfile);
router.post('/', validate(auntController.createAuntProfileSchema), auntController.createAuntProfile);
router.put('/:id', validate(auntController.updateAuntProfileSchema), auntController.updateAuntProfile);

router.use(roleGuard(UserRole.ADMIN, UserRole.OPERATOR));

router.put('/:id/review', validate(auntController.reviewAuntProfileSchema), auntController.reviewAuntProfile);

export default router;
