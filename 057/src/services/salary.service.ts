import moment from 'moment';
import ExcelJS from 'exceljs';
import Salary from '../models/Salary';
import Employee from '../models/Employee';
import Department from '../models/Department';
import Attendance, { AttendanceStatus } from '../models/Attendance';
import Performance, { PerformanceLevel } from '../models/Performance';
import { NotFoundException, ConflictException, BadRequestException } from '../exceptions/HttpException';
import sequelize from '../config/database';
import { Transaction, Op } from 'sequelize';

const SALARY_CONFIG = {
  LATE_LEVEL1_DEDUCTION: 20,
  LATE_LEVEL2_DEDUCTION: 50,
  LATE_LEVEL3_DEDUCTION: 100,
  EARLY_LEAVE_LEVEL1_DEDUCTION: 20,
  EARLY_LEAVE_LEVEL2_DEDUCTION: 50,
  EARLY_LEAVE_LEVEL3_DEDUCTION: 100,
  ABSENT_MULTIPLIER: 2,
  ATTENDANCE_BONUS_AMOUNT: 200,
  PERFORMANCE_BONUS: {
    [PerformanceLevel.EXCELLENT]: 0.3,
    [PerformanceLevel.GOOD]: 0.2,
    [PerformanceLevel.QUALIFIED]: 0.1,
    [PerformanceLevel.NEEDS_IMPROVEMENT]: 0.05,
    [PerformanceLevel.UNQUALIFIED]: 0,
  },
  SOCIAL_SECURITY_RATE: 0.08,
  HOUSING_FUND_RATE: 0.12,
  TAX_THRESHOLD: 5000,
};

export interface AttendanceSalaryStats {
  lateLevel1Days: number;
  lateLevel2Days: number;
  lateLevel3Days: number;
  earlyLeaveLevel1Days: number;
  earlyLeaveLevel2Days: number;
  earlyLeaveLevel3Days: number;
  absentDays: number;
  leaveDays: number;
  normalDays: number;
  totalWorkDays: number;
  lateTotalDeduction: number;
  earlyLeaveTotalDeduction: number;
  absentTotalDeduction: number;
  totalAttendanceDeduction: number;
  isFullAttendance: boolean;
}

