import moment from 'moment';
import Attendance, { AttendanceStatus, AttendanceType, AttendanceAttributes } from '../models/Attendance';
import LeaveRequest, { LeaveStatus, LeaveType } from '../models/LeaveRequest';
import MakeupCard, { MakeupCardStatus } from '../models/MakeupCard';
import Employee from '../models/Employee';
import { NotFoundException, ConflictException, BadRequestException, ForbiddenException } from '../exceptions/HttpException';
import sequelize from '../config/database';
import { Transaction, Op } from 'sequelize';

const WORK_START_HOUR = 9;
const WORK_END_HOUR = 18;
const LATE_LEVEL1_THRESHOLD_MINUTES = 10;
const LATE_LEVEL2_THRESHOLD_MINUTES = 30;
const LATE_LEVEL3_THRESHOLD_MINUTES = 60;
const EARLY_LEAVE_LEVEL1_THRESHOLD_MINUTES = 10;
const EARLY_LEAVE_LEVEL2_THRESHOLD_MINUTES = 30;
const EARLY_LEAVE_LEVEL3_THRESHOLD_MINUTES = 60;
const MIN_WORK_HOURS = 8;
const LATE_LEVEL1_DEDUCTION = 20;
const LATE_LEVEL2_DEDUCTION = 50;
const LATE_LEVEL3_DEDUCTION = 100;
const EARLY_LEAVE_LEVEL1_DEDUCTION = 20;
const EARLY_LEAVE_LEVEL2_DEDUCTION = 50;
const EARLY_LEAVE_LEVEL3_DEDUCTION = 100;
const ABSENT_DEDUCTION_MULTIPLIER = 2;
const WORK_START_BUFFER_MINUTES = 30;

export enum LateLevel {
  NORMAL = 'normal',
  LEVEL1 = 'level1',
  LEVEL2 = 'level2',
  LEVEL3 = 'level3',
}

export interface AttendanceJudgment {
  status: AttendanceStatus;
  lateLevel?: LateLevel;
  lateMinutes?: number;
  earlyLeaveMinutes?: number;
  workHours?: number;
  isAbsent: boolean;
  deductionAmount: number;
  judgmentReason?: string;
}

interface ClockData {
  latitude?: number;
  longitude?: number;
  location?: string;
  device?: string;
  ip?: string;
}

const validateEmployeeStatus = async (employeeId: number, transaction: Transaction): Promise<void> => {
  const employee = await Employee.findByPk(employeeId, { transaction });
  
  if (!employee) {
    throw new NotFoundException('员工不存在');
  }
  
  if (employee.status === 'resigned' || employee.status === 'terminated') {
    throw new ForbiddenException('该员工已离职或已被解雇，无法打卡');
  }
};

const calculateLateLevel = (lateMinutes: number): LateLevel => {
  if (lateMinutes <= 0) return LateLevel.NORMAL;
  if (lateMinutes <= LATE_LEVEL1_THRESHOLD_MINUTES) return LateLevel.LEVEL1;
  if (lateMinutes <= LATE_LEVEL2_THRESHOLD_MINUTES) return LateLevel.LEVEL2;
  return LateLevel.LEVEL3;
};

const calculateEarlyLeaveLevel = (earlyLeaveMinutes: number): LateLevel => {
  if (earlyLeaveMinutes <= 0) return LateLevel.NORMAL;
  if (earlyLeaveMinutes <= EARLY_LEAVE_LEVEL1_THRESHOLD_MINUTES) return LateLevel.LEVEL1;
  if (earlyLeaveMinutes <= EARLY_LEAVE_LEVEL2_THRESHOLD_MINUTES) return LateLevel.LEVEL2;
  return LateLevel.LEVEL3;
};

const calculateLateDeduction = (lateLevel: LateLevel): number => {
  switch (lateLevel) {
    case LateLevel.LEVEL1: return LATE_LEVEL1_DEDUCTION;
    case LateLevel.LEVEL2: return LATE_LEVEL2_DEDUCTION;
    case LateLevel.LEVEL3: return LATE_LEVEL3_DEDUCTION;
    default: return 0;
  }
};

const calculateEarlyLeaveDeduction = (earlyLeaveLevel: LateLevel): number => {
  switch (earlyLeaveLevel) {
    case LateLevel.LEVEL1: return EARLY_LEAVE_LEVEL1_DEDUCTION;
    case LateLevel.LEVEL2: return EARLY_LEAVE_LEVEL2_DEDUCTION;
    case LateLevel.LEVEL3: return EARLY_LEAVE_LEVEL3_DEDUCTION;
    default: return 0;
  }
};

