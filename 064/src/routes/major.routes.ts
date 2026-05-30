import { Router } from 'express';
import { MajorController } from '../controllers/major.controller';
import { authMiddleware, roleMiddleware } from '../middlewares/auth';
import { operationLogMiddleware } from '../middlewares/operationLog';
import { UserRole } from '../types';

const router = Router();

router.use(authMiddleware);

router.get('/tree', MajorController.getTree);
router.get('/', MajorController.getList);
router.get('/:id', MajorController.getById);

router.use(roleMiddleware(UserRole.ADMIN, UserRole.SUPER_ADMIN));

router.post('/', operationLogMiddleware('专业管理', '创建专业'), MajorController.create);
router.put('/:id', operationLogMiddleware('专业管理', '更新专业'), MajorController.update);
router.delete('/:id', operationLogMiddleware('专业管理', '删除专业'), MajorController.delete);
router.patch('/:id/status', operationLogMiddleware('专业管理', '更新专业状态'), MajorController.toggleStatus);

export default router;
