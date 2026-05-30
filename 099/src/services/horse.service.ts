import { Horse, Stable, User } from '../models';
import { BusinessException } from '../utils/response';
import { HorseStatus } from '../constants';
import { Op, fn, col, literal } from 'sequelize';
import { operationLogService } from './operationLog.service';
import { AuthRequest } from '../middlewares/auth';

export interface CreateHorseDto {
  horseNo: string;
  name: string;
  breed: string;
  age: number;
  gender: 'male' | 'female';
  weight?: number;
  trainingLevel?: number;
  stableId?: number;
  trainerId?: number;
  dailyRationStandard?: string;
  lastVaccinationDate?: Date;
  nextVaccinationDate?: Date;
  notes?: string;
}

export interface UpdateHorseDto extends Partial<CreateHorseDto> {
  status?: HorseStatus;
}

export interface CreateStableDto {
  name: string;
  code: string;
  location?: string;
  capacity: number;
  managerId?: number;
  notes?: string;
}

class HorseService {
  async createHorse(createDto: CreateHorseDto) {
    const existingHorse = await Horse.findOne({ where: { horseNo: createDto.horseNo } });
    if (existingHorse) {
      throw new BusinessException('马匹编号已存在', 400);
    }

    if (createDto.stableId) {
      const stable = await Stable.findByPk(createDto.stableId);
      if (!stable) {
        throw new BusinessException('马舍不存在', 400);
      }
      
      const currentCount = await Horse.count({ where: { stableId: createDto.stableId } });
      if (currentCount >= stable.capacity) {
        throw new BusinessException('马舍容量已满', 400);
      }
    }

    if (createDto.trainerId) {
      const trainer = await User.findByPk(createDto.trainerId);
      if (!trainer) {
        throw new BusinessException('驯养员不存在', 400);
      }
    }

    const horse = await Horse.create({
      ...createDto,
      status: HorseStatus.HEALTHY
    });

    return horse;
  }

  async getHorses(params: {
    page?: number;
    pageSize?: number;
    status?: HorseStatus | HorseStatus[];
    stableId?: number;
    trainerId?: number;
    breed?: string | string[];
    keyword?: string;
    gender?: 'male' | 'female';
    minAge?: number;
    maxAge?: number;
    minWeight?: number;
    maxWeight?: number;
    trainingLevel?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  }) {
    const {
      page = 1,
      pageSize = 10,
      status,
      stableId,
      trainerId,
      breed,
      keyword,
      gender,
      minAge,
      maxAge,
      minWeight,
      maxWeight,
      trainingLevel,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = params;

    const where: any = {};

    if (status) {
      where.status = Array.isArray(status) ? { [Op.in]: status } : status;
    }

    if (stableId) where.stableId = stableId;
    if (trainerId) where.trainerId = trainerId;

    if (breed) {
      where.breed = Array.isArray(breed) ? { [Op.in]: breed } : { [Op.like]: `%${breed}%` };
    }

    if (keyword) {
      where[Op.or] = [
        { horseNo: { [Op.like]: `%${keyword}%` } },
        { name: { [Op.like]: `%${keyword}%` } },
        { breed: { [Op.like]: `%${keyword}%` } }
      ];
    }

    if (gender) where.gender = gender;
    if (minAge !== undefined) where.age = { ...where.age, [Op.gte]: minAge };
    if (maxAge !== undefined) where.age = { ...where.age, [Op.lte]: maxAge };
    if (minWeight !== undefined) where.weight = { ...where.weight, [Op.gte]: minWeight };
    if (maxWeight !== undefined) where.weight = { ...where.weight, [Op.lte]: maxWeight };
    if (trainingLevel) where.trainingLevel = trainingLevel;

    const { count, rows } = await Horse.findAndCountAll({
      where,
      include: [
        { model: Stable, as: 'stable', attributes: ['id', 'name', 'code', 'location'] },
        { model: User, as: 'trainer', attributes: ['id', 'realName', 'username', 'phone'] }
      ],
      limit: pageSize,
      offset: (page - 1) * pageSize,
      order: [[sortBy, sortOrder]]
    });

    return {
      list: rows,
      total: count,
      page,
      pageSize,
      totalPages: Math.ceil(count / pageSize)
    };
  }

  async getHorseById(id: number) {
    const horse = await Horse.findByPk(id, {
      include: [
        { model: Stable, as: 'stable' },
        { model: User, as: 'trainer' }
      ]
    });
    
    if (!horse) {
      throw new BusinessException('马匹不存在', 404);
    }

    return horse;
  }

  async updateHorse(id: number, updateDto: UpdateHorseDto) {
    const horse = await Horse.findByPk(id);
    if (!horse) {
      throw new BusinessException('马匹不存在', 404);
    }

    if (updateDto.horseNo && updateDto.horseNo !== horse.horseNo) {
      const existingHorse = await Horse.findOne({ where: { horseNo: updateDto.horseNo } });
      if (existingHorse) {
        throw new BusinessException('马匹编号已存在', 400);
      }
    }

    if (updateDto.stableId && updateDto.stableId !== horse.stableId) {
      const stable = await Stable.findByPk(updateDto.stableId);
      if (!stable) {
        throw new BusinessException('马舍不存在', 400);
      }
      
      const currentCount = await Horse.count({ where: { stableId: updateDto.stableId } });
      if (currentCount >= stable.capacity) {
        throw new BusinessException('马舍容量已满', 400);
      }
    }

    if (updateDto.trainerId) {
      const trainer = await User.findByPk(updateDto.trainerId);
      if (!trainer) {
        throw new BusinessException('驯养员不存在', 400);
      }
    }

    await horse.update(updateDto);
    return this.getHorseById(id);
  }

  async deleteHorse(id: number) {
    const horse = await Horse.findByPk(id);
    if (!horse) {
      throw new BusinessException('马匹不存在', 404);
    }

    await horse.destroy();
    return null;
  }

  async getVaccinationReminders(days: number = 7) {
    const today = new Date();
    const reminderDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);

    const horses = await Horse.findAll({
      where: {
        nextVaccinationDate: {
          [Op.between]: [today, reminderDate]
        },
        status: { [Op.ne]: HorseStatus.SICK }
      },
      include: [
        { model: Stable, as: 'stable' },
        { model: User, as: 'trainer' }
      ],
      order: [['nextVaccinationDate', 'ASC']]
    });

    const overdueHorses = await Horse.findAll({
      where: {
        nextVaccinationDate: { [Op.lt]: today },
        status: { [Op.ne]: HorseStatus.SICK }
      },
      include: [
        { model: Stable, as: 'stable' },
        { model: User, as: 'trainer' }
      ],
      order: [['nextVaccinationDate', 'ASC']]
    });

    return {
      upcoming: horses,
      overdue: overdueHorses,
      total: horses.length + overdueHorses.length
    };
  }

