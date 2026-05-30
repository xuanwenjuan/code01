import { Op, Transaction } from 'sequelize';
import { Settlement, Worker, Order } from '../models';
import { SettlementStatus } from '../types';
import { sequelize } from '../config/database';
import { NotFoundException, BadRequestException, ForbiddenException } from '../exceptions/HttpException';

export interface WithdrawDto {
  workerId: string;
  settlementIds: string[];
  withdrawTransactionId?: string;
}

export interface SettlementQueryDto {
  workerId?: string;
  status?: SettlementStatus;
  startDate?: Date;
  endDate?: Date;
}

class SettlementService {
  async getSettlementById(id: string) {
    const settlement = await Settlement.findByPk(id, {
      include: [
        { 
          association: 'worker',
          include: [{ association: 'user', attributes: { exclude: ['password'] } }]
        },
        { association: 'order' }
      ]
    });
    
    if (!settlement) {
      throw new NotFoundException('结算记录不存在');
    }

    return settlement;
  }

  async getSettlementList(
    queryDto: SettlementQueryDto,
    page: number = 1,
    pageSize: number = 10
  ) {
    const where: any = {};
    
    if (queryDto.workerId) {
      where.workerId = queryDto.workerId;
    }
    if (queryDto.status) {
      where.status = queryDto.status;
    }
    if (queryDto.startDate && queryDto.endDate) {
      where.createdAt = {
        [Op.between]: [queryDto.startDate, queryDto.endDate]
      };
    }

    const { count, rows } = await Settlement.findAndCountAll({
      where,
      include: [
        { 
          association: 'worker',
          include: [{ association: 'user', attributes: { exclude: ['password'] } }]
        },
        { association: 'order' }
      ],
      order: [['createdAt', 'DESC']],
      offset: (page - 1) * pageSize,
      limit: pageSize
    });

    return {
      list: rows,
      total: count,
      page,
      pageSize
    };
  }

  async getWorkerSettlementSummary(workerId: string) {
    const [pendingResult, settledResult, withdrawnResult] = await Promise.all([
      Settlement.sum('workerAmount', { 
        where: { workerId, status: SettlementStatus.PENDING } 
      }),
      Settlement.sum('workerAmount', { 
        where: { workerId, status: SettlementStatus.SETTLED } 
      }),
      Settlement.sum('workerAmount', { 
        where: { workerId, status: SettlementStatus.WITHDRAWN } 
      })
    ]);

    const totalEarnings = (pendingResult || 0) + (settledResult || 0) + (withdrawnResult || 0);
    const commissionTotal = await Settlement.sum('commissionAmount', { where: { workerId } });
    const orderCount = await Settlement.count({ where: { workerId } });

    return {
      totalEarnings,
      pendingAmount: pendingResult || 0,
      settledAmount: settledResult || 0,
      withdrawnAmount: withdrawnResult || 0,
      commissionTotal: commissionTotal || 0,
      orderCount
    };
  }

  async settlePendingSettlements() {
    const pendingSettlements = await Settlement.findAll({
      where: { status: SettlementStatus.PENDING }
    });

    const result = await sequelize.transaction(async (t: Transaction) => {
      const updatedSettlements: Settlement[] = [];
      
      for (const settlement of pendingSettlements) {
        await settlement.update(
          { 
            status: SettlementStatus.SETTLED, 
            settledAt: new Date() 
          },
          { transaction: t }
        );
        updatedSettlements.push(settlement);
      }

      return updatedSettlements;
    });

    return result;
  }

  async withdraw(withdrawDto: WithdrawDto) {
    const { workerId, settlementIds, withdrawTransactionId } = withdrawDto;

    if (settlementIds.length === 0) {
      throw new BadRequestException('请选择要提现的结算记录');
    }

    const settlements = await Settlement.findAll({
      where: {
        id: { [Op.in]: settlementIds },
        workerId,
        status: SettlementStatus.SETTLED
      }
    });

    if (settlements.length !== settlementIds.length) {
      throw new BadRequestException('部分结算记录不存在或状态不正确，只有已结算的记录可以提现');
    }

    const totalAmount = settlements.reduce((sum, s) => sum + Number(s.workerAmount), 0);

    if (totalAmount <= 0) {
      throw new BadRequestException('提现金额必须大于0');
    }

    const result = await sequelize.transaction(async (t: Transaction) => {
      const updatedSettlements: Settlement[] = [];
      
      for (const settlement of settlements) {
        await settlement.update(
          {
            status: SettlementStatus.WITHDRAWN,
            withdrawnAt: new Date(),
            withdrawTransactionId
          },
          { transaction: t }
        );
        updatedSettlements.push(settlement);
      }

      return {
        settlements: updatedSettlements,
        totalAmount
      };
    });

    return result;
  }

  async getWithdrawHistory(workerId: string, page: number = 1, pageSize: number = 10) {
    const { count, rows } = await Settlement.findAndCountAll({
      where: {
        workerId,
        status: SettlementStatus.WITHDRAWN
      },
      include: [{ association: 'order' }],
      order: [['withdrawnAt', 'DESC']],
      offset: (page - 1) * pageSize,
      limit: pageSize
    });

    return {
      list: rows,
      total: count,
      page,
      pageSize
    };
  }
}

export default new SettlementService();