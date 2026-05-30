import { Router } from 'express';
import { StudentController } from '../controllers/student.controller';
import { authMiddleware, roleMiddleware } from '../middlewares/auth';
import { operationLogMiddleware } from '../middlewares/operationLog';
import { UserRole } from '../types';

const router = Router();

router.use(authMiddleware);

router.get('/', StudentController.getList);
router.get('/:id', StudentController.getById);

router.use(roleMiddleware(UserRole.ADMIN, UserRole.SUPER_ADMIN));

router.post('/', operationLogMiddleware('学员管理', '创建学员'), StudentController.create);
router.put('/:id', operationLogMiddleware('学员管理', '更新学员'), StudentController.update);
router.delete('/:id', operationLogMiddleware('学员管理', '删除学员'), StudentController.delete);
router.patch('/:id/status', operationLogMiddleware('学员管理', '更新学员状态'), StudentController.updateStatus);

export default router;
