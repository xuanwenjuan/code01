import Settlement, { SettlementAttributes, SettlementStatus, SettlementType } from '../models/Settlement';
import WorkOrder from '../models/WorkOrder';
import Collection from '../models/Collection';
import Category from '../models/Category';
import User from '../models/User';
import { NotFoundException, BusinessException } from '../exceptions/BusinessException';
import { Op, fn, col, literal } from 'sequelize';
import sequelize from '../config/database';

class SettlementService {
  generateSettlementNo(): string {
    const date = new Date();
    const prefix = 'ST' + date.getFullYear() + String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return prefix + random;
  }

  async createSettlement(data: Omit<SettlementAttributes, 'id' | 'settlementNo' | 'status'> & { settledBy?: number }) {
    const t = await sequelize.transaction();

    try {
      const settlementNo = this.generateSettlementNo();
      const settlement = await Settlement.create({
        ...data,
        settlementNo,
        status: SettlementStatus.PENDING
      }, { transaction: t });

      await t.commit();
      return settlement;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async generateMonthlySettlement(year: number, month: number, type: SettlementType) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const whereClause: any = {
      createdAt: {
        [Op.between]: [startDate, endDate]
      }
    };

    if (type === SettlementType.REPAIR) {
      whereClause.type = 'repair';
    } else if (type === SettlementType.CONSIGN) {
      whereClause.type = 'consign';
    }

    const stats = await WorkOrder.findAll({
      where: whereClause,
      attributes: [
        [fn('COUNT', col('id')), 'totalWorkOrders'],
        [fn('SUM', col('laborFee')), 'totalLaborFee'],
        [fn('SUM', col('partsFee')), 'totalPartsFee'],
        [fn('SUM', literal('laborFee + partsFee')), 'totalRepairIncome'],
        [fn('SUM', col('commissionAmount')), 'totalCommissionAmount'],
        [fn('SUM', col('salePrice')), 'totalConsignIncome']
      ],
      raw: true
    });

    const stat = stats[0] as any;

    return this.createSettlement({
      type,
      startDate,
      endDate,
      totalWorkOrders: Number(stat.totalWorkOrders) || 0,
      totalLaborFee: Number(stat.totalLaborFee) || 0,
      totalPartsFee: Number(stat.totalPartsFee) || 0,
      totalRepairIncome: Number(stat.totalRepairIncome) || 0,
      totalCommissionAmount: Number(stat.totalCommissionAmount) || 0,
      totalConsignIncome: Number(stat.totalConsignIncome) || 0
    });
  }

  async getSettlementById(id: number) {
    const settlement = await Settlement.findByPk(id, {
      include: [
        { model: WorkOrder, as: 'workOrder' },
        { model: User, as: 'settlor', attributes: ['id', 'realName', 'username'] }
      ]
    });
    if (!settlement) {
      throw new NotFoundException('结算单不存在');
    }
    return settlement;
  }

  async getSettlementList(params: {
    page?: number;
    pageSize?: number;
    type?: SettlementType;
    status?: SettlementStatus;
    startDate?: string;
    endDate?: string;
  }) {
    const { page = 1, pageSize = 10, type, status, startDate, endDate } = params;

    const where: any = {};
    if (type) where.type = type;
    if (status) where.status = status;
    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const { count, rows } = await Settlement.findAndCountAll({
      where,
      limit: pageSize,
      offset: (page - 1) * pageSize,
      order: [['id', 'DESC']],
      include: [
        { model: User, as: 'settlor', attributes: ['id', 'realName'] }
      ]
    });

    return {
      list: rows,
      total: count,
      page,
      pageSize
    };
  }

  async confirmSettlement(id: number, settledBy: number) {
    const settlement = await Settlement.findByPk(id);
    if (!settlement) {
      throw new NotFoundException('结算单不存在');
    }

    if (settlement.status !== SettlementStatus.PENDING) {
      throw new BusinessException('只有待确认的结算单可以确认');
    }

    await settlement.update({
      status: SettlementStatus.SETTLED,
      settledAt: new Date(),
      settledBy
    });

    return settlement;
  }

  async cancelSettlement(id: number) {
    const settlement = await Settlement.findByPk(id);
    if (!settlement) {
      throw new NotFoundException('结算单不存在');
    }

    if (settlement.status === SettlementStatus.SETTLED) {
      throw new BusinessException('已结算的单据不能取消');
    }

    await settlement.update({
      status: SettlementStatus.CANCELLED
    });

    return settlement;
  }

  async getStatisticsByCategory(startDate: Date, endDate: Date) {
    const sql = `
      SELECT 
        c.id as categoryId,
        c.name as categoryName,
        COUNT(wo.id) as workOrderCount,
        SUM(wo.laborFee) as totalLaborFee,
        SUM(wo.partsFee) as totalPartsFee,
        SUM(wo.laborFee + wo.partsFee) as totalRepairIncome,
        SUM(wo.commissionAmount) as totalCommission
      FROM work_orders wo
      LEFT JOIN collections col ON wo.collectionId = col.id
      LEFT JOIN categories c ON col.categoryId = c.id
      WHERE wo.createdAt BETWEEN ? AND ?
      GROUP BY c.id, c.name
      ORDER BY totalRepairIncome DESC
    `;

    const [results] = await sequelize.query(sql, {
      replacements: [startDate, endDate]
    });

    return results;
  }

  async getStatisticsByRepairer(startDate: Date, endDate: Date) {
    const sql = `
      SELECT 
        u.id as repairerId,
        u.realName as repairerName,
        COUNT(wo.id) as workOrderCount,
        SUM(wo.laborFee) as totalLaborFee,
        SUM(wo.partsFee) as totalPartsFee,
        SUM(wo.laborFee + wo.partsFee) as totalRepairIncome
      FROM work_orders wo
      LEFT JOIN users u ON wo.repairerId = u.id
      WHERE wo.createdAt BETWEEN ? AND ? AND wo.repairerId IS NOT NULL
      GROUP BY u.id, u.realName
      ORDER BY totalRepairIncome DESC
    `;

    const [results] = await sequelize.query(sql, {
      replacements: [startDate, endDate]
    });

    return results;
  }

  async exportSettlementData(startDate: Date, endDate: Date, type?: SettlementType) {
    const where: any = {
      createdAt: {
        [Op.between]: [startDate, endDate]
      }
    };
    if (type) where.type = type;

    const settlements = await Settlement.findAll({
      where,
      order: [['createdAt', 'DESC']],
      include: [
        { model: User, as: 'settlor', attributes: ['id', 'realName'] }
      ]
    });

    return settlements.map(s => ({
      settlementNo: s.settlementNo,
      type: s.type,
      status: s.status,
      startDate: s.startDate,
      endDate: s.endDate,
      totalWorkOrders: s.totalWorkOrders,
      totalLaborFee: s.totalLaborFee,
      totalPartsFee: s.totalPartsFee,
      totalRepairIncome: s.totalRepairIncome,
      totalCommissionAmount: s.totalCommissionAmount,
      totalConsignIncome: s.totalConsignIncome,
      settledAt: s.settledAt,
      settlorName: s.settlor?.realName,
      remarks: s.remarks
    }));
  }

  async getReconciliationDetails(settlementId: number) {
    const settlement = await this.getSettlementById(settlementId);

    const workOrders = await WorkOrder.findAll({
      where: {
        createdAt: {
          [Op.between]: [settlement.startDate, settlement.endDate]
        },
        type: settlement.type === 'repair' ? 'repair' : { [Op.or]: ['repair', 'consign'] }
      },
      include: [
        { model: Collection, as: 'collection', attributes: ['id', 'collectionNo', 'name'] },
        { model: User, as: 'repairer', attributes: ['id', 'realName'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    return {
      settlement,
      workOrders
    };
  }
}

export default new SettlementService();