import Vehicle, { VehicleStatus, VehicleAttributes, VehicleCreationAttributes } from '../models/Vehicle';
import Branch, { BranchStatus } from '../models/Branch';
import Order, { OrderStatus } from '../models/Order';
import { NotFoundError, BusinessError } from '../utils/errors';
import { Op, Transaction } from 'sequelize';
import sequelize from '../config/database';
import dayjs from 'dayjs';

class VehicleService {
  private validateActiveBranch(branch: Branch, operation: string): void {
    if (branch.status !== BranchStatus.ACTIVE) {
      throw new BusinessError(`${branch.name} 未处于运营状态，${operation}`);
    }
  }

  private validateStatusTransition(currentStatus: VehicleStatus, newStatus: VehicleStatus): void {
    const allowedTransitions: Record<VehicleStatus, VehicleStatus[]> = {
      [VehicleStatus.IDLE]: [VehicleStatus.IN_TRANSIT, VehicleStatus.MAINTENANCE],
      [VehicleStatus.IN_TRANSIT]: [VehicleStatus.IDLE, VehicleStatus.MAINTENANCE],
      [VehicleStatus.MAINTENANCE]: [VehicleStatus.IDLE]
    };

    if (!allowedTransitions[currentStatus]?.includes(newStatus)) {
      throw new BusinessError(`无法从${this.getStatusText(currentStatus)}状态转换为${this.getStatusText(newStatus)}状态`);
    }
  }

  private getStatusText(status: VehicleStatus): string {
    const texts: Record<VehicleStatus, string> = {
      [VehicleStatus.IDLE]: '空闲',
      [VehicleStatus.IN_TRANSIT]: '在途',
      [VehicleStatus.MAINTENANCE]: '维保'
    };
    return texts[status];
  }

  async createVehicle(data: VehicleCreationAttributes): Promise<Vehicle> {
    const branch = await Branch.findByPk(data.branchId);
    if (!branch) {
      throw new NotFoundError('所属网点不存在');
    }

    this.validateActiveBranch(branch, '无法挂靠车辆');

    const existing = await Vehicle.findOne({ where: { plateNumber: data.plateNumber } });
    if (existing) {
      throw new BusinessError('车牌号已存在');
    }

    if (data.licenseExpireDate && dayjs(data.licenseExpireDate).isBefore(dayjs())) {
      throw new BusinessError('营运证件已过期，请先更新证件信息');
    }

    return Vehicle.create(data);
  }

  async updateVehicle(id: number, data: Partial<VehicleAttributes>): Promise<Vehicle> {
    const vehicle = await Vehicle.findByPk(id);
    if (!vehicle) {
      throw new NotFoundError('车辆不存在');
    }

    if (data.branchId) {
      const branch = await Branch.findByPk(data.branchId);
      if (!branch) {
        throw new NotFoundError('所属网点不存在');
      }
      this.validateActiveBranch(branch, '无法挂靠车辆');
    }

    if (data.plateNumber) {
      const existing = await Vehicle.findOne({
        where: { plateNumber: data.plateNumber, id: { [Op.ne]: id } }
      });
      if (existing) {
        throw new BusinessError('车牌号已存在');
      }
    }

    if (data.licenseExpireDate && dayjs(data.licenseExpireDate).isBefore(dayjs())) {
      throw new BusinessError('营运证件已过期，请先更新证件信息');
    }

    await vehicle.update(data);
    return this.getVehicleById(id);
  }

