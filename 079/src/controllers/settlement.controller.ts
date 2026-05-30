import { Response } from 'express'
import { ResponseUtil } from '../utils/response'
import { AuthRequest } from '../middlewares/auth.middleware'
import { OperationModule, OperationAction, SettlementStatus, UserRole } from '../types'
import { SettlementService } from '../services/settlement.service'
import { logOperation } from '../middlewares/log.middleware'
import { Dealer } from '../models'
import { BadRequestError, ForbiddenError } from '../middlewares/error.middleware'

export const createSettlement = async (req: AuthRequest, res: Response): Promise<void> => {
  const startTime = Date.now()
  const { dealerId, startDate, endDate } = req.body

  try {
    const settlement = await SettlementService.createSettlement(
      {
        dealerId: Number(dealerId),
        startDate: new Date(startDate),
        endDate: new Date(endDate)
      },
      req.user!.userId
    )

    await logOperation(OperationModule.SETTLEMENT, OperationAction.CREATE, req, true, {
      params: { dealerId, startDate, endDate },
      result: JSON.stringify({ settlementId: settlement.id, settlementNo: settlement.settlementNo }),
      duration: Date.now() - startTime
    })

    res.json(ResponseUtil.success(settlement, '结算单创建成功'))
  } catch (error) {
    await logOperation(OperationModule.SETTLEMENT, OperationAction.CREATE, req, false, {
      params: { dealerId, startDate, endDate },
      errorMsg: error instanceof Error ? error.message : '结算单创建失败',
      duration: Date.now() - startTime
    })
    throw error
  }
}

export const getSettlementList = async (req: AuthRequest, res: Response): Promise<void> => {
  const { page = 1, pageSize = 10, dealerId, status, startDate, endDate } = req.query

  const filters: any = {}
  if (dealerId) filters.dealerId = Number(dealerId)
  if (status) filters.status = status
  if (startDate) filters.startDate = new Date(startDate as string)
  if (endDate) filters.endDate = new Date(endDate as string)

  if (req.user!.role === UserRole.DEALER) {
    const dealer = await Dealer.findOne({ where: { userId: req.user!.userId } })
    if (!dealer) {
      throw new BadRequestError('经销商信息不存在')
    }
    filters.dealerId = dealer.id
  }

  const { count, rows } = await SettlementService.getSettlementList(filters, Number(page), Number(pageSize))

  res.json(ResponseUtil.paginated(rows, count, Number(page), Number(pageSize)))
}

export const getSettlementDetail = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params

  const result = await SettlementService.getSettlementDetail(Number(id))

  if (req.user!.role === UserRole.DEALER) {
    const dealer = await Dealer.findOne({ where: { userId: req.user!.userId } })
    if (!dealer || result.settlement.dealerId !== dealer.id) {
      throw new ForbiddenError('无权查看此结算单')
    }
  }

  res.json(ResponseUtil.success(result, '获取成功'))
}

export const updateSettlementStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  const startTime = Date.now()
  const { id } = req.params
  const { status, paidAmount, remarks } = req.body

  try {
    await SettlementService.updateSettlementStatus(
      Number(id),
      status,
      Number(paidAmount),
      remarks,
      req.user!.userId
    )

    await logOperation(OperationModule.SETTLEMENT, OperationAction.UPDATE, req, true, {
      params: { id, status, paidAmount, remarks },
      duration: Date.now() - startTime
    })

    res.json(ResponseUtil.success(null, '状态更新成功'))
  } catch (error) {
    await logOperation(OperationModule.SETTLEMENT, OperationAction.UPDATE, req, false, {
      params: { id, status, paidAmount, remarks },
      errorMsg: error instanceof Error ? error.message : '状态更新失败',
      duration: Date.now() - startTime
    })
    throw error
  }
}

export const getDealerStatistics = async (req: AuthRequest, res: Response): Promise<void> => {
  const { dealerId, year, quarter, month } = req.query

  if (!year) {
    throw new BadRequestError('年份不能为空')
  }

  const stats = await SettlementService.getDealerStatistics(
    Number(dealerId),
    Number(year),
    quarter ? Number(quarter) : undefined,
    month ? Number(month) : undefined
  )

  res.json(ResponseUtil.success(stats, '获取成功'))
}

export const generateMonthlySettlements = async (req: AuthRequest, res: Response): Promise<void> => {
  const { year, month } = req.body

  if (!year || !month) {
    throw new BadRequestError('年份和月份不能为空')
  }

  const settlements = await SettlementService.generateMonthlySettlements(
    Number(year),
    Number(month),
    req.user!.userId
  )

  res.json(ResponseUtil.success(settlements, `成功生成 ${settlements.length} 个结算单`))
}
