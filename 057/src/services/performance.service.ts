import Performance, { PerformanceLevel, PerformanceAttributes } from '../models/Performance';
import Employee from '../models/Employee';
import Department from '../models/Department';
import { NotFoundException, ConflictException, BadRequestException } from '../exceptions/HttpException';
import sequelize from '../config/database';
import { Transaction, Op } from 'sequelize';

export interface CreatePerformanceData extends Omit<PerformanceAttributes, 'id' | 'createdAt' | 'updatedAt'> {}
export interface UpdatePerformanceData extends Partial<CreatePerformanceData> {}

const validatePerformanceParams = (year: number, month: number) => {
  if (!year || year < 2000 || year > 2100) {
    throw new BadRequestException('年份参数不正确');
  }
  if (!month || month < 1 || month > 12) {
    throw new BadRequestException('月份参数不正确');
  }
};

export const getPerformanceList = async (params: {
  year: number;
  month: number;
  departmentId?: number;
  employeeId?: number;
  page?: number;
  pageSize?: number;
}) => {
  const { year, month, departmentId, employeeId, page = 1, pageSize = 10 } = params;
  validatePerformanceParams(year, month);

  const where: any = { year, month };

  if (employeeId) {
    where.employeeId = employeeId;
  }

  const include: any[] = [
    {
      model: Employee,
      as: 'employee',
      attributes: ['id', 'name', 'employeeNo'],
    },
  ];

  if (departmentId) {
    include[0].where = { departmentId };
  }

  const { count, rows } = await Performance.findAndCountAll({
    where,
    include,
    order: [['createdAt', 'DESC']],
    limit: pageSize,
    offset: (page - 1) * pageSize,
  });

  return {
    list: rows,
    pagination: {
      total: count,
      page,
      pageSize,
      totalPages: Math.ceil(count / pageSize),
    },
  };
};

export const getPerformanceById = async (id: number) => {
  const performance = await Performance.findByPk(id, {
    include: [
      {
        model: Employee,
        as: 'employee',
        attributes: ['id', 'name', 'employeeNo'],
      },
    ],
  });

  if (!performance) {
    throw new NotFoundException('绩效记录不存在');
  }

  return performance;
};

export const getEmployeePerformance = async (employeeId: number, year: number, month: number) => {
  validatePerformanceParams(year, month);

  const performance = await Performance.findOne({
    where: { employeeId, year, month },
  });

  return performance;
};

export const createPerformance = async (data: CreatePerformanceData, operatorId: number) => {
  const transaction = await sequelize.transaction();

  try {
    validatePerformanceParams(data.year, data.month);

    const employee = await Employee.findByPk(data.employeeId, { transaction });
    if (!employee) {
      throw new NotFoundException('员工不存在');
    }

    const existingPerformance = await Performance.findOne({
      where: {
        employeeId: data.employeeId,
        year: data.year,
        month: data.month,
      },
      transaction,
    });

    if (existingPerformance) {
      throw new ConflictException('该员工该月份绩效已存在');
    }

    if (data.bonusAmount === undefined) {
      const baseSalary = employee.baseSalary || 0;
      const bonusRates: Record<PerformanceLevel, number> = {
        [PerformanceLevel.EXCELLENT]: 0.3,
        [PerformanceLevel.GOOD]: 0.2,
        [PerformanceLevel.QUALIFIED]: 0.1,
        [PerformanceLevel.NEEDS_IMPROVEMENT]: 0.05,
        [PerformanceLevel.UNQUALIFIED]: 0,
      };
      data.bonusAmount = baseSalary * (bonusRates[data.level] || 0);
    }

    const performance = await Performance.create(data, { transaction });

    await transaction.commit();

    return performance;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const updatePerformance = async (
  id: number,
  data: UpdatePerformanceData,
  operatorId: number
) => {
  const transaction = await sequelize.transaction();

  try {
    const performance = await Performance.findByPk(id, { transaction });

    if (!performance) {
      throw new NotFoundException('绩效记录不存在');
    }

    if (data.year !== undefined || data.month !== undefined) {
      const year = data.year || performance.year;
      const month = data.month || performance.month;

      const existingPerformance = await Performance.findOne({
        where: {
          employeeId: performance.employeeId,
          year,
          month,
          id: { [Op.ne]: id },
        },
        transaction,
      });

      if (existingPerformance) {
        throw new ConflictException('该员工该月份绩效已存在');
      }
    }

    await performance.update(data, { transaction });

    await transaction.commit();

    return performance;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const deletePerformance = async (id: number) => {
  const transaction = await sequelize.transaction();

  try {
    const performance = await Performance.findByPk(id, { transaction });

    if (!performance) {
      throw new NotFoundException('绩效记录不存在');
    }

    await performance.destroy({ transaction });
    await transaction.commit();

    return { success: true };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const getPerformanceStats = async (year: number, month: number) => {
  validatePerformanceParams(year, month);

  const performances = await Performance.findAll({
    where: { year, month },
    include: [
      {
        model: Employee,
        as: 'employee',
        attributes: ['id', 'departmentId'],
      },
    ],
  });

  const levelCounts: Record<PerformanceLevel, number> = {
    [PerformanceLevel.EXCELLENT]: 0,
    [PerformanceLevel.GOOD]: 0,
    [PerformanceLevel.QUALIFIED]: 0,
    [PerformanceLevel.NEEDS_IMPROVEMENT]: 0,
    [PerformanceLevel.UNQUALIFIED]: 0,
  };

  let totalBonus = 0;
  let averageScore = 0;
  let scoreCount = 0;

  performances.forEach(p => {
    levelCounts[p.level]++;
    totalBonus += Number(p.bonusAmount || 0);
    if (p.score !== undefined && p.score !== null) {
      averageScore += p.score;
      scoreCount++;
    }
  });

  if (scoreCount > 0) {
    averageScore = Math.round((averageScore / scoreCount) * 100) / 100;
  }

  return {
    totalEmployees: performances.length,
    levelCounts,
    totalBonus,
    averageBonus: performances.length > 0 ? Math.round((totalBonus / performances.length) * 100) / 100 : 0,
    averageScore,
  };
};

export const bulkCreatePerformances = async (
  year: number,
  month: number,
  performances: Array<{
    employeeId: number;
    level: PerformanceLevel;
    score?: number;
    bonusAmount?: number;
  }>,
  operatorId: number
) => {
  const transaction = await sequelize.transaction();

  try {
    validatePerformanceParams(year, month);

    for (const p of performances) {
      const existingPerformance = await Performance.findOne({
        where: { employeeId: p.employeeId, year, month },
        transaction,
      });

      if (existingPerformance) {
        throw new ConflictException(`员工ID ${p.employeeId} 的该月份绩效已存在`);
      }
    }

    const createdPerformances = [];
    for (const p of performances) {
      const performance = await Performance.create({
        employeeId: p.employeeId,
        year,
        month,
        level: p.level,
        score: p.score,
        bonusAmount: p.bonusAmount,
        evaluatorId: operatorId,
      }, { transaction });

      createdPerformances.push(performance);
    }

    await transaction.commit();

    return {
      total: createdPerformances.length,
      message: `批量创建绩效成功，共 ${createdPerformances.length} 条记录`,
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};
