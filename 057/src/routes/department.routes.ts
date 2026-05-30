import { Router } from 'express';
import * as departmentController from '../controllers/department.controller';
import { validate } from '../middleware/validation';
import { createDepartmentSchema, updateDepartmentSchema } from '../validation/department.validation';
import { authenticate, requireManagerOrAdmin } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/tree', departmentController.getDepartmentTree);
router.get('/stats', departmentController.getDepartmentStats);
router.get('/:id', departmentController.getDepartmentById);

router.use(requireManagerOrAdmin);

router.post('/', validate(createDepartmentSchema), departmentController.createDepartment);
router.put('/:id', validate(updateDepartmentSchema), departmentController.updateDepartment);
router.delete('/:id', departmentController.deleteDepartment);

export default router;
