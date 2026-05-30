import { Router } from 'express'
import { createSettlement, getSettlementList, getSettlementDetail, updateSettlementStatus, getDealerStatistics, generateMonthlySettlements } from '../controllers/settlement.controller'
import { authenticate, authorize } from '../middlewares/auth.middleware'
import { UserRole } from '../types'

const router = Router()

router.use(authenticate)

router.get('/statistics', authorize(UserRole.ADMIN, UserRole.FINANCE, UserRole.MANAGER), getDealerStatistics)
router.get('/', getSettlementList)
router.get('/:id', getSettlementDetail)

router.use(authorize(UserRole.ADMIN, UserRole.FINANCE))

router.post('/', createSettlement)
router.post('/generate-monthly', generateMonthlySettlements)
router.put('/:id/status', updateSettlementStatus)

export default router