  async recordVaccination(id: number, vaccinationDate: Date, nextVaccinationDate?: Date) {
    const horse = await Horse.findByPk(id);
    if (!horse) {
      throw new BusinessException('马匹不存在', 404);
    }

    await horse.update({
      lastVaccinationDate: vaccinationDate,
      nextVaccinationDate: nextVaccinationDate || new Date(vaccinationDate.getTime() + 180 * 24 * 60 * 60 * 1000)
    });

    return this.getHorseById(id);
  }

  async getHorseStatistics() {
    const total = await Horse.count();
    const statusStats = await Horse.findAll({
      attributes: ['status', [fn('COUNT', col('id')), 'count']],
      group: ['status']
    });

    const breedStats = await Horse.findAll({
      attributes: ['breed', [fn('COUNT', col('id')), 'count']],
      group: ['breed']
    });

    const stableStats = await Horse.findAll({
      attributes: ['stableId', [fn('COUNT', col('id')), 'count']],
      include: [{ model: Stable, as: 'stable', attributes: ['name'] }],
      group: ['stableId']
    });

    const ageStats = await Horse.findAll({
      attributes: [
        [literal('CASE WHEN age < 3 THEN "幼年" WHEN age < 7 THEN "青年" WHEN age < 12 THEN "壮年" ELSE "老年" END'), 'ageGroup'],
        [fn('COUNT', col('id')), 'count']
      ],
      group: ['ageGroup']
    });

    return {
      total,
      byStatus: statusStats,
      byBreed: breedStats,
      byStable: stableStats,
      byAgeGroup: ageStats
    };
  }

  async createStable(createDto: CreateStableDto) {
    const existingStable = await Stable.findOne({ where: { code: createDto.code } });
    if (existingStable) {
      throw new BusinessException('马舍编号已存在', 400);
    }

    if (createDto.managerId) {
      const manager = await User.findByPk(createDto.managerId);
      if (!manager) {
        throw new BusinessException('管理员不存在', 400);
      }
    }

    const stable = await Stable.create({
      ...createDto,
      status: 'active',
      currentCount: 0
    });

    return stable;
  }

  async getStables(page: number = 1, pageSize: number = 10, status?: string) {
    const where: any = {};
    if (status) where.status = status;

    const { count, rows } = await Stable.findAndCountAll({
      where,
      include: [{ model: User, as: 'manager', attributes: ['id', 'realName'] }],
      limit: pageSize,
      offset: (page - 1) * pageSize,
      order: [['createdAt', 'DESC']]
    });

    return {
      list: rows,
      total: count,
      page,
      pageSize,
      totalPages: Math.ceil(count / pageSize)
    };
  }

  async getStableById(id: number) {
    const stable = await Stable.findByPk(id, {
      include: [
        { model: User, as: 'manager' },
        { model: Horse, as: 'horses' }
      ]
    });
    
    if (!stable) {
      throw new BusinessException('马舍不存在', 404);
    }

    return stable;
  }

  async updateStable(id: number, updateDto: Partial<CreateStableDto> & { status?: string }) {
    const stable = await Stable.findByPk(id);
    if (!stable) {
      throw new BusinessException('马舍不存在', 404);
    }

    if (updateDto.code && updateDto.code !== stable.code) {
      const existingStable = await Stable.findOne({ where: { code: updateDto.code } });
      if (existingStable) {
        throw new BusinessException('马舍编号已存在', 400);
      }
    }

    await stable.update(updateDto);
    return this.getStableById(id);
  }

  async deleteStable(id: number) {
    const stable = await Stable.findByPk(id);
    if (!stable) {
      throw new BusinessException('马舍不存在', 404);
    }

    const horseCount = await Horse.count({ where: { stableId: id } });
    if (horseCount > 0) {
      throw new BusinessException('马舍下还有马匹，无法删除', 400);
    }

    await stable.destroy();
    return null;
  }
}

export const horseService = new HorseService();
