import Leader, { LeaderAttributes, LeaderStatus } from '../models/Leader.model';
import User from '../models/User.model';
import { NotFoundException, BadRequestException } from '../exceptions/AppException';
import { Op, fn, col, literal } from 'sequelize';
import { LeaderListQuery } from '../types';

class LeaderService {
  async createLeader(data: Omit<LeaderAttributes, 'id' | 'status' | 'totalOrders' | 'totalAmount' | 'totalCommission'>): Promise<Leader> {
    const existingLeader = await Leader.findOne({ where: { userId: data.userId } });
    if (existingLeader) {
      throw new BadRequestException('该用户已是团长');
    }

    const user = await User.findByPk(data.userId);
    if (!user) {
      throw new BadRequestException('用户不存在');
    }

    return await Leader.create({
      ...data,
      status: LeaderStatus.PENDING
    });
  }

  async updateLeader(id: number, data: Partial<LeaderAttributes>): Promise<Leader> {
    const leader = await Leader.findByPk(id);
    if (!leader) {
      throw new NotFoundException('团长不存在');
    }
    await leader.update(data);
    return leader;
  }

  async getLeaderById(id: number): Promise<Leader> {
    const leader = await Leader.findByPk(id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'username', 'avatar'] }]
    });
    if (!leader) {
      throw new NotFoundException('团长不存在');
    }
    return leader;
  }

  async getLeaderByUserId(userId: number): Promise<Leader | null> {
    return await Leader.findOne({ where: { userId } });
  }

  async getLeaderList(params: LeaderListQuery): Promise<{ 
    list: Leader[]; 
    total: number; 
    page: number; 
    pageSize: number 
  }> {
    const { 
      page = 1, 
      pageSize = 10, 
      status, 
      province, 
      city, 
      district,
      keyword,
      minCommissionRate,
      maxCommissionRate
    } = params;
    const where: any = {};

    if (status) {
      where.status = status;
    }
    if (province) {
      where.province = { [Op.like]: `%${province}%` };
    }
    if (city) {
      where.city = { [Op.like]: `%${city}%` };
    }
    if (district) {
      where.district = { [Op.like]: `%${district}%` };
    }
    if (keyword) {
      where[Op.or] = [
        { communityName: { [Op.like]: `%${keyword}%` } },
        { address: { [Op.like]: `%${keyword}%` } },
        { phone: { [Op.like]: `%${keyword}%` } }
      ];
    }
    if (minCommissionRate !== undefined || maxCommissionRate !== undefined) {
      where.commissionRate = {};
      if (minCommissionRate !== undefined) {
        where.commissionRate[Op.gte] = minCommissionRate;
      }
      if (maxCommissionRate !== undefined) {
        where.commissionRate[Op.lte] = maxCommissionRate;
      }
    }

    const { count, rows } = await Leader.findAndCountAll({
      where,
      include: [{ model: User, as: 'user', attributes: ['id', 'username', 'avatar', 'phone'] }],
      offset: (page - 1) * pageSize,
      limit: pageSize,
      order: [['createdAt', 'DESC']]
    });

    return {
      list: rows,
      total: count,
      page,
      pageSize
    };
  }

  async auditLeader(id: number, status: LeaderStatus, auditRemark?: string): Promise<Leader> {
    const leader = await Leader.findByPk(id);
    if (!leader) {
      throw new NotFoundException('团长不存在');
    }
    if (leader.status !== LeaderStatus.PENDING) {
      throw new BadRequestException('该团长已审核');
    }
    await leader.update({
      status,
      auditTime: new Date(),
      auditRemark
    });
    return leader;
  }

  async updateStatus(id: number, status: LeaderStatus): Promise<Leader> {
    const leader = await Leader.findByPk(id);
    if (!leader) {
      throw new NotFoundException('团长不存在');
    }
    await leader.update({ status });
    return leader;
  }

  async updateCommissionStats(leaderId: number, orderAmount: number): Promise<void> {
    const leader = await Leader.findByPk(leaderId);
    if (!leader) {
      throw new NotFoundException('团长不存在');
    }
    const commissionAmount = (orderAmount * leader.commissionRate) / 100;
    await leader.update({
      totalOrders: (leader.totalOrders || 0) + 1,
      totalAmount: (leader.totalAmount || 0) + orderAmount,
      totalCommission: (leader.totalCommission || 0) + commissionAmount
    });
  }
}

export default new LeaderService();
