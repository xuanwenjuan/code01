import GroupBuy, { GroupBuyAttributes, GroupBuyStatus } from '../models/GroupBuy.model';
import Product from '../models/Product.model';
import Leader from '../models/Leader.model';
import { NotFoundException, BadRequestException } from '../exceptions/AppException';
import { Op, fn, col } from 'sequelize';
import sequelize from '../config/database';

class GroupBuyService {
  async createGroupBuy(data: Omit<GroupBuyAttributes, 'id' | 'currentQuantity' | 'status'>): Promise<GroupBuy> {
    const product = await Product.findByPk(data.productId);
    if (!product) {
      throw new BadRequestException('商品不存在');
    }
    if (product.status === 0) {
      throw new BadRequestException('商品已下架');
    }

    const leader = await Leader.findByPk(data.leaderId);
    if (!leader) {
      throw new BadRequestException('团长不存在');
    }
    if (leader.status !== 'normal') {
      throw new BadRequestException('团长状态异常，无法创建拼团');
    }

    if (new Date(data.endTime) <= new Date(data.startTime)) {
      throw new BadRequestException('结束时间必须晚于开始时间');
    }

    return await GroupBuy.create({
      ...data,
      currentQuantity: 0,
      status: GroupBuyStatus.PENDING
    });
  }

  async updateGroupBuy(id: number, data: Partial<GroupBuyAttributes>): Promise<GroupBuy> {
    const groupBuy = await GroupBuy.findByPk(id);
    if (!groupBuy) {
      throw new NotFoundException('拼团不存在');
    }

    if (groupBuy.status !== GroupBuyStatus.PENDING) {
      throw new BadRequestException('只能编辑待开始的拼团');
    }

    if (data.productId && data.productId !== groupBuy.productId) {
      const product = await Product.findByPk(data.productId);
      if (!product || product.status === 0) {
        throw new BadRequestException('商品不存在或已下架');
      }
    }

    await groupBuy.update(data);
    return groupBuy;
  }

  async deleteGroupBuy(id: number): Promise<void> {
    const groupBuy = await GroupBuy.findByPk(id);
    if (!groupBuy) {
      throw new NotFoundException('拼团不存在');
    }

    if (groupBuy.status === GroupBuyStatus.ACTIVE) {
      throw new BadRequestException('进行中的拼团无法删除');
    }

    await groupBuy.destroy();
  }

  async getGroupBuyById(id: number): Promise<GroupBuy> {
    const groupBuy = await GroupBuy.findByPk(id, {
      include: [
        { model: Product, as: 'product', attributes: ['id', 'name', 'image', 'groupPrice', 'unit'] },
        { model: Leader, as: 'leader', attributes: ['id', 'communityName', 'phone'] }
      ]
    });
    if (!groupBuy) {
      throw new NotFoundException('拼团不存在');
    }
    return groupBuy;
  }

  async getGroupBuyList(params: {
    page?: number;
    pageSize?: number;
    status?: GroupBuyStatus;
    leaderId?: number;
    productId?: number;
  }): Promise<{ list: GroupBuy[]; total: number; page: number; pageSize: number }> {
    const { page = 1, pageSize = 10, status, leaderId, productId } = params;
    const where: any = {};

    if (status) {
      where.status = status;
    }
    if (leaderId) {
      where.leaderId = leaderId;
    }
    if (productId) {
      where.productId = productId;
    }

    const { count, rows } = await GroupBuy.findAndCountAll({
      where,
      include: [
        { model: Product, as: 'product', attributes: ['id', 'name', 'image'] },
        { model: Leader, as: 'leader', attributes: ['id', 'communityName'] }
      ],
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

  async updateGroupBuyStatus(id: number, status: GroupBuyStatus): Promise<GroupBuy> {
    const groupBuy = await GroupBuy.findByPk(id);
    if (!groupBuy) {
      throw new NotFoundException('拼团不存在');
    }

    const validTransitions: Record<GroupBuyStatus, GroupBuyStatus[]> = {
      [GroupBuyStatus.PENDING]: [GroupBuyStatus.ACTIVE, GroupBuyStatus.CANCELLED],
      [GroupBuyStatus.ACTIVE]: [GroupBuyStatus.LOCKED, GroupBuyStatus.CANCELLED],
      [GroupBuyStatus.LOCKED]: [GroupBuyStatus.COMPLETED],
      [GroupBuyStatus.COMPLETED]: [],
      [GroupBuyStatus.CANCELLED]: []
    };

    if (!validTransitions[groupBuy.status].includes(status)) {
      throw new BadRequestException(`无法从 ${groupBuy.status} 状态变更为 ${status}`);
    }

    await groupBuy.update({ status });
    return groupBuy;
  }

  async startGroupBuy(id: number): Promise<GroupBuy> {
    return await this.updateGroupBuyStatus(id, GroupBuyStatus.ACTIVE);
  }

  async lockGroupBuy(id: number): Promise<GroupBuy> {
    return await this.updateGroupBuyStatus(id, GroupBuyStatus.LOCKED);
  }

  async completeGroupBuy(id: number): Promise<GroupBuy> {
    return await this.updateGroupBuyStatus(id, GroupBuyStatus.COMPLETED);
  }

  async cancelGroupBuy(id: number): Promise<GroupBuy> {
    return await this.updateGroupBuyStatus(id, GroupBuyStatus.CANCELLED);
  }

  async incrementQuantity(id: number, quantity: number = 1): Promise<void> {
    const groupBuy = await GroupBuy.findByPk(id);
    if (!groupBuy) {
      throw new NotFoundException('拼团不存在');
    }

    if (groupBuy.status !== GroupBuyStatus.ACTIVE) {
      throw new BadRequestException('只能在进行中的拼团下单');
    }

    await groupBuy.increment('currentQuantity', { by: quantity });
  }

  async processExpiredGroupBuys(): Promise<void> {
    const now = new Date();
    const expiredGroupBuys = await GroupBuy.findAll({
      where: {
        status: GroupBuyStatus.ACTIVE,
        endTime: { [Op.lte]: now }
      }
    });

    for (const groupBuy of expiredGroupBuys) {
      if (groupBuy.currentQuantity >= groupBuy.minQuantity) {
        await groupBuy.update({ status: GroupBuyStatus.LOCKED });
      } else {
        await groupBuy.update({ status: GroupBuyStatus.CANCELLED });
      }
    }
  }

  async processPendingStart(): Promise<void> {
    const now = new Date();
    await GroupBuy.update(
      { status: GroupBuyStatus.ACTIVE },
      {
        where: {
          status: GroupBuyStatus.PENDING,
          startTime: { [Op.lte]: now }
        }
      }
    );
  }
}

export default new GroupBuyService();
