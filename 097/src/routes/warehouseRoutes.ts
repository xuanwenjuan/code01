import { Router } from 'express';
import {
  createDocument,
  getDocumentList,
  getDocumentById,
  approveDocument,
  rejectDocument,
  cancelDocument,
  getStockLogs,
  getDocumentStatistics,
  createDocumentSchema
} from '../controllers/warehouseController';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

router.get('/documents', authMiddleware, getDocumentList);
router.get('/documents/statistics', authMiddleware, getDocumentStatistics);
router.get('/documents/:id', authMiddleware, getDocumentById);
router.post('/documents', authMiddleware, validate(createDocumentSchema), createDocument);
router.post('/documents/:id/approve', authMiddleware, approveDocument);
router.post('/documents/:id/reject', authMiddleware, rejectDocument);
router.post('/documents/:id/cancel', authMiddleware, cancelDocument);

router.get('/stock-logs', authMiddleware, getStockLogs);

export default router;