export const calculateClockInJudgment = (clockTime: moment.Moment): AttendanceJudgment => {
  const workStartTime = clockTime.clone().hour(WORK_START_HOUR).minute(0).second(0);
  const diffMinutes = clockTime.diff(workStartTime, 'minutes');
  
  let status: AttendanceStatus;
  let lateLevel: LateLevel = LateLevel.NORMAL;
  let isAbsent = false;
  let deductionAmount = 0;
  let judgmentReason = '';
  
  if (diffMinutes <= 0) {
    status = AttendanceStatus.NORMAL;
    judgmentReason = '正常签到';
  } else if (diffMinutes < LATE_LEVEL3_THRESHOLD_MINUTES) {
    status = AttendanceStatus.LATE;
    lateLevel = calculateLateLevel(diffMinutes);
    deductionAmount = calculateLateDeduction(lateLevel);
    judgmentReason = `迟到${diffMinutes}分钟，等级${lateLevel}，扣款${deductionAmount}元`;
  } else {
    status = AttendanceStatus.ABSENT;
    isAbsent = true;
    judgmentReason = `迟到${diffMinutes}分钟，视为旷工`;
  }
  
  return {
    status,
    lateLevel,
    lateMinutes: diffMinutes > 0 ? diffMinutes : 0,
    isAbsent,
    deductionAmount,
    judgmentReason,
  };
};

export const calculateClockOutJudgment = (clockTime: moment.Moment, clockInTime?: moment.Moment): AttendanceJudgment => {
  const workEndTime = clockTime.clone().hour(WORK_END_HOUR).minute(0).second(0);
  const diffMinutes = clockTime.diff(workEndTime, 'minutes');
  const earlyLeaveMinutes = diffMinutes < 0 ? Math.abs(diffMinutes) : 0;
  
  let status: AttendanceStatus;
  let earlyLeaveLevel: LateLevel = LateLevel.NORMAL;
  let isAbsent = false;
  let deductionAmount = 0;
  let judgmentReason = '';
  let workHours = 0;
  
  if (clockInTime) {
    workHours = moment.duration(clockTime.diff(clockInTime)).asHours();
  }
  
  if (diffMinutes >= 0) {
    status = AttendanceStatus.NORMAL;
    judgmentReason = '正常签退';
  } else if (earlyLeaveMinutes < EARLY_LEAVE_LEVEL3_THRESHOLD_MINUTES) {
    status = AttendanceStatus.EARLY_LEAVE;
    earlyLeaveLevel = calculateEarlyLeaveLevel(earlyLeaveMinutes);
    deductionAmount = calculateEarlyLeaveDeduction(earlyLeaveLevel);
    judgmentReason = `早退${earlyLeaveMinutes}分钟，等级${earlyLeaveLevel}，扣款${deductionAmount}元`;
  } else {
    status = AttendanceStatus.ABSENT;
    isAbsent = true;
    judgmentReason = `早退${earlyLeaveMinutes}分钟，视为旷工`;
  }
  
  if (workHours > 0 && workHours < MIN_WORK_HOURS) {
    judgmentReason += `；实际工作时长${workHours.toFixed(2)}小时，不足${MIN_WORK_HOURS}小时`;
  }
  
  return {
    status,
    earlyLeaveLevel,
    earlyLeaveMinutes,
    workHours,
    isAbsent,
    deductionAmount,
    judgmentReason,
  };
};

