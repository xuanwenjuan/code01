import { Router } from 'express';
import { LessonController } from '../controllers/lesson.controller';
import { authMiddleware, roleMiddleware } from '../middlewares/auth';
import { operationLogMiddleware } from '../middlewares/operationLog';
import { UserRole } from '../types';

const router = Router();

router.use(authMiddleware);

router.get('/', LessonController.getList);
router.get('/:id', LessonController.getById);

router.use(roleMiddleware(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.TEACHER));

router.post('/', operationLogMiddleware('课时管理', '创建课时'), LessonController.create);
router.put('/:id', operationLogMiddleware('课时管理', '更新课时'), LessonController.update);
router.delete('/:id', operationLogMiddleware('课时管理', '删除课时'), LessonController.delete);
router.post('/:id/complete', operationLogMiddleware('课时管理', '完成课时'), LessonController.complete);

export default router;
