import Settlement, { SettlementStatus, SettlementCreationAttributes } from '../models/Settlement';
import SettlementItem from '../models/SettlementItem';
import Order, { OrderStatus } from '../models/Order';
import Branch, { BranchStatus } from '../models/Branch';
import Vehicle from '../models/Vehicle';
import User from '../models/User';
import { NotFoundError, BusinessError, ValidationError } from '../utils/errors';
import { Op, Transaction } from 'sequelize';
import sequelize from '../config/database';
import dayjs from 'dayjs';

class SettlementService {
  private generateSettlementNo(): string {
    const now = dayjs();
    const timestamp = now.format('YYYYMMDDHHmmss');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `JS${timestamp}${random}`;
  }

  private calculateBranchCommission(freightAmount: number, branchType?: string): number {
    let rate = 0.1;
    if (branchType === 'hub') rate = 0.12;
    if (branchType === 'delivery') rate = 0.08;
    return Number((freightAmount * rate).toFixed(2));
  }

  private calculateDriverFreight(freightAmount: number, distance?: number): number {
    let baseRate = 0.6;
    if (distance && distance > 500) baseRate = 0.65;
    return Number((freightAmount * baseRate).toFixed(2));
  }

  private calculatePlatformFee(freightAmount: number): number {
    return Number((freightAmount * 0.05).toFixed(2));
  }

  private calculateInsuranceShare(freightAmount: number, insuranceAmount?: number): number {
    if (!insuranceAmount) return 0;
    return Number((insuranceAmount * 0.5).toFixed(2));
  }

  private calculateNetProfit(freightAmount: number, branchCommission: number, driverFreight: number, platformFee: number): number {
    return Number((freightAmount - branchCommission - driverFreight - platformFee).toFixed(2));
  }

  private validateSettlementDates(startDate: string, endDate: string): void {
    const start = dayjs(startDate);
    const end = dayjs(endDate);

    if (!start.isValid() || !end.isValid()) {
      throw new ValidationError('日期格式不正确');
    }

    if (start.isAfter(end)) {
      throw new ValidationError('开始日期不能晚于结束日期');
    }

    const maxDays = 365;
    if (end.diff(start, 'day') > maxDays) {
      throw new ValidationError(`结算周期不能超过${maxDays}天`);
    }
  }

