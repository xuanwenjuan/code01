import { Router } from 'express';
import { TeacherController } from '../controllers/teacher.controller';
import { authMiddleware, roleMiddleware } from '../middlewares/auth';
import { operationLogMiddleware } from '../middlewares/operationLog';
import { UserRole } from '../types';

const router = Router();

router.use(authMiddleware);

router.get('/available', TeacherController.getAvailableTeachers);
router.get('/', TeacherController.getList);
router.get('/:id', TeacherController.getById);

router.use(roleMiddleware(UserRole.ADMIN, UserRole.SUPER_ADMIN));

router.post('/', operationLogMiddleware('讲师管理', '创建讲师'), TeacherController.create);
router.put('/:id', operationLogMiddleware('讲师管理', '更新讲师'), TeacherController.update);
router.delete('/:id', operationLogMiddleware('讲师管理', '删除讲师'), TeacherController.delete);
router.patch('/:id/status', operationLogMiddleware('讲师管理', '更新讲师状态'), TeacherController.updateStatus);

export default router;
