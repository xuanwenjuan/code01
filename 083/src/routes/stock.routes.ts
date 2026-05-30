import { Router } from 'express';
import { stockController } from '../controllers/stock.controller';
import { authMiddleware, roleMiddleware } from '../middlewares/auth';
import { validate, schemas } from '../middlewares/validate';
import { RoleCode } from '../constants/role';

const router = Router();

router.use(authMiddleware);

router.get('/list', stockController.getStockList.bind(stockController));
router.get('/logs', stockController.getStockLogList.bind(stockController));
router.post(
  '/adjust',
  validate(schemas.stock.adjust),
  roleMiddleware(RoleCode.ADMIN, RoleCode.MANAGER, RoleCode.WAREHOUSE_KEEPER),
  stockController.adjustStock.bind(stockController)
);

export default router;