  async createSettlement(data: {
    type: 'line' | 'vehicle' | 'branch';
    branchId?: number;
    vehicleId?: number;
    startDate: string;
    endDate: string;
    otherCosts?: number;
    remark?: string;
    operatorId?: number;
  }): Promise<Settlement> {
    const t = await sequelize.transaction();

    try {
      this.validateSettlementDates(data.startDate, data.endDate);

      if (data.otherCosts !== undefined && data.otherCosts < 0) {
        throw new ValidationError('其他费用不能为负数');
      }

      if (data.type === 'branch') {
        if (!data.branchId) {
          throw new ValidationError('按网点结算需要指定网点ID');
        }
        const branch = await Branch.findByPk(data.branchId, { transaction: t });
        if (!branch) {
          throw new NotFoundError('网点不存在');
        }
        if (branch.status !== BranchStatus.ACTIVE) {
          throw new BusinessError('网点非运营状态，无法结算');
        }
      }

      if (data.type === 'vehicle') {
        if (!data.vehicleId) {
          throw new ValidationError('按车辆结算需要指定车辆ID');
        }
        const vehicle = await Vehicle.findByPk(data.vehicleId, { transaction: t });
        if (!vehicle) {
          throw new NotFoundError('车辆不存在');
        }
      }

      const where: any = {
        createdAt: {
          [Op.between]: [
            dayjs(data.startDate).startOf('day').toDate(),
            dayjs(data.endDate).endOf('day').toDate()
          ]
        },
        status: OrderStatus.SIGNED
      };

      if (data.type === 'branch' && data.branchId) {
        where[Op.or] = [
          { shipperBranchId: data.branchId },
          { receiverBranchId: data.branchId }
        ];
      }

      if (data.type === 'vehicle' && data.vehicleId) {
        where.vehicleId = data.vehicleId;
      }

      const orders = await Order.findAll({ where, transaction: t });

      if (orders.length === 0) {
        throw new BusinessError('该时间段内没有已签收的订单可结算');
      }

      const orderIds = orders.map(o => o.id);
      const existingSettlements = await SettlementItem.findAll({
        where: { orderId: { [Op.in]: orderIds } },
        include: [{
          model: Settlement,
          as: 'settlement',
          where: { status: { [Op.ne]: SettlementStatus.CANCELLED } }
        }],
        transaction: t
      });

      if (existingSettlements.length > 0) {
        const duplicateOrderNos = existingSettlements.map(s => s.orderNo);
        throw new BusinessError(`以下订单已在其他结算单中：${duplicateOrderNos.join(', ')}`);
      }

      let totalFreight = 0;
      let totalInsurance = 0;
      let totalBranchCommission = 0;
      let totalDriverFreight = 0;
      let totalPlatformFee = 0;
      let totalInsuranceShare = 0;

      const branchMap = new Map<number, Branch>();
      if (data.type === 'branch' && data.branchId) {
        const branch = await Branch.findByPk(data.branchId);
        if (branch) branchMap.set(branch.id, branch);
      }

      const settlementItems: any[] = [];

      for (const order of orders) {
        const freight = parseFloat(order.freightAmount.toString());
        const insurance = order.insuranceAmount ? parseFloat(order.insuranceAmount.toString()) : 0;
        
        let branchType: string | undefined;
        if (data.type === 'branch' && data.branchId) {
          const branch = branchMap.get(data.branchId);
          branchType = branch?.type;
        }

        const branchCommission = this.calculateBranchCommission(freight, branchType);
        const driverFreight = this.calculateDriverFreight(freight);
        const platformFee = this.calculatePlatformFee(freight);
        const insuranceShare = this.calculateInsuranceShare(freight, insurance);
        const netAmount = this.calculateNetProfit(freight, branchCommission, driverFreight, platformFee);

        totalFreight += freight;
        totalInsurance += insurance;
        totalBranchCommission += branchCommission;
        totalDriverFreight += driverFreight;
        totalPlatformFee += platformFee;
        totalInsuranceShare += insuranceShare;

        settlementItems.push({
          settlementId: 0,
          orderId: order.id,
          orderNo: order.orderNo,
          freightAmount: order.freightAmount,
          insuranceAmount: order.insuranceAmount,
          branchCommission,
          driverFreight,
          platformFee,
          insuranceShare,
          netAmount
        });
      }

      const otherCosts = data.otherCosts || 0;
      const netAmount = Number((totalFreight + totalInsuranceShare - totalBranchCommission - totalDriverFreight - totalPlatformFee - otherCosts).toFixed(2));

      const settlement = await Settlement.create(
        {
          settlementNo: this.generateSettlementNo(),
          type: data.type,
          branchId: data.branchId,
          vehicleId: data.vehicleId,
          startDate: dayjs(data.startDate).startOf('day').toDate(),
          endDate: dayjs(data.endDate).endOf('day').toDate(),
          totalOrders: orders.length,
          totalFreight: Number(totalFreight.toFixed(2)),
          totalInsurance: Number(totalInsurance.toFixed(2)),
          branchCommission: Number(totalBranchCommission.toFixed(2)),
          driverFreight: Number(totalDriverFreight.toFixed(2)),
          platformFee: Number(totalPlatformFee.toFixed(2)),
          insuranceShare: Number(totalInsuranceShare.toFixed(2)),
          otherCosts: Number(otherCosts.toFixed(2)),
          netAmount,
          status: SettlementStatus.PENDING,
          operatorId: data.operatorId,
          remark: data.remark
        },
        { transaction: t }
      );

      settlementItems.forEach(item => item.settlementId = settlement.id);
      await SettlementItem.bulkCreate(settlementItems, { transaction: t });

      await t.commit();
      return this.getSettlementById(settlement.id);
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async getSettlementById(id: number): Promise<Settlement> {
    const settlement = await Settlement.findByPk(id, {
      include: [
        { model: Branch, as: 'branch' },
        { model: Vehicle, as: 'vehicle' },
        { model: User, as: 'operator', attributes: { exclude: ['password'] } },
        { model: SettlementItem, as: 'items' }
      ]
    });
    if (!settlement) {
      throw new NotFoundError('结算单不存在');
    }
    return settlement;
  }

  async getSettlementList(params: {
    type?: string;
    status?: SettlementStatus;
    branchId?: number;
    vehicleId?: number;
    startDate?: string;
    endDate?: string;
    keyword?: string;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  }): Promise<{ list: Settlement[]; total: number; page: number; pageSize: number }> {
    const {
      type,
      status,
      branchId,
      vehicleId,
      startDate,
      endDate,
      keyword,
      page = 1,
      pageSize = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = params;

    const where: any = {};

    if (type) where.type = type;
    if (status) where.status = status;
    if (branchId) where.branchId = branchId;
    if (vehicleId) where.vehicleId = vehicleId;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = dayjs(startDate).startOf('day').toDate();
      if (endDate) where.createdAt[Op.lte] = dayjs(endDate).endOf('day').toDate();
    }

    if (keyword) {
      where.settlementNo = { [Op.like]: `%${keyword}%` };
    }

    const order: any[] = [[sortBy, sortOrder], ['id', 'DESC']];

    const { count, rows } = await Settlement.findAndCountAll({
      where,
      include: [
        { model: Branch, as: 'branch' },
        { model: Vehicle, as: 'vehicle' },
        { model: User, as: 'operator', attributes: { exclude: ['password'] } }
      ],
      order,
      limit: pageSize,
      offset: (page - 1) * pageSize,
      distinct: true
    });

    return {
      list: rows,
      total: count,
      page,
      pageSize
    };
  }

  async confirmSettlement(id: number, operatorId?: number, remark?: string): Promise<Settlement> {
    const t = await sequelize.transaction();

    try {
      const settlement = await Settlement.findByPk(id, {
        include: [{ model: SettlementItem, as: 'items' }],
        transaction: t
      });
      if (!settlement) {
        throw new NotFoundError('结算单不存在');
      }

      if (settlement.status !== SettlementStatus.PENDING) {
        throw new BusinessError('只有待结算的单据才能确认结算');
      }

      if (!settlement.items || settlement.items.length === 0) {
        throw new BusinessError('结算单没有明细，无法确认');
      }

      await settlement.update(
        {
          status: SettlementStatus.SETTLED,
          operatorId,
          settledAt: new Date(),
          remark: remark ? (settlement.remark ? `${settlement.remark}\n${remark}` : remark) : settlement.remark
        },
        { transaction: t }
      );

      await t.commit();
      return this.getSettlementById(id);
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async cancelSettlement(id: number, remark: string, operatorId?: number): Promise<Settlement> {
    if (!remark || remark.trim().length === 0) {
      throw new ValidationError('取消原因不能为空');
    }

    const t = await sequelize.transaction();

    try {
      const settlement = await Settlement.findByPk(id, { transaction: t });
      if (!settlement) {
        throw new NotFoundError('结算单不存在');
      }

      if (settlement.status === SettlementStatus.SETTLED) {
        throw new BusinessError('已结算的单据无法取消');
      }

      if (settlement.status === SettlementStatus.CANCELLED) {
        throw new BusinessError('结算单已取消，无需重复操作');
      }

      await settlement.update(
        {
          status: SettlementStatus.CANCELLED,
          operatorId,
          remark: settlement.remark ? `${settlement.remark}\n${remark}` : remark
        },
        { transaction: t }
      );

      await t.commit();
      return this.getSettlementById(id);
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async getSettlementItems(id: number): Promise<SettlementItem[]> {
    const settlement = await Settlement.findByPk(id);
    if (!settlement) {
      throw new NotFoundError('结算单不存在');
    }

    return SettlementItem.findAll({
      where: { settlementId: id },
      include: [{
        model: Order,
        as: 'order',
        include: [
          { model: Branch, as: 'shipperBranch' },
          { model: Branch, as: 'receiverBranch' },
          { model: Vehicle, as: 'vehicle' }
        ]
      }],
      order: [['createdAt', 'DESC']]
    });
  }

  async getSettlementStatistics(params: {
    startDate?: string;
    endDate?: string;
    type?: string;
    branchId?: number;
    vehicleId?: number;
  }): Promise<any> {
    const { startDate, endDate, type, branchId, vehicleId } = params;

    const where: any = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = dayjs(startDate).startOf('day').toDate();
      if (endDate) where.createdAt[Op.lte] = dayjs(endDate).endOf('day').toDate();
    }
    if (type) where.type = type;
    if (branchId) where.branchId = branchId;
    if (vehicleId) where.vehicleId = vehicleId;

    const statistics = {} as any;

    for (const status of Object.values(SettlementStatus)) {
      statistics[status] = await Settlement.count({
        where: { ...where, status }
      });
    }

    statistics.total = await Settlement.count({ where });

    const amountResult = await Settlement.findOne({
      where,
      attributes: [
        [sequelize.fn('SUM', sequelize.col('totalFreight')), 'totalFreight'],
        [sequelize.fn('SUM', sequelize.col('branchCommission')), 'totalBranchCommission'],
        [sequelize.fn('SUM', sequelize.col('driverFreight')), 'totalDriverFreight'],
        [sequelize.fn('SUM', sequelize.col('otherCosts')), 'totalOtherCosts'],
        [sequelize.fn('SUM', sequelize.col('netAmount')), 'totalNetAmount']
      ],
      raw: true
    });

    statistics.totalFreight = Number(amountResult?.totalFreight || 0);
    statistics.totalBranchCommission = Number(amountResult?.totalBranchCommission || 0);
    statistics.totalDriverFreight = Number(amountResult?.totalDriverFreight || 0);
    statistics.totalOtherCosts = Number(amountResult?.totalOtherCosts || 0);
    statistics.totalNetAmount = Number(amountResult?.totalNetAmount || 0);

    return statistics;
  }

  async previewSettlement(data: {
    type: 'line' | 'vehicle' | 'branch';
    branchId?: number;
    vehicleId?: number;
    startDate: string;
    endDate: string;
    otherCosts?: number;
  }): Promise<any> {
    this.validateSettlementDates(data.startDate, data.endDate);

    const where: any = {
      createdAt: {
        [Op.between]: [
          dayjs(data.startDate).startOf('day').toDate(),
          dayjs(data.endDate).endOf('day').toDate()
        ]
      },
      status: OrderStatus.SIGNED
    };

    if (data.type === 'branch' && data.branchId) {
      where[Op.or] = [
        { shipperBranchId: data.branchId },
        { receiverBranchId: data.branchId }
      ];
    }

    if (data.type === 'vehicle' && data.vehicleId) {
      where.vehicleId = data.vehicleId;
    }

    const { count, rows } = await Order.findAndCountAll({
      where,
      limit: 100
    });

    let totalFreight = 0;
    let totalInsurance = 0;
    let totalBranchCommission = 0;
    let totalDriverFreight = 0;
    let totalPlatformFee = 0;
    let totalInsuranceShare = 0;

    const branchMap = new Map<number, Branch>();
    if (data.type === 'branch' && data.branchId) {
      const branch = await Branch.findByPk(data.branchId);
      if (branch) branchMap.set(branch.id, branch);
    }

    for (const order of rows) {
      const freight = parseFloat(order.freightAmount.toString());
      const insurance = order.insuranceAmount ? parseFloat(order.insuranceAmount.toString()) : 0;
      
      let branchType: string | undefined;
      if (data.type === 'branch' && data.branchId) {
        const branch = branchMap.get(data.branchId);
        branchType = branch?.type;
      }

      const branchCommission = this.calculateBranchCommission(freight, branchType);
      const driverFreight = this.calculateDriverFreight(freight);
      const platformFee = this.calculatePlatformFee(freight);
      const insuranceShare = this.calculateInsuranceShare(freight, insurance);

      totalFreight += freight;
      totalInsurance += insurance;
      totalBranchCommission += branchCommission;
      totalDriverFreight += driverFreight;
      totalPlatformFee += platformFee;
      totalInsuranceShare += insuranceShare;
    }

    const otherCosts = data.otherCosts || 0;
    const netAmount = Number((totalFreight + totalInsuranceShare - totalBranchCommission - totalDriverFreight - totalPlatformFee - otherCosts).toFixed(2));

    return {
      totalOrders: count,
      totalFreight: Number(totalFreight.toFixed(2)),
      totalInsurance: Number(totalInsurance.toFixed(2)),
      branchCommission: Number(totalBranchCommission.toFixed(2)),
      driverFreight: Number(totalDriverFreight.toFixed(2)),
      platformFee: Number(totalPlatformFee.toFixed(2)),
      insuranceShare: Number(totalInsuranceShare.toFixed(2)),
      otherCosts: Number(otherCosts.toFixed(2)),
      netAmount,
      sampleOrders: rows.slice(0, 10).map(o => ({
        id: o.id,
        orderNo: o.orderNo,
        freightAmount: o.freightAmount,
        insuranceAmount: o.insuranceAmount,
        goodsName: o.goodsName,
        createdAt: o.createdAt
      }))
    };
  }
}

export default new SettlementService();