export const calculateDailyAttendance = (
  clockInTime: moment.Moment | null,
  clockOutTime: moment.Moment | null
): AttendanceJudgment => {
  if (!clockInTime && !clockOutTime) {
    return {
      status: AttendanceStatus.ABSENT,
      isAbsent: true,
      deductionAmount: 0,
      judgmentReason: '全天未打卡，视为旷工',
    };
  }
  
  if (clockInTime && !clockOutTime) {
    const clockInJudgment = calculateClockInJudgment(clockInTime);
    return {
      ...clockInJudgment,
      judgmentReason: clockInJudgment.judgmentReason + '；未签退',
    };
  }
  
  if (!clockInTime && clockOutTime) {
    return {
      status: AttendanceStatus.ABSENT,
      isAbsent: true,
      deductionAmount: 0,
      judgmentReason: '未签到，仅签退，视为旷工',
    };
  }
  
  const clockInJudgment = calculateClockInJudgment(clockInTime!);
  const clockOutJudgment = calculateClockOutJudgment(clockOutTime!, clockInTime!);
  
  const finalStatus = clockInJudgment.isAbsent || clockOutJudgment.isAbsent 
    ? AttendanceStatus.ABSENT 
    : (clockInJudgment.status === AttendanceStatus.LATE ? AttendanceStatus.LATE :
       clockOutJudgment.status === AttendanceStatus.EARLY_LEAVE ? AttendanceStatus.EARLY_LEAVE :
       AttendanceStatus.NORMAL);
  
  const totalDeduction = clockInJudgment.deductionAmount + clockOutJudgment.deductionAmount;
  
  const reasons = [
    clockInJudgment.judgmentReason,
    clockOutJudgment.judgmentReason,
  ].filter(Boolean).join('；');
  
  return {
    status: finalStatus,
    lateLevel: clockInJudgment.lateLevel,
    lateMinutes: clockInJudgment.lateMinutes,
    earlyLeaveLevel: clockOutJudgment.earlyLeaveLevel,
    earlyLeaveMinutes: clockOutJudgment.earlyLeaveMinutes,
    workHours: clockOutJudgment.workHours,
    isAbsent: finalStatus === AttendanceStatus.ABSENT,
    deductionAmount: totalDeduction,
    judgmentReason: reasons,
  };
};

