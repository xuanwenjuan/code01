import { Distributor, DistributorStatus } from '../database/models/distributor.model';
import { Order } from '../database/models/order.model';
import { AppError } from '../middleware/errorHandler';
import { Op } from 'sequelize';

export class DistributorService {
  async create(data: Partial<Distributor>) {
    return Distributor.create(data);
  }

  async update(id: number, data: Partial<Distributor>) {
    const distributor = await Distributor.findByPk(id);
    if (!distributor) {
      throw new AppError('分销商不存在', 404);
    }

    await distributor.update(data);
    return distributor;
  }

  async delete(id: number) {
    const distributor = await Distributor.findByPk(id);
    if (!distributor) {
      throw new AppError('分销商不存在', 404);
    }

    const hasOrders = await Order.count({ where: { distributorId: id } });
    if (hasOrders > 0) {
      throw new AppError('该分销商下存在订单，无法删除', 400);
    }

    await distributor.destroy();
    return true;
  }

  async getById(id: number) {
    const distributor = await Distributor.findByPk(id);
    if (!distributor) {
      throw new AppError('分销商不存在', 404);
    }
    return distributor;
  }

  async getList(params: {
    page?: number;
    pageSize?: number;
    type?: string;
    status?: string;
    keyword?: string;
  }) {
    const { page = 1, pageSize = 10, type, status, keyword } = params;
    const where: any = {};

    if (type) where.type = type;
    if (status) where.status = status;
    if (keyword) {
      where[Op.or] = [
        { name: { [Op.like]: `%${keyword}%` } },
        { contactPerson: { [Op.like]: `%${keyword}%` } },
        { contactPhone: { [Op.like]: `%${keyword}%` } },
      ];
    }

    const { count, rows } = await Distributor.findAndCountAll({
      where,
      offset: (page - 1) * pageSize,
      limit: pageSize,
      order: [['id', 'DESC']],
    });

    return {
      list: rows,
      total: count,
      page,
      pageSize,
    };
  }

  async getAll() {
    return Distributor.findAll({
      where: { status: DistributorStatus.ACTIVE },
      order: [['name', 'ASC']],
      attributes: ['id', 'name', 'type', 'commissionRate'],
    });
  }

  async getStatistics(id: number) {
    const distributor = await Distributor.findByPk(id);
    if (!distributor) {
      throw new AppError('分销商不存在', 404);
    }

    const [totalOrders, totalAmount, totalCommission] = await Promise.all([
      Order.count({ where: { distributorId: id } }),
      Order.sum('totalAmount', { where: { distributorId: id } }),
      Order.sum('commissionAmount', { where: { distributorId: id } }),
    ]);

    return {
      totalOrders,
      totalAmount: totalAmount || 0,
      totalCommission: totalCommission || 0,
    };
  }

  async toggleStatus(id: number) {
    const distributor = await Distributor.findByPk(id);
    if (!distributor) {
      throw new AppError('分销商不存在', 404);
    }

    const newStatus =
      distributor.status === DistributorStatus.ACTIVE
        ? DistributorStatus.INACTIVE
        : DistributorStatus.ACTIVE;

    await distributor.update({ status: newStatus });
    return distributor;
  }
}

export const distributorService = new DistributorService();
