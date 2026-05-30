import { Router } from 'express';
import { costReportController } from '../controllers/costReportController';
import { authenticate, requirePermission, Permission } from '../middlewares/auth';
import { costReportValidators, validate, idValidation, paginationValidation } from '../middlewares/validation';

const router = Router();

router.use(authenticate);

router.post('/generate',
  costReportValidators.generate,
  validate,
  requirePermission(Permission.COST_REPORT.CREATE),
  costReportController.generateReport
);

router.get('/summary',
  costReportValidators.summary,
  validate,
  requirePermission(Permission.COST_REPORT.VIEW),
  costReportController.getSummary
);

router.get('/category-analysis',
  costReportValidators.summary,
  validate,
  requirePermission(Permission.COST_REPORT.VIEW),
  costReportController.getCategoryAnalysis
);

router.get('/material-analysis',
  costReportValidators.summary,
  validate,
  requirePermission(Permission.COST_REPORT.VIEW),
  costReportController.getMaterialAnalysis
);

router.get('/',
  paginationValidation,
  validate,
  requirePermission(Permission.COST_REPORT.VIEW),
  costReportController.getList
);

router.get('/:id',
  idValidation,
  validate,
  requirePermission(Permission.COST_REPORT.VIEW),
  costReportController.getById
);

router.delete('/:id',
  idValidation,
  validate,
  requirePermission(Permission.COST_REPORT.DELETE),
  costReportController.delete
);

export default router;