export const clockIn = async (employeeId: number, data: ClockData) => {
  const transaction = await sequelize.transaction();
  
  try {
    await validateEmployeeStatus(employeeId, transaction);
    
    const today = moment().format('YYYY-MM-DD');
    const now = moment();
    
    const existingClockIn = await Attendance.findOne({
      where: {
        employeeId,
        date: today,
        type: AttendanceType.CLOCK_IN,
      },
      transaction,
    });
    
    if (existingClockIn) {
      throw new ConflictException('今日已签到，请勿重复签到');
    }
    
    const judgment = calculateClockInJudgment(now);
    
    const attendance = await Attendance.create({
      employeeId,
      date: today,
      type: AttendanceType.CLOCK_IN,
      time: now.toDate(),
      status: judgment.status,
      remark: judgment.judgmentReason,
      ...data,
    }, { transaction });
    
    await transaction.commit();
    
    return {
      attendance,
      judgment,
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const clockOut = async (employeeId: number, data: ClockData) => {
  const transaction = await sequelize.transaction();
  
  try {
    await validateEmployeeStatus(employeeId, transaction);
    
    const today = moment().format('YYYY-MM-DD');
    const now = moment();
    
    const existingClockOut = await Attendance.findOne({
      where: {
        employeeId,
        date: today,
        type: AttendanceType.CLOCK_OUT,
      },
      transaction,
    });
    
    if (existingClockOut) {
      throw new ConflictException('今日已签退，请勿重复签退');
    }
    
    const clockIn = await Attendance.findOne({
      where: {
        employeeId,
        date: today,
        type: AttendanceType.CLOCK_IN,
      },
      transaction,
    });
    
    if (!clockIn) {
      throw new BadRequestException('今日未签到，无法签退');
    }
    
    const judgment = calculateClockOutJudgment(now, moment(clockIn.time));
    
    const attendance = await Attendance.create({
      employeeId,
      date: today,
      type: AttendanceType.CLOCK_OUT,
      time: now.toDate(),
      status: judgment.status,
      remark: judgment.judgmentReason,
      ...data,
    }, { transaction });
    
    await transaction.commit();
    
    return {
      attendance,
      judgment,
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const getTodayAttendance = async (employeeId: number) => {
  const today = moment().format('YYYY-MM-DD');
  
  const attendances = await Attendance.findAll({
    where: {
      employeeId,
      date: today,
    },
    order: [['time', 'ASC']],
  });
  
  const clockIn = attendances.find(a => a.type === AttendanceType.CLOCK_IN);
  const clockOut = attendances.find(a => a.type === AttendanceType.CLOCK_OUT);
  
  let workHours = 0;
  if (clockIn && clockOut) {
    workHours = moment(clockOut.time).diff(moment(clockIn.time), 'hours', true);
  }
  
  let estimatedDeduction = 0;
  if (clockIn?.status === AttendanceStatus.LATE) {
    estimatedDeduction += LATE_DEDUCTION_AMOUNT;
  }
  if (clockIn?.status === AttendanceStatus.ABSENT) {
    const dailySalary = 0;
    estimatedDeduction += dailySalary * ABSENT_DEDUCTION_MULTIPLIER;
  }
  if (clockOut?.status === AttendanceStatus.EARLY_LEAVE) {
    estimatedDeduction += EARLY_LEAVE_DEDUCTION_AMOUNT;
  }
  
  return {
    date: today,
    clockIn,
    clockOut,
    workHours: parseFloat(workHours.toFixed(2)),
    overallStatus: clockIn?.status || AttendanceStatus.ABSENT,
    estimatedDeduction,
    workStartTime: `${WORK_START_HOUR}:00`,
    workEndTime: `${WORK_END_HOUR}:00`,
  };
};

export const getAttendanceRecords = async (params: {
  employeeId?: number;
  departmentId?: number;
  startDate?: string;
  endDate?: string;
  status?: AttendanceStatus;
  page?: number;
  pageSize?: number;
}) => {
  const { 
    employeeId, 
    departmentId, 
    startDate, 
    endDate, 
    status, 
    page = 1, 
    pageSize = 10 
  } = params;
  
  const where: any = {};
  
  if (employeeId) {
    where.employeeId = employeeId;
  }
  
  if (startDate && endDate) {
    where.date = { [Op.between]: [startDate, endDate] };
  }
  
  if (status) {
    where.status = status;
  }
  
  const include: any[] = [
    {
      model: Employee,
      as: 'employee',
      attributes: ['id', 'name', 'employeeNo'],
      include: departmentId ? [
        {
          model: require('../models/Department').default,
          as: 'department',
          where: { id: departmentId },
          attributes: [],
        }
      ] : [],
    },
  ];
  
  const { count, rows } = await Attendance.findAndCountAll({
    where,
    include,
    order: [['date', 'DESC'], ['time', 'ASC']],
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

export const getAttendanceStats = async (employeeId: number, year: number, month: number) => {
  const startDate = moment({ year, month: month - 1 }).startOf('month').format('YYYY-MM-DD');
  const endDate = moment({ year, month: month - 1 }).endOf('month').format('YYYY-MM-DD');
  
  const attendances = await Attendance.findAll({
    where: {
      employeeId,
      date: { [Op.between]: [startDate, endDate] },
    },
  });
  
  const stats = {
    totalDays: attendances.length,
    normalDays: 0,
    lateDays: 0,
    earlyLeaveDays: 0,
    absentDays: 0,
    leaveDays: 0,
    totalWorkHours: 0,
    totalDeduction: 0,
  };
  
  attendances.forEach(a => {
    switch (a.status) {
      case AttendanceStatus.NORMAL:
        stats.normalDays++;
        break;
      case AttendanceStatus.LATE:
        stats.lateDays++;
        stats.totalDeduction += LATE_DEDUCTION_AMOUNT;
        break;
      case AttendanceStatus.EARLY_LEAVE:
        stats.earlyLeaveDays++;
        stats.totalDeduction += EARLY_LEAVE_DEDUCTION_AMOUNT;
        break;
      case AttendanceStatus.ABSENT:
        stats.absentDays++;
        break;
      case AttendanceStatus.LEAVE:
        stats.leaveDays++;
        break;
    }
  });
  
  const attendanceRate = (stats.normalDays / moment({ year, month: month - 1 }).daysInMonth()) * 100;
  
  return {
    ...stats,
    attendanceRate: parseFloat(attendanceRate.toFixed(2)),
  };
};

export const getMonthlyAttendanceReport = async (year: number, month: number, departmentId?: number) => {
  const startDate = moment({ year, month: month - 1 }).startOf('month').format('YYYY-MM-DD');
  const endDate = moment({ year, month: month - 1 }).endOf('month').format('YYYY-MM-DD');
  
  const where: any = {
    date: { [Op.between]: [startDate, endDate] },
  };
  
  const include: any[] = [
    {
      model: Employee,
      as: 'employee',
      attributes: ['id', 'name', 'employeeNo'],
      include: departmentId ? [
        {
          model: require('../models/Department').default,
          as: 'department',
          where: { id: departmentId },
          attributes: ['id', 'name'],
        }
      ] : [
        {
          model: require('../models/Department').default,
          as: 'department',
          attributes: ['id', 'name'],
        }
      ],
    },
  ];
  
  const attendances = await Attendance.findAll({
    where,
    include,
    order: [['employeeId', 'ASC'], ['date', 'ASC']],
  });
  
  const employeeStats: Record<number, any> = {};
  
  attendances.forEach(a => {
    if (!employeeStats[a.employeeId]) {
      employeeStats[a.employeeId] = {
        employee: a.employee,
        totalDays: 0,
        normalDays: 0,
        lateDays: 0,
        earlyLeaveDays: 0,
        absentDays: 0,
        leaveDays: 0,
      };
    }
    
    employeeStats[a.employeeId].totalDays++;
    
    switch (a.status) {
      case AttendanceStatus.NORMAL:
        employeeStats[a.employeeId].normalDays++;
        break;
      case AttendanceStatus.LATE:
        employeeStats[a.employeeId].lateDays++;
        break;
      case AttendanceStatus.EARLY_LEAVE:
        employeeStats[a.employeeId].earlyLeaveDays++;
        break;
      case AttendanceStatus.ABSENT:
        employeeStats[a.employeeId].absentDays++;
        break;
      case AttendanceStatus.LEAVE:
        employeeStats[a.employeeId].leaveDays++;
        break;
    }
  });
  
  return Object.values(employeeStats);
};

export const createLeaveRequest = async (
  employeeId: number,
  data: {
    type: LeaveType;
    startDate: Date;
    endDate: Date;
    days: number;
    reason: string;
  }
) => {
  const startMoment = moment(data.startDate);
  const endMoment = moment(data.endDate);
  
  if (endMoment.isBefore(startMoment)) {
    throw new BadRequestException('结束日期不能早于开始日期');
  }
  
  if (data.days <= 0) {
    throw new BadRequestException('请假天数必须大于0');
  }
  
  const overlappingLeave = await LeaveRequest.findOne({
    where: {
      employeeId,
      status: { [Op.ne]: LeaveStatus.REJECTED },
      [Op.or]: [
        { startDate: { [Op.between]: [data.startDate, data.endDate] } },
        { endDate: { [Op.between]: [data.startDate, data.endDate] } },
      ],
    },
  });
  
  if (overlappingLeave) {
    throw new ConflictException('该时间段已有请假申请');
  }
  
  const leaveRequest = await LeaveRequest.create({
    employeeId,
    ...data,
    status: LeaveStatus.PENDING,
  });
  
  return leaveRequest;
};

export const getLeaveRequests = async (params: {
  employeeId?: number;
  status?: LeaveStatus;
  type?: LeaveType;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}) => {
  const { employeeId, status, type, startDate, endDate, page = 1, pageSize = 10 } = params;
  
  const where: any = {};
  
  if (employeeId) {
    where.employeeId = employeeId;
  }
  
  if (status) {
    where.status = status;
  }
  
  if (type) {
    where.type = type;
  }
  
  if (startDate && endDate) {
    where[Op.or] = [
      { startDate: { [Op.between]: [startDate, endDate] } },
      { endDate: { [Op.between]: [startDate, endDate] } },
    ];
  }
  
  const { count, rows } = await LeaveRequest.findAndCountAll({
    where,
    include: [
      {
        model: Employee,
        as: 'employee',
        attributes: ['id', 'name', 'employeeNo'],
      },
    ],
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

export const getLeaveRequestById = async (id: number) => {
  const leaveRequest = await LeaveRequest.findByPk(id, {
    include: [
      {
        model: Employee,
        as: 'employee',
        attributes: ['id', 'name', 'employeeNo'],
      },
    ],
  });
  
  if (!leaveRequest) {
    throw new NotFoundException('请假申请不存在');
  }
  
  return leaveRequest;
};

export const approveLeaveRequest = async (
  id: number,
  approverId: number,
  approved: boolean,
  approvalRemark?: string
) => {
  const transaction = await sequelize.transaction();
  
  try {
    const leaveRequest = await LeaveRequest.findByPk(id, { transaction });
    
    if (!leaveRequest) {
      throw new NotFoundException('请假申请不存在');
    }
    
    if (leaveRequest.status !== LeaveStatus.PENDING) {
      throw new ConflictException('该请假申请已处理');
    }
    
    await leaveRequest.update({
      status: approved ? LeaveStatus.APPROVED : LeaveStatus.REJECTED,
      approverId,
      approvalRemark,
      approvalTime: new Date(),
    }, { transaction });
    
    if (approved) {
      const startDate = moment(leaveRequest.startDate);
      const endDate = moment(leaveRequest.endDate);
      
      for (let m = startDate.clone(); m.isSameOrBefore(endDate, 'day'); m.add(1, 'day')) {
        await Attendance.create({
          employeeId: leaveRequest.employeeId,
          date: m.format('YYYY-MM-DD'),
          type: AttendanceType.CLOCK_IN,
          time: m.toDate(),
          status: AttendanceStatus.LEAVE,
          remark: `请假类型: ${leaveRequest.type}, 请假申请ID: ${id}`,
        }, { transaction });
      }
    }
    
    await transaction.commit();
    
    return leaveRequest;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const cancelLeaveRequest = async (id: number, employeeId: number) => {
  const leaveRequest = await LeaveRequest.findByPk(id);
  
  if (!leaveRequest) {
    throw new NotFoundException('请假申请不存在');
  }
  
  if (leaveRequest.employeeId !== employeeId) {
    throw new BadRequestException('无权取消他人的请假申请');
  }
  
  if (leaveRequest.status !== LeaveStatus.PENDING) {
    throw new ConflictException('该请假申请已处理，无法取消');
  }
  
  await leaveRequest.update({
    status: LeaveStatus.CANCELLED,
  });
  
  return leaveRequest;
};

export const createMakeupCardRequest = async (
  employeeId: number,
  data: {
    attendanceDate: Date;
    type: 'clock_in' | 'clock_out';
    makeupTime: Date;
    reason: string;
  }
) => {
  const attendanceDate = moment(data.attendanceDate);
  const now = moment();
  
  if (attendanceDate.isAfter(now)) {
    throw new BadRequestException('补卡日期不能是未来日期');
  }
  
  const existingMakeupCard = await MakeupCard.findOne({
    where: {
      employeeId,
      attendanceDate: data.attendanceDate,
      type: data.type,
      status: { [Op.ne]: MakeupCardStatus.REJECTED },
    },
  });
  
  if (existingMakeupCard) {
    throw new ConflictException('该日期此类型补卡申请已存在');
  }
  
  const makeupCard = await MakeupCard.create({
    employeeId,
    ...data,
    status: MakeupCardStatus.PENDING,
  });
  
  return makeupCard;
};

export const getMakeupCardRequests = async (params: {
  employeeId?: number;
  status?: MakeupCardStatus;
  page?: number;
  pageSize?: number;
}) => {
  const { employeeId, status, page = 1, pageSize = 10 } = params;
  
  const where: any = {};
  
  if (employeeId) {
    where.employeeId = employeeId;
  }
  
  if (status) {
    where.status = status;
  }
  
  const { count, rows } = await MakeupCard.findAndCountAll({
    where,
    include: [
      {
        model: Employee,
        as: 'employee',
        attributes: ['id', 'name', 'employeeNo'],
      },
    ],
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

export const getMakeupCardRequestById = async (id: number) => {
  const makeupCard = await MakeupCard.findByPk(id, {
    include: [
      {
        model: Employee,
        as: 'employee',
        attributes: ['id', 'name', 'employeeNo'],
      },
    ],
  });
  
  if (!makeupCard) {
    throw new NotFoundException('补卡申请不存在');
  }
  
  return makeupCard;
};

export const approveMakeupCardRequest = async (
  id: number,
  approverId: number,
  approved: boolean,
  approvalRemark?: string
) => {
  const transaction = await sequelize.transaction();
  
  try {
    const makeupCard = await MakeupCard.findByPk(id, { transaction });
    
    if (!makeupCard) {
      throw new NotFoundException('补卡申请不存在');
    }
    
    if (makeupCard.status !== MakeupCardStatus.PENDING) {
      throw new ConflictException('该补卡申请已处理');
    }
    
    await makeupCard.update({
      status: approved ? MakeupCardStatus.APPROVED : MakeupCardStatus.REJECTED,
      approverId,
      approvalRemark,
      approvalTime: new Date(),
    }, { transaction });
    
    if (approved) {
      const existingAttendance = await Attendance.findOne({
        where: {
          employeeId: makeupCard.employeeId,
          date: makeupCard.attendanceDate,
          type: makeupCard.type,
        },
        transaction,
      });
      
      if (existingAttendance) {
        await existingAttendance.update({
          time: makeupCard.makeupTime,
          status: AttendanceStatus.NORMAL,
          remark: `补卡审批通过，原打卡记录已更新，补卡申请ID: ${id}`,
        }, { transaction });
      } else {
        await Attendance.create({
          employeeId: makeupCard.employeeId,
          date: makeupCard.attendanceDate,
          type: makeupCard.type,
          time: makeupCard.makeupTime,
          status: AttendanceStatus.NORMAL,
          remark: `补卡审批通过，补卡申请ID: ${id}`,
        }, { transaction });
      }
    }
    
    await transaction.commit();
    
    return makeupCard;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};