  async deleteVehicle(id: number): Promise<void> {
    const t = await sequelize.transaction();
    try {
      const vehicle = await Vehicle.findByPk(id, { transaction: t });
      if (!vehicle) {
        throw new NotFoundError('车辆不存在');
      }

      if (vehicle.status === VehicleStatus.IN_TRANSIT) {
        throw new BusinessError('车辆在途，无法删除');
      }

      const pendingOrders = await Order.count({
        where: {
          vehicleId: id,
          status: { [Op.ne]: OrderStatus.SIGNED }
        },
        transaction: t
      });
      if (pendingOrders > 0) {
        throw new BusinessError('该车辆存在未完成的运输订单，无法删除');
      }

      await vehicle.destroy({ transaction: t });
      await t.commit();
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async getVehicleById(id: number): Promise<Vehicle> {
    const vehicle = await Vehicle.findByPk(id, {
      include: [{ model: Branch, as: 'branch' }]
    });
    if (!vehicle) {
      throw new NotFoundError('车辆不存在');
    }
    return vehicle;
  }

  async getVehicleList(params: {
    branchId?: number;
    status?: VehicleStatus;
    vehicleType?: string;
    vehicleTypes?: string[];
    minLoadCapacity?: number;
    maxLoadCapacity?: number;
    minLoadVolume?: number;
    maxLoadVolume?: number;
    keyword?: string;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  }): Promise<{ list: Vehicle[]; total: number; page: number; pageSize: number }> {
    const {
      branchId,
      status,
      vehicleType,
      vehicleTypes,
      minLoadCapacity,
      maxLoadCapacity,
      minLoadVolume,
      maxLoadVolume,
      keyword,
      page = 1,
      pageSize = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = params;
    const where: any = {};

    if (branchId) where.branchId = branchId;
    if (status) where.status = status;
    if (vehicleType) where.vehicleType = vehicleType;
    if (vehicleTypes && vehicleTypes.length > 0) {
      where.vehicleType = { [Op.in]: vehicleTypes };
    }
    if (minLoadCapacity !== undefined || maxLoadCapacity !== undefined) {
      where.loadCapacity = {};
      if (minLoadCapacity !== undefined) {
        where.loadCapacity[Op.gte] = minLoadCapacity;
      }
      if (maxLoadCapacity !== undefined) {
        where.loadCapacity[Op.lte] = maxLoadCapacity;
      }
    }
    if (minLoadVolume !== undefined || maxLoadVolume !== undefined) {
      where.loadVolume = {};
      if (minLoadVolume !== undefined) {
        where.loadVolume[Op.gte] = minLoadVolume;
      }
      if (maxLoadVolume !== undefined) {
        where.loadVolume[Op.lte] = maxLoadVolume;
      }
    }
    if (keyword) {
      where[Op.or] = [
        { plateNumber: { [Op.like]: `%${keyword}%` } },
        { driverName: { [Op.like]: `%${keyword}%` } },
        { driverPhone: { [Op.like]: `%${keyword}%` } },
        { operatingLicense: { [Op.like]: `%${keyword}%` } },
        { vehicleType: { [Op.like]: `%${keyword}%` } }
      ];
    }

    const order: any[] = [];
    if (sortBy === 'licenseExpireDate') {
      order.push(['licenseExpireDate', sortOrder]);
    } else if (sortBy === 'loadCapacity') {
      order.push(['loadCapacity', sortOrder]);
    } else if (sortBy === 'loadVolume') {
      order.push(['loadVolume', sortOrder]);
    } else if (sortBy === 'plateNumber') {
      order.push(['plateNumber', sortOrder]);
    } else {
      order.push([sortBy, sortOrder]);
    }
    order.push(['createdAt', 'DESC']);

    const { count, rows } = await Vehicle.findAndCountAll({
      where,
      include: [{ model: Branch, as: 'branch' }],
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

  async updateVehicleStatus(
    id: number,
    status: VehicleStatus,
    operatorId?: number,
    remark?: string
  ): Promise<Vehicle> {
    const t = await sequelize.transaction();
    try {
      const vehicle = await Vehicle.findByPk(id, { transaction: t });
      if (!vehicle) {
        throw new NotFoundError('车辆不存在');
      }

      if (vehicle.status !== status) {
        this.validateStatusTransition(vehicle.status, status);
      }

      if (status === VehicleStatus.MAINTENANCE) {
        const inTransitOrders = await Order.count({
          where: {
            vehicleId: id,
            status: OrderStatus.IN_TRANSIT
          },
          transaction: t
        });
        if (inTransitOrders > 0) {
          throw new BusinessError('该车辆有在途订单，无法设置为维保状态');
        }
      }

      await vehicle.update({ status }, { transaction: t });
      await t.commit();
      return this.getVehicleById(id);
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async bindBranch(id: number, branchId: number): Promise<Vehicle> {
    const t = await sequelize.transaction();
    try {
      const vehicle = await Vehicle.findByPk(id, { transaction: t });
      if (!vehicle) {
        throw new NotFoundError('车辆不存在');
      }

      if (vehicle.status === VehicleStatus.IN_TRANSIT) {
        throw new BusinessError('车辆在途，无法变更所属网点');
      }

      const branch = await Branch.findByPk(branchId, { transaction: t });
      if (!branch) {
        throw new NotFoundError('网点不存在');
      }

      this.validateActiveBranch(branch, '无法挂靠车辆');

      await vehicle.update({ branchId }, { transaction: t });
      await t.commit();
      return this.getVehicleById(id);
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async getExpiringVehicles(days: number = 30): Promise<Vehicle[]> {
    const today = dayjs().startOf('day');
    const expireDate = today.add(days, 'day').toDate();

    return Vehicle.findAll({
      where: {
        licenseExpireDate: {
          [Op.between]: [today.toDate(), expireDate]
        },
        status: { [Op.ne]: VehicleStatus.MAINTENANCE }
      },
      include: [{ model: Branch, as: 'branch' }],
      order: [['licenseExpireDate', 'ASC']]
    });
  }

  async getAvailableVehicles(branchId?: number, minCapacity?: number, maxCapacity?: number): Promise<Vehicle[]> {
    const where: any = { status: VehicleStatus.IDLE };
    if (branchId) where.branchId = branchId;
    if (minCapacity !== undefined) where.loadCapacity = { [Op.gte]: minCapacity };
    if (maxCapacity !== undefined) {
      if (where.loadCapacity) {
        where.loadCapacity[Op.lte] = maxCapacity;
      } else {
        where.loadCapacity = { [Op.lte]: maxCapacity };
      }
    }

    return Vehicle.findAll({
      where,
      include: [{ model: Branch, as: 'branch' }],
      order: [['loadCapacity', 'DESC']]
    });
  }

  async getVehicleStats(branchId?: number): Promise<any> {
    const where: any = {};
    if (branchId) where.branchId = branchId;

    const [total, idle, inTransit, maintenance, expiring] = await Promise.all([
      Vehicle.count({ where }),
      Vehicle.count({ where: { ...where, status: VehicleStatus.IDLE } }),
      Vehicle.count({ where: { ...where, status: VehicleStatus.IN_TRANSIT } }),
      Vehicle.count({ where: { ...where, status: VehicleStatus.MAINTENANCE } }),
      Vehicle.count({
        where: {
          ...where,
          licenseExpireDate: {
            [Op.lte]: dayjs().add(30, 'day').toDate()
          }
        }
      })
    ]);

    return {
      total,
      idle,
      inTransit,
      maintenance,
      expiring,
      utilizationRate: total > 0 ? ((inTransit + maintenance) / total * 100).toFixed(2) : 0
    };
  }
}

export default new VehicleService();
