import { Router } from 'express';
import {
  createExpense,
  getExpenseList,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getMonthlyReport,
  createExpenseSchema,
  updateExpenseSchema
} from '../controllers/expense.controller';
import { validate } from '../middlewares/validation.middleware';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.middleware';
import { UserRole } from '../constants/enum';

const router = Router();

router.get('/', authMiddleware, getExpenseList);
router.get('/report', authMiddleware, getMonthlyReport);
router.get('/:id', authMiddleware, getExpenseById);
router.post(
  '/',
  authMiddleware,
  roleMiddleware(UserRole.ADMIN, UserRole.FINANCE),
  validate(createExpenseSchema),
  createExpense
);
router.put(
  '/:id',
  authMiddleware,
  roleMiddleware(UserRole.ADMIN, UserRole.FINANCE),
  validate(updateExpenseSchema),
  updateExpense
);
router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware(UserRole.ADMIN),
  deleteExpense
);

export default router;
