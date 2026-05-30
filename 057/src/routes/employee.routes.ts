import { Router } from 'express';
import * as employeeController from '../controllers/employee.controller';
import { validate, validatePagination, validateId } from '../middleware/validation';
import { createEmployeeSchema, updateEmployeeSchema, confirmEmployeeSchema, resignEmployeeSchema } from '../validation/employee.validation';
import { authenticate, requireManagerOrAdmin, requireEmployeeOwnerOrAdmin } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/me', employeeController.getMyProfile);
router.get('/', validatePagination, employeeController.getEmployeeList);
router.get('/stats', employeeController.getEmployeeStats);
router.get('/:id', validateId(), employeeController.getEmployeeById);
router.get('/:id/history', validateId(), validatePagination, employeeController.getEmployeeHistory);

router.use(requireManagerOrAdmin);

router.post('/', validate(createEmployeeSchema), employeeController.createEmployee);
router.put('/:id', validateId(), validate(updateEmployeeSchema), employeeController.updateEmployee);
router.delete('/:id', validateId(), employeeController.deleteEmployee);
router.put('/:id/confirm', validateId(), validate(confirmEmployeeSchema), employeeController.confirmEmployee);
router.put('/:id/resign', validateId(), validate(resignEmployeeSchema), employeeController.resignEmployee);
router.put('/:id/terminate', validateId(), employeeController.terminateEmployee);

export default router;
