import { Op, Transaction, WhereOptions } from 'sequelize';
import { Worker, User, Order, sequelize } from '../models';
import { WorkerStatus, UserRole, WorkerFilterParams } from '../types';
import { NotFoundException, BadRequestException, ConflictException } from '../exceptions/HttpException';

export interface CreateWorkerDto {
  userId: string;
  skills: string[];
  serviceAreas: string[];
  description?: string;
  idCard?: string;
  idCardImage?: string;
  healthCertificate?: string;
  healthCertificateExpiry?: Date;
  workExperience?: number;
  basePrice?: number;
}

export interface UpdateWorkerDto {
  skills?: string[];
  serviceAreas?: string[];
  description?: string;
  idCard?: string;
  idCardImage?: string;
  healthCertificate?: string;
  healthCertificateExpiry?: Date;
  workExperience?: number;
  basePrice?: number;
  avatar?: string;
}

class WorkerService {
  async createWorker(createDto: CreateWorkerDto) {
    const user = await User.findByPk(createDto.userId);
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    const existingWorker = await Worker.findOne({ where: { userId: createDto.userId } });
    if (existingWorker) {
      throw new ConflictException('该用户已注册为师傅');
    }

    const worker = await Worker.create({
      ...createDto,
      status: WorkerStatus.ON_DUTY,
      rating: 5,
      orderCount: 0,
      completedCount: 0
    });

    await User.update(
      { role: UserRole.WORKER },
      { where: { id: createDto.userId } }
    );

    return worker;
  }

  async updateWorker(id: string, updateDto: UpdateWorkerDto) {
    const worker = await Worker.findByPk(id);
    if (!worker) {
      throw new NotFoundException('师傅不存在');
    }

    await worker.update(updateDto);
    return worker;
  }

  async updateWorkerStatus(id: string, status: WorkerStatus) {
    const worker = await Worker.findByPk(id);
    if (!worker) {
      throw new NotFoundException('师傅不存在');
    }

    if (status === WorkerStatus.RESTING) {
      const activeOrders = await Order.count({
        where: {
          workerId: id,
          status: { [Op.in]: ['assigned', 'worker_on_way', 'in_service'] }
        }
      });
      if (activeOrders > 0) {
        throw new BadRequestException('该师傅有进行中的订单，无法设置为休息状态');
      }
    }

    await worker.update({ status });
    return worker;
  }

  async getWorkerById(id: string) {
    const worker = await Worker.findByPk(id, {
      include: [
        {
          association: 'user',
          attributes: { exclude: ['password'] }
        }
      ]
    });

    if (!worker) {
      throw new NotFoundException('师傅不存在');
    }

    return worker;
  }

  async getWorkerByUserId(userId: string) {
    const worker = await Worker.findOne({
      where: { userId },
      include: [
        {
          association: 'user',
          attributes: { exclude: ['password'] }
        }
      ]
    });

    if (!worker) {
      throw new NotFoundException('师傅不存在');
    }

    return worker;
  }

