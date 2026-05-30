import { Router } from 'express';
import { ClassController } from '../controllers/class.controller';
import { authMiddleware, roleMiddleware } from '../middlewares/auth';
import { operationLogMiddleware } from '../middlewares/operationLog';
import { UserRole } from '../types';

const router = Router();

router.use(authMiddleware);

router.get('/', ClassController.getList);
router.get('/:id', ClassController.getById);

router.use(roleMiddleware(UserRole.ADMIN, UserRole.SUPER_ADMIN));

router.post('/', operationLogMiddleware('班级管理', '创建班级'), ClassController.create);
router.put('/:id', operationLogMiddleware('班级管理', '更新班级'), ClassController.update);
router.delete('/:id', operationLogMiddleware('班级管理', '删除班级'), ClassController.delete);
router.patch('/:id/status', operationLogMiddleware('班级管理', '更新班级状态'), ClassController.updateStatus);

export default router;
