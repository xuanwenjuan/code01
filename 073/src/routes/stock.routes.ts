import { Router } from 'express';
import { StockController } from '../controllers/stock.controller';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.middleware';
import { validate, schemas } from '../middlewares/validation.middleware';
import { UserRole } from '../types';

const router = Router();

router.use(authMiddleware);
router.get('/', StockController.getList);
router.get('/flows', validate(schemas.stock.getFlows), StockController.getStockFlows);
router.get('/expiring-soon', StockController.getExpiringSoon);
router.get('/low-stock', StockController.getLowStock);
router.get('/statistics', StockController.getStatistics);
router.get('/reagent/:reagentId/summary', StockController.getReagentStockSummary);
router.get('/:id', StockController.getById);

router.use(roleMiddleware(UserRole.ADMIN, UserRole.WAREHOUSE));
router.post('/inbound', validate(schemas.stock.inbound), StockController.createInbound);
router.put('/:id/inspect', validate(schemas.stock.inspect), StockController.inspect);
router.put('/:id/adjust', StockController.adjustStock);

export default router;
