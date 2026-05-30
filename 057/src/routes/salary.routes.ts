import { Router } from 'express';
import * as salaryController from '../controllers/salary.controller';
import { authenticate, requireManagerOrAdmin } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/my', salaryController.getMySalary);
router.get('/my/history', salaryController.getMySalaryHistory);
router.get('/check-calculated', salaryController.checkSalaryCalculated);
router.get('/', salaryController.getSalaryList);
router.get('/stats', salaryController.getSalaryStats);
router.get('/department-stats', salaryController.getDepartmentSalaryStats);
router.get('/export', salaryController.exportSalaryToExcel);
router.get('/:id', salaryController.getSalaryById);
router.get('/employee/:employeeId/history', salaryController.getSalaryHistory);

router.use(requireManagerOrAdmin);

router.post('/calculate', salaryController.calculateSalary);
router.put('/:id', salaryController.updateSalary);
router.put('/:id/recalculate', salaryController.recalculateSingleSalary);
router.put('/:id/mark-paid', salaryController.markSingleAsPaid);
router.delete('/', salaryController.deleteSalary);
router.put('/mark-paid', salaryController.markAsPaid);

export default router;