const getEmployeeAttendanceStats = async (
  employeeId: number, 
  year: number, 
  month: number,
  baseSalary: number
): Promise<AttendanceSalaryStats> => {
  const startDate = moment({ year, month: month - 1 }).startOf('month').format('YYYY-MM-DD');
  const endDate = moment({ year, month: month - 1 }).endOf('month').format('YYYY-MM-DD');
  
  const attendances = await Attendance.findAll({
    where: {
      employeeId,
      date: { [Op.between]: [startDate, endDate] },
      type: 'clock_in',
    },
  });
  
  const stats: AttendanceSalaryStats = {
    lateLevel1Days: 0,
    lateLevel2Days: 0,
    lateLevel3Days: 0,
    earlyLeaveLevel1Days: 0,
    earlyLeaveLevel2Days: 0,
    earlyLeaveLevel3Days: 0,
    absentDays: 0,
    leaveDays: 0,
    normalDays: 0,
    totalWorkDays: attendances.length,
    lateTotalDeduction: 0,
    earlyLeaveTotalDeduction: 0,
    absentTotalDeduction: 0,
    totalAttendanceDeduction: 0,
    isFullAttendance: false,
  };
  
  attendances.forEach(a => {
    if (a.status === AttendanceStatus.NORMAL) stats.normalDays++;
    if (a.status === AttendanceStatus.LATE) {
      const remark = a.remark || '';
      if (remark.includes('level3')) {
        stats.lateLevel3Days++;
      } else if (remark.includes('level2')) {
        stats.lateLevel2Days++;
      } else {
        stats.lateLevel1Days++;
      }
    }
    if (a.status === AttendanceStatus.EARLY_LEAVE) {
      const remark = a.remark || '';
      if (remark.includes('level3')) {
        stats.earlyLeaveLevel3Days++;
      } else if (remark.includes('level2')) {
        stats.earlyLeaveLevel2Days++;
      } else {
        stats.earlyLeaveLevel1Days++;
      }
    }
    if (a.status === AttendanceStatus.ABSENT) stats.absentDays++;
    if (a.status === AttendanceStatus.LEAVE) stats.leaveDays++;
  });
  
  stats.lateTotalDeduction = 
    stats.lateLevel1Days * SALARY_CONFIG.LATE_LEVEL1_DEDUCTION +
    stats.lateLevel2Days * SALARY_CONFIG.LATE_LEVEL2_DEDUCTION +
    stats.lateLevel3Days * SALARY_CONFIG.LATE_LEVEL3_DEDUCTION;
  
  stats.earlyLeaveTotalDeduction = 
    stats.earlyLeaveLevel1Days * SALARY_CONFIG.EARLY_LEAVE_LEVEL1_DEDUCTION +
    stats.earlyLeaveLevel2Days * SALARY_CONFIG.EARLY_LEAVE_LEVEL2_DEDUCTION +
    stats.earlyLeaveLevel3Days * SALARY_CONFIG.EARLY_LEAVE_LEVEL3_DEDUCTION;
  
  const dailySalary = baseSalary / 22;
  stats.absentTotalDeduction = stats.absentDays * dailySalary * SALARY_CONFIG.ABSENT_MULTIPLIER;
  
  stats.totalAttendanceDeduction = 
    stats.lateTotalDeduction + 
    stats.earlyLeaveTotalDeduction + 
    stats.absentTotalDeduction;
  
  stats.isFullAttendance = 
    stats.lateLevel1Days + stats.lateLevel2Days + stats.lateLevel3Days === 0 &&
    stats.earlyLeaveLevel1Days + stats.earlyLeaveLevel2Days + stats.earlyLeaveLevel3Days === 0 &&
    stats.absentDays === 0;
  
  return stats;
};

const calculateTax = (taxableIncome: number): number => {
  if (taxableIncome <= 0) return 0;
  if (taxableIncome <= 3000) return taxableIncome * 0.03;
  if (taxableIncome <= 12000) return taxableIncome * 0.1 - 210;
  if (taxableIncome <= 25000) return taxableIncome * 0.2 - 1410;
  if (taxableIncome <= 35000) return taxableIncome * 0.25 - 2660;
  if (taxableIncome <= 55000) return taxableIncome * 0.3 - 4410;
  if (taxableIncome <= 80000) return taxableIncome * 0.35 - 7160;
  return taxableIncome * 0.45 - 15160;
};

const validateCalculateParams = (year: number, month: number) => {
  if (!year || year < 2000 || year > 2100) {
    throw new BadRequestException('年份参数不正确');
  }
  if (!month || month < 1 || month > 12) {
    throw new BadRequestException('月份参数不正确');
  }
};