  async getWorkerList(params: WorkerFilterParams) {
    const { status, skills, serviceAreas, keyword, ratingMin, ratingMax, serviceDate, serviceTime, page = 1, pageSize = 10 } = params;
    const where: WhereOptions = {};

    if (status) {
      where.status = status;
    }

    if (skills && skills.length > 0) {
      where.skills = {
        [Op.and]: skills.map(skill => ({
          [Op.like]: `%${skill}%`
        }))
      };
    }

    if (serviceAreas && serviceAreas.length > 0) {
      where.serviceAreas = {
        [Op.and]: serviceAreas.map(area => ({
          [Op.like]: `%${area}%`
        }))
      };
    }

    if (keyword) {
      where[Op.or] = [
        { '$user.username$': { [Op.like]: `%${keyword}%` } },
        { '$user.phone$': { [Op.like]: `%${keyword}%` } },
        { description: { [Op.like]: `%${keyword}%` } }
      ];
    }

    if (ratingMin !== undefined || ratingMax !== undefined) {
      where.rating = {};
      if (ratingMin !== undefined) {
        where.rating[Op.gte] = ratingMin;
      }
      if (ratingMax !== undefined) {
        where.rating[Op.lte] = ratingMax;
      }
    }

    if (serviceDate) {
      const busyWorkerIds = await this.getBusyWorkerIds(serviceDate, serviceTime);
      if (busyWorkerIds.length > 0) {
        where.id = { [Op.notIn]: busyWorkerIds };
      }
    }

    const { count, rows } = await Worker.findAndCountAll({
      where,
      include: [
        {
          association: 'user',
          attributes: { exclude: ['password'] }
        }
      ],
      order: [
        ['rating', 'DESC'],
        ['orderCount', 'DESC'],
        ['createdAt', 'DESC']
      ],
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

  async getWorkersForDispatch(skill?: string, serviceArea?: string, serviceDate?: string, serviceTime?: string) {
    const where: WhereOptions = {
      status: { [Op.in]: [WorkerStatus.ON_DUTY, WorkerStatus.BUSY] }
    };

    if (skill) {
      where.skills = { [Op.like]: `%${skill}%` };
    }

    if (serviceArea) {
      where.serviceAreas = { [Op.like]: `%${serviceArea}%` };
    }

    if (serviceDate) {
      const busyWorkerIds = await this.getBusyWorkerIds(serviceDate, serviceTime);
      if (busyWorkerIds.length > 0) {
        where.id = { [Op.notIn]: busyWorkerIds };
      }
    }

    const workers = await Worker.findAll({
      where,
      include: [
        {
          association: 'user',
          attributes: { exclude: ['password'] }
        }
      ],
      order: [
        ['rating', 'DESC'],
        ['orderCount', 'DESC']
      ]
    });

    return workers;
  }

  private async getBusyWorkerIds(serviceDate: string, serviceTime?: string): Promise<string[]> {
    const startOfDay = new Date(serviceDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(serviceDate);
    endOfDay.setHours(23, 59, 59, 999);

    const busyOrders = await Order.findAll({
      where: {
        status: { [Op.in]: ['assigned', 'worker_on_way', 'in_service'] },
        scheduledDate: { [Op.between]: [startOfDay, endOfDay] }
      },
      attributes: ['workerId']
    });

    return busyOrders.map(o => o.workerId).filter((id): id is string => id !== null && id !== undefined);
  }

  async checkWorkerAvailability(workerId: string, serviceDate: string, serviceTime?: string): Promise<boolean> {
    const worker = await Worker.findByPk(workerId);
    if (!worker) {
      throw new NotFoundException('师傅不存在');
    }

    if (worker.status !== WorkerStatus.ON_DUTY) {
      return false;
    }

    const busyWorkerIds = await this.getBusyWorkerIds(serviceDate, serviceTime);
    return !busyWorkerIds.includes(workerId);
  }

  async getExpiringCertificates(days: number = 7) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days);

    const workers = await Worker.findAll({
      where: {
        healthCertificateExpiry: {
          [Op.lte]: expiryDate,
          [Op.ne]: null
        }
      },
      include: [
        {
          association: 'user',
          attributes: { exclude: ['password'] }
        }
      ]
    });

    return workers;
  }

  async lockWorkerSchedule(workerId: string, orderId: string, scheduledDate: Date, transaction?: Transaction) {
    const isAvailable = await this.checkWorkerAvailability(
      workerId,
      scheduledDate.toISOString().split('T')[0]
    );

    if (!isAvailable) {
      throw new ConflictException('该师傅在指定时间已有预约，请选择其他师傅或时间');
    }

    const worker = await Worker.findByPk(workerId, { transaction });
    if (!worker) {
      throw new NotFoundException('师傅不存在');
    }

    if (worker.status === WorkerStatus.ON_DUTY) {
      await worker.update({ status: WorkerStatus.BUSY }, { transaction });
    }

    return true;
  }

  async unlockWorkerSchedule(workerId: string, transaction?: Transaction) {
    const worker = await Worker.findByPk(workerId, { transaction });
    if (!worker) {
      return;
    }

    const activeOrders = await Order.count({
      where: {
        workerId,
        status: { [Op.in]: ['assigned', 'worker_on_way', 'in_service'] }
      },
      transaction
    });

    if (activeOrders === 0 && worker.status === WorkerStatus.BUSY) {
      await worker.update({ status: WorkerStatus.ON_DUTY }, { transaction });
    }
  }
}

export default new WorkerService();