export const calculateSalary = async (
  year: number,
  month: number,
  operatorId: number
) => {
  validateCalculateParams(year, month);
  
  const transaction = await sequelize.transaction();
  
  try {
    const existingSalaries = await Salary.count({
      where: { year, month },
      transaction,
    });
    
    if (existingSalaries > 0) {
      throw new ConflictException(`${year}年${month}月薪资已核算，请先删除后重新核算`);
    }
    
    const employees = await Employee.findAll({
      where: { status: { [Op.ne]: 'resigned' } },
      include: [
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'name'],
        },
      ],
      transaction,
    });
    
    if (employees.length === 0) {
      throw new BadRequestException('没有符合条件的员工进行薪资核算');
    }
    
    const performances = await Performance.findAll({
      where: { year, month },
      transaction,
    });
    
    const performanceMap = new Map<number, any>();
    performances.forEach(p => {
      performanceMap.set(p.employeeId, p);
    });
    
    const salaryRecords = [];
    
    for (const employee of employees) {
      const baseSalary = employee.baseSalary || 0;
      const dailySalary = baseSalary / 22;
      
      const attendanceStats = await getEmployeeAttendanceStats(employee.id, year, month, baseSalary);
      
      const performance = performanceMap.get(employee.id);
      let performanceBonus = 0;
      if (performance) {
        const bonusRate = SALARY_CONFIG.PERFORMANCE_BONUS[performance.level] || 0;
        performanceBonus = performance.bonusAmount || baseSalary * bonusRate;
      } else {
        performanceBonus = baseSalary * SALARY_CONFIG.PERFORMANCE_BONUS[PerformanceLevel.QUALIFIED];
      }
      
      const attendanceBonus = attendanceStats.isFullAttendance ? SALARY_CONFIG.ATTENDANCE_BONUS_AMOUNT : 0;
      const otherAllowance = 0;
      
      const totalEarnings = baseSalary + performanceBonus + attendanceBonus + otherAllowance;
      
      const socialSecurity = baseSalary * SALARY_CONFIG.SOCIAL_SECURITY_RATE;
      const housingFund = baseSalary * SALARY_CONFIG.HOUSING_FUND_RATE;
      const taxableIncome = totalEarnings - socialSecurity - housingFund - SALARY_CONFIG.TAX_THRESHOLD;
      const personalIncomeTax = calculateTax(taxableIncome);
      const totalDeductions = attendanceStats.totalAttendanceDeduction + 
                              socialSecurity + housingFund + personalIncomeTax;
      
      const netSalary = totalEarnings - totalDeductions;
      
      salaryRecords.push({
        employeeId: employee.id,
        departmentId: employee.departmentId,
        year,
        month,
        baseSalary,
        performanceBonus,
        attendanceBonus,
        otherAllowance,
        lateDeduction: attendanceStats.lateTotalDeduction,
        earlyLeaveDeduction: attendanceStats.earlyLeaveTotalDeduction,
        absentDeduction: attendanceStats.absentTotalDeduction,
        socialSecurity,
        housingFund,
        personalIncomeTax,
        otherDeduction: 0,
        totalEarnings,
        totalDeductions,
        netSalary: Math.max(0, netSalary),
        isPaid: false,
      });
    }
    
    await Salary.bulkCreate(salaryRecords, { transaction });
    
    await transaction.commit();
    
    return {
      total: salaryRecords.length,
      message: `${year}年${month}月薪资核算完成，共${salaryRecords.length}条记录`,
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const getSalaryCalculationDetails = async (
  employeeId: number,
  year: number,
  month: number
) => {
  validateCalculateParams(year, month);
  
  const employee = await Employee.findByPk(employeeId);
  if (!employee) {
    throw new NotFoundException('员工不存在');
  }
  
  const baseSalary = employee.baseSalary || 0;
  const attendanceStats = await getEmployeeAttendanceStats(employeeId, year, month, baseSalary);
  
  const performance = await Performance.findOne({
    where: { employeeId, year, month },
  });
  
  let performanceBonus = 0;
  let performanceLevel = PerformanceLevel.QUALIFIED;
  if (performance) {
    performanceLevel = performance.level;
    const bonusRate = SALARY_CONFIG.PERFORMANCE_BONUS[performance.level] || 0;
    performanceBonus = performance.bonusAmount || baseSalary * bonusRate;
  } else {
    performanceBonus = baseSalary * SALARY_CONFIG.PERFORMANCE_BONUS[PerformanceLevel.QUALIFIED];
  }
  
  const attendanceBonus = attendanceStats.isFullAttendance ? SALARY_CONFIG.ATTENDANCE_BONUS_AMOUNT : 0;
  const totalEarnings = baseSalary + performanceBonus + attendanceBonus;
  
  const socialSecurity = baseSalary * SALARY_CONFIG.SOCIAL_SECURITY_RATE;
  const housingFund = baseSalary * SALARY_CONFIG.HOUSING_FUND_RATE;
  const taxableIncome = totalEarnings - socialSecurity - housingFund - SALARY_CONFIG.TAX_THRESHOLD;
  const personalIncomeTax = calculateTax(taxableIncome);
  const totalDeductions = attendanceStats.totalAttendanceDeduction + socialSecurity + housingFund + personalIncomeTax;
  const netSalary = totalEarnings - totalDeductions;
  
  return {
    employee: {
      id: employee.id,
      name: employee.name,
      employeeNo: employee.employeeNo,
      baseSalary,
    },
    attendanceStats,
    performance: {
      level: performanceLevel,
      bonusAmount: performanceBonus,
      hasPerformanceData: !!performance,
    },
    earnings: {
      baseSalary,
      performanceBonus,
      attendanceBonus,
      totalEarnings,
    },
    deductions: {
      lateDeduction: attendanceStats.lateTotalDeduction,
      earlyLeaveDeduction: attendanceStats.earlyLeaveTotalDeduction,
      absentDeduction: attendanceStats.absentTotalDeduction,
      socialSecurity,
      housingFund,
      personalIncomeTax,
      totalDeductions,
    },
    netSalary: Math.max(0, netSalary),
  };
};

export const recalculateSingleSalary = async (
  salaryId: number,
  operatorId: number
) => {
  const transaction = await sequelize.transaction();
  
  try {
    const salary = await Salary.findByPk(salaryId, { transaction });
    
    if (!salary) {
      throw new NotFoundException('薪资记录不存在');
    }
    
    if (salary.isPaid) {
      throw new ConflictException('薪资已发放，无法重新核算');
    }
    
    const employee = await Employee.findByPk(salary.employeeId, { transaction });
    
    if (!employee) {
      throw new NotFoundException('员工不存在');
    }
    
    const attendanceStats = await getEmployeeAttendanceStats(salary.employeeId, salary.year, salary.month);
    
    const baseSalary = employee.baseSalary || 0;
    const dailySalary = baseSalary / 22;
    
    const lateDeduction = attendanceStats.lateDays * SALARY_CONFIG.LATE_DEDUCTION_AMOUNT;
    const earlyLeaveDeduction = attendanceStats.earlyLeaveDays * SALARY_CONFIG.EARLY_LEAVE_DEDUCTION_AMOUNT;
    const absentDeduction = attendanceStats.absentDays * dailySalary * SALARY_CONFIG.ABSENT_MULTIPLIER;
    
    const performanceBonus = baseSalary * SALARY_CONFIG.PERFORMANCE_BONUS_RATE;
    const isFullAttendance = attendanceStats.lateDays === 0 && 
                            attendanceStats.earlyLeaveDays === 0 && 
                            attendanceStats.absentDays === 0;
    const attendanceBonus = isFullAttendance ? SALARY_CONFIG.ATTENDANCE_BONUS_AMOUNT : 0;
    
    const totalEarnings = baseSalary + performanceBonus + attendanceBonus + salary.otherAllowance;
    
    const socialSecurity = baseSalary * SALARY_CONFIG.SOCIAL_SECURITY_RATE;
    const housingFund = baseSalary * SALARY_CONFIG.HOUSING_FUND_RATE;
    const taxableIncome = totalEarnings - socialSecurity - housingFund - SALARY_CONFIG.TAX_THRESHOLD;
    const personalIncomeTax = calculateTax(taxableIncome);
    const totalDeductions = lateDeduction + earlyLeaveDeduction + absentDeduction + 
                            socialSecurity + housingFund + personalIncomeTax + salary.otherDeduction;
    
    const netSalary = totalEarnings - totalDeductions;
    
    await salary.update({
      baseSalary,
      performanceBonus,
      attendanceBonus,
      lateDeduction,
      earlyLeaveDeduction,
      absentDeduction,
      socialSecurity,
      housingFund,
      personalIncomeTax,
      totalEarnings,
      totalDeductions,
      netSalary: Math.max(0, netSalary),
    }, { transaction });
    
    await transaction.commit();
    
    return salary;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const getSalaryList = async (params: {
  year: number;
  month: number;
  departmentId?: number;
  employeeId?: number;
  isPaid?: boolean;
  page?: number;
  pageSize?: number;
}) => {
  const { year, month, departmentId, employeeId, isPaid, page = 1, pageSize = 10 } = params;
  
  const where: any = { year, month };
  
  if (departmentId) {
    where.departmentId = departmentId;
  }
  
  if (employeeId) {
    where.employeeId = employeeId;
  }
  
  if (isPaid !== undefined) {
    where.isPaid = isPaid;
  }
  
  const { count, rows } = await Salary.findAndCountAll({
    where,
    include: [
      {
        model: Employee,
        as: 'employee',
        attributes: ['id', 'name', 'employeeNo'],
      },
      {
        model: Department,
        as: 'department',
        attributes: ['id', 'name'],
      },
    ],
    order: [['employeeId', 'ASC']],
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

export const getSalaryById = async (id: number) => {
  const salary = await Salary.findByPk(id, {
    include: [
      {
        model: Employee,
        as: 'employee',
        attributes: ['id', 'name', 'employeeNo', 'phone', 'email'],
      },
      {
        model: Department,
        as: 'department',
        attributes: ['id', 'name'],
      },
    ],
  });
  
  if (!salary) {
    throw new NotFoundException('薪资记录不存在');
  }
  
  return salary;
};

export const getSalaryHistory = async (employeeId: number, limit: number = 12) => {
  const salaries = await Salary.findAll({
    where: { employeeId },
    include: [
      {
        model: Department,
        as: 'department',
        attributes: ['id', 'name'],
      },
    ],
    order: [['year', 'DESC'], ['month', 'DESC']],
    limit,
  });
  
  return salaries;
};

export const updateSalary = async (
  id: number,
  data: {
    performanceBonus?: number;
    attendanceBonus?: number;
    otherAllowance?: number;
    otherDeduction?: number;
    remark?: string;
  }
) => {
  const salary = await Salary.findByPk(id);
  
  if (!salary) {
    throw new NotFoundException('薪资记录不存在');
  }
  
  if (salary.isPaid) {
    throw new ConflictException('薪资已发放，无法修改');
  }
  
  const updateData: any = { ...data };
  
  const hasEarningsChange = 
    data.performanceBonus !== undefined || 
    data.attendanceBonus !== undefined || 
    data.otherAllowance !== undefined;
  
  if (hasEarningsChange) {
    updateData.totalEarnings = salary.baseSalary + 
      (data.performanceBonus ?? salary.performanceBonus) + 
      (data.attendanceBonus ?? salary.attendanceBonus) + 
      (data.otherAllowance ?? salary.otherAllowance);
  }
  
  const hasDeductionChange = data.otherDeduction !== undefined;
  
  if (hasDeductionChange) {
    updateData.totalDeductions = salary.lateDeduction + 
      salary.earlyLeaveDeduction + salary.absentDeduction + 
      salary.socialSecurity + salary.housingFund + 
      salary.personalIncomeTax + (data.otherDeduction ?? salary.otherDeduction);
  }
  
  if (hasEarningsChange || hasDeductionChange) {
    updateData.netSalary = (updateData.totalEarnings ?? salary.totalEarnings) - 
      (updateData.totalDeductions ?? salary.totalDeductions);
  }
  
  await salary.update(updateData);
  
  return salary;
};

export const deleteSalary = async (year: number, month: number) => {
  validateCalculateParams(year, month);
  
  const transaction = await sequelize.transaction();
  
  try {
    const paidCount = await Salary.count({
      where: { year, month, isPaid: true },
      transaction,
    });
    
    if (paidCount > 0) {
      throw new ConflictException('存在已发放的薪资记录，无法删除该月薪资');
    }
    
    const deletedCount = await Salary.destroy({
      where: { year, month, isPaid: false },
      transaction,
    });
    
    if (deletedCount === 0) {
      throw new BadRequestException('没有可删除的薪资记录');
    }
    
    await transaction.commit();
    
    return { deletedCount };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const markAsPaid = async (year: number, month: number, operatorId: number) => {
  validateCalculateParams(year, month);
  
  const transaction = await sequelize.transaction();
  
  try {
    const [affectedCount] = await Salary.update(
      { isPaid: true, paidAt: new Date() },
      {
        where: { year, month, isPaid: false },
        transaction,
      }
    );
    
    if (affectedCount === 0) {
      throw new BadRequestException('没有可标记为已发放的薪资记录');
    }
    
    await transaction.commit();
    
    return { paidCount: affectedCount };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const markSingleAsPaid = async (salaryId: number, operatorId: number) => {
  const transaction = await sequelize.transaction();
  
  try {
    const salary = await Salary.findByPk(salaryId, { transaction });
    
    if (!salary) {
      throw new NotFoundException('薪资记录不存在');
    }
    
    if (salary.isPaid) {
      throw new ConflictException('该薪资记录已发放');
    }
    
    await salary.update(
      { isPaid: true, paidAt: new Date() },
      { transaction }
    );
    
    await transaction.commit();
    
    return salary;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const getSalaryStats = async (year: number, month: number) => {
  validateCalculateParams(year, month);
  
  const salaries = await Salary.findAll({
    where: { year, month },
  });
  
  const stats = {
    totalEmployees: salaries.length,
    totalBaseSalary: 0,
    totalPerformanceBonus: 0,
    totalAttendanceBonus: 0,
    totalOtherAllowance: 0,
    totalEarnings: 0,
    totalDeductions: 0,
    totalNetSalary: 0,
    paidCount: 0,
    unpaidCount: 0,
    avgSalary: 0,
    maxSalary: 0,
    minSalary: Number.MAX_VALUE,
  };
  
  salaries.forEach(s => {
    stats.totalBaseSalary += s.baseSalary;
    stats.totalPerformanceBonus += s.performanceBonus;
    stats.totalAttendanceBonus += s.attendanceBonus;
    stats.totalOtherAllowance += s.otherAllowance;
    stats.totalEarnings += s.totalEarnings;
    stats.totalDeductions += s.totalDeductions;
    stats.totalNetSalary += s.netSalary;
    
    if (s.netSalary > stats.maxSalary) {
      stats.maxSalary = s.netSalary;
    }
    if (s.netSalary < stats.minSalary) {
      stats.minSalary = s.netSalary;
    }
    
    if (s.isPaid) stats.paidCount++;
    else stats.unpaidCount++;
  });
  
  if (stats.totalEmployees > 0) {
    stats.avgSalary = Math.round(stats.totalNetSalary / stats.totalEmployees * 100) / 100;
  }
  
  if (stats.minSalary === Number.MAX_VALUE) {
    stats.minSalary = 0;
  }
  
  return stats;
};

export const getDepartmentSalaryStats = async (year: number, month: number) => {
  validateCalculateParams(year, month);
  
  const salaries = await Salary.findAll({
    where: { year, month },
    include: [
      {
        model: Department,
        as: 'department',
        attributes: ['id', 'name'],
      },
    ],
  });
  
  const departmentStats: Record<number, any> = {};
  
  salaries.forEach(s => {
    const deptId = s.departmentId;
    if (!departmentStats[deptId]) {
      departmentStats[deptId] = {
        departmentId: deptId,
        departmentName: s.department?.name || '未分配部门',
        employeeCount: 0,
        totalNetSalary: 0,
        avgNetSalary: 0,
        paidCount: 0,
      };
    }
    
    departmentStats[deptId].employeeCount++;
    departmentStats[deptId].totalNetSalary += s.netSalary;
    if (s.isPaid) departmentStats[deptId].paidCount++;
  });
  
  Object.values(departmentStats).forEach(stats => {
    if (stats.employeeCount > 0) {
      stats.avgNetSalary = Math.round(stats.totalNetSalary / stats.employeeCount * 100) / 100;
    }
  });
  
  return Object.values(departmentStats);
};

export const exportSalaryToExcel = async (year: number, month: number, departmentId?: number) => {
  validateCalculateParams(year, month);
  
  const where: any = { year, month };
  
  if (departmentId) {
    where.departmentId = departmentId;
  }
  
  const salaries = await Salary.findAll({
    where,
    include: [
      {
        model: Employee,
        as: 'employee',
        attributes: ['id', 'name', 'employeeNo'],
      },
      {
        model: Department,
        as: 'department',
        attributes: ['id', 'name'],
      },
    ],
    order: [['employeeId', 'ASC']],
  });
  
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(`${year}年${month}月薪资表`);
  
  worksheet.columns = [
    { header: '员工编号', key: 'employeeNo', width: 15 },
    { header: '员工姓名', key: 'employeeName', width: 15 },
    { header: '部门', key: 'departmentName', width: 15 },
    { header: '基本工资', key: 'baseSalary', width: 12 },
    { header: '绩效奖金', key: 'performanceBonus', width: 12 },
    { header: '全勤奖', key: 'attendanceBonus', width: 12 },
    { header: '其他补贴', key: 'otherAllowance', width: 12 },
    { header: '应发工资', key: 'totalEarnings', width: 12 },
    { header: '迟到扣款', key: 'lateDeduction', width: 12 },
    { header: '早退扣款', key: 'earlyLeaveDeduction', width: 12 },
    { header: '旷工扣款', key: 'absentDeduction', width: 12 },
    { header: '社保', key: 'socialSecurity', width: 12 },
    { header: '公积金', key: 'housingFund', width: 12 },
    { header: '个税', key: 'personalIncomeTax', width: 12 },
    { header: '其他扣款', key: 'otherDeduction', width: 12 },
    { header: '扣款合计', key: 'totalDeductions', width: 12 },
    { header: '实发工资', key: 'netSalary', width: 12 },
    { header: '发放状态', key: 'isPaid', width: 12 },
  ];
  
  salaries.forEach(s => {
    worksheet.addRow({
      employeeNo: s.employee?.employeeNo || '',
      employeeName: s.employee?.name || '',
      departmentName: s.department?.name || '',
      baseSalary: s.baseSalary,
      performanceBonus: s.performanceBonus,
      attendanceBonus: s.attendanceBonus,
      otherAllowance: s.otherAllowance,
      totalEarnings: s.totalEarnings,
      lateDeduction: s.lateDeduction,
      earlyLeaveDeduction: s.earlyLeaveDeduction,
      absentDeduction: s.absentDeduction,
      socialSecurity: s.socialSecurity,
      housingFund: s.housingFund,
      personalIncomeTax: s.personalIncomeTax,
      otherDeduction: s.otherDeduction,
      totalDeductions: s.totalDeductions,
      netSalary: s.netSalary,
      isPaid: s.isPaid ? '已发放' : '未发放',
    });
  });
  
  const buffer = await workbook.xlsx.writeBuffer();
  
  return buffer;
};

export const getMySalary = async (employeeId: number, year: number, month: number) => {
  validateCalculateParams(year, month);
  
  const salary = await Salary.findOne({
    where: { employeeId, year, month },
    include: [
      {
        model: Department,
        as: 'department',
        attributes: ['id', 'name'],
      },
    ],
  });
  
  if (!salary) {
    throw new NotFoundException('薪资记录不存在');
  }
  
  return salary;
};

export const checkSalaryCalculated = async (year: number, month: number) => {
  validateCalculateParams(year, month);
  
  const count = await Salary.count({
    where: { year, month },
  });
  
  return {
    isCalculated: count > 0,
    recordCount: count,
  };
};
