import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { Op, Transaction } from 'sequelize';
import Appointment from '../models/Appointment';
import Patient from '../models/Patient';
import Staff from '../models/Staff';
import Schedule from '../models/Schedule';
import TreatmentRecord from '../models/TreatmentRecord';
import sequelize from '../database';
import { AppointmentStatus, StaffStatus, UserRole } from '../types';
import { success, paginatedSuccess, ApiError } from '../utils/response';
import logger from '../utils/logger';

const generateAppointmentNo = () => {
  const date = new Date();
  const timestamp = date.getTime().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `APT${timestamp}${random}`;
};

export const createAppointmentSchema = Joi.object({
  patientId: Joi.number().required().messages({
    'any.required': '患者ID不能为空',
    'number.base': '患者ID必须是数字',
  }),
  doctorId: Joi.number().required().messages({
    'any.required': '医生ID不能为空',
    'number.base': '医生ID必须是数字',
  }),
  nurseId: Joi.number().allow(null),
  appointmentDate: Joi.date().required().messages({
    'any.required': '预约日期不能为空',
    'date.base': '预约日期格式不正确',
  }),
  timeSlot: Joi.string().allow(null, ''),
  chiefComplaint: Joi.string().max(500).allow(null, '').messages({
    'string.max': '主诉内容不能超过500字',
  }),
  queueNumber: Joi.number().allow(null),
  remark: Joi.string().max(1000).allow(null, '').messages({
    'string.max': '备注不能超过1000字',
  }),
});

export const updateAppointmentSchema = Joi.object({
  doctorId: Joi.number(),
  nurseId: Joi.number().allow(null),
  appointmentDate: Joi.date(),
  timeSlot: Joi.string().allow(null, ''),
  chiefComplaint: Joi.string().max(500).allow(null, ''),
  queueNumber: Joi.number().allow(null),
  status: Joi.string().valid(...Object.values(AppointmentStatus)),
  cancelReason: Joi.string().max(500).allow(null, ''),
  remark: Joi.string().max(1000).allow(null, ''),
});

const validateDoctorSchedule = async (doctorId: number, appointmentDate: Date, timeSlot?: string, excludeId?: number) => {
  const schedule = await Schedule.findOne({
    where: {
      staffId: doctorId,
      date: appointmentDate,
    },
  });

  if (!schedule) {
    throw new ApiError('该医生在预约日期暂无排班，请选择其他日期', 400);
  }

  if (schedule.shiftType === 'off') {
    throw new ApiError('该医生在预约日期休息，请选择其他日期', 400);
  }

  if (timeSlot) {
    const overlappingAppointments = await Appointment.count({
      where: {
        doctorId,
        appointmentDate,
        timeSlot,
        status: {
          [Op.in]: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED, AppointmentStatus.CHECKED_IN, AppointmentStatus.IN_PROGRESS],
        },
        ...(excludeId ? { id: { [Op.ne]: excludeId } } : {}),
      },
    });

    const maxPatients = schedule.maxPatients || 10;
    if (overlappingAppointments >= maxPatients) {
      throw new ApiError('该时段预约已满，请选择其他时段', 400);
    }
  }

  return schedule;
};

export const createAppointment = async (req: Request, res: Response, next: NextFunction) => {
  const t: Transaction = await sequelize.transaction();
  
  try {
    const data = req.body;

    const patient = await Patient.findByPk(data.patientId, { transaction: t });
    if (!patient) {
      throw new ApiError('患者不存在', 400);
    }

    const doctor = await Staff.findByPk(data.doctorId, { transaction: t });
    if (!doctor) {
      throw new ApiError('医生不存在', 400);
    }

    if (doctor.status !== StaffStatus.ON_DUTY) {
      throw new ApiError('该医生目前不在岗，无法预约', 400);
    }

    if (data.nurseId) {
      const nurse = await Staff.findByPk(data.nurseId, { transaction: t });
      if (!nurse) {
        throw new ApiError('护士不存在', 400);
      }
      if (nurse.status !== StaffStatus.ON_DUTY) {
        throw new ApiError('该护士目前不在岗', 400);
      }
    }

    await validateDoctorSchedule(data.doctorId, data.appointmentDate, data.timeSlot);

    const existingAppointment = await Appointment.findOne({
      where: {
        patientId: data.patientId,
        appointmentDate: data.appointmentDate,
        status: {
          [Op.in]: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED, AppointmentStatus.CHECKED_IN, AppointmentStatus.IN_PROGRESS],
        },
      },
      transaction: t,
    });

    if (existingAppointment) {
      throw new ApiError('该患者在同一日期已有有效预约', 400);
    }

    const appointment = await Appointment.create({
      ...data,
      appointmentNo: generateAppointmentNo(),
      status: AppointmentStatus.PENDING,
      createdBy: req.user.userId,
    }, { transaction: t });

    await t.commit();

    logger.info(`创建预约成功: 预约号=${appointment.appointmentNo}, 患者ID=${data.patientId}, 医生ID=${data.doctorId}`);
    success(res, appointment, '预约成功');
  } catch (error) {
    await t.rollback();
    logger.error('创建预约失败:', error);
    next(error);
  }
};

export const updateAppointment = async (req: Request, res: Response, next: NextFunction) => {
  const t: Transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const data = req.body;

    const appointment = await Appointment.findByPk(id, { transaction: t });
    if (!appointment) {
      throw new ApiError('预约不存在', 404);
    }

    if ([AppointmentStatus.COMPLETED, AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW].includes(appointment.status)) {
      throw new ApiError('该预约已完成或已取消，无法修改', 400);
    }

    if (data.doctorId) {
      const doctor = await Staff.findByPk(data.doctorId, { transaction: t });
      if (!doctor) {
        throw new ApiError('医生不存在', 400);
      }
      if (doctor.status !== StaffStatus.ON_DUTY) {
        throw new ApiError('该医生目前不在岗', 400);
      }
    }

    if (data.doctorId || data.appointmentDate || data.timeSlot) {
      const doctorId = data.doctorId || appointment.doctorId;
      const appointmentDate = data.appointmentDate || appointment.appointmentDate;
      const timeSlot = data.timeSlot !== undefined ? data.timeSlot : appointment.timeSlot;
      await validateDoctorSchedule(doctorId, appointmentDate, timeSlot, Number(id));
    }

    await appointment.update(data, { transaction: t });
    await t.commit();

    logger.info(`更新预约成功: 预约ID=${id}, 操作人ID=${req.user.userId}`);
    success(res, appointment, '更新成功');
  } catch (error) {
    await t.rollback();
    logger.error('更新预约失败:', error);
    next(error);
  }
};

export const updateAppointmentStatus = async (req: Request, res: Response, next: NextFunction) => {
  const t: Transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { status, cancelReason } = req.body;

    const appointment = await Appointment.findByPk(id, { transaction: t });
    if (!appointment) {
      throw new ApiError('预约不存在', 404);
    }

    const validTransitions: Record<AppointmentStatus, AppointmentStatus[]> = {
      [AppointmentStatus.PENDING]: [AppointmentStatus.CONFIRMED, AppointmentStatus.CANCELLED],
      [AppointmentStatus.CONFIRMED]: [AppointmentStatus.CHECKED_IN, AppointmentStatus.CANCELLED],
      [AppointmentStatus.CHECKED_IN]: [AppointmentStatus.IN_PROGRESS, AppointmentStatus.CANCELLED],
      [AppointmentStatus.IN_PROGRESS]: [AppointmentStatus.COMPLETED],
      [AppointmentStatus.COMPLETED]: [],
      [AppointmentStatus.CANCELLED]: [],
      [AppointmentStatus.NO_SHOW]: [],
    };

    if (!validTransitions[appointment.status].includes(status as AppointmentStatus)) {
      throw new ApiError(`无法从${appointment.status}状态变更为${status}`, 400);
    }

    const updateData: any = { status };
    
    if (status === AppointmentStatus.CHECKED_IN) {
      updateData.checkInTime = new Date();
    } else if (status === AppointmentStatus.IN_PROGRESS) {
      updateData.startTime = new Date();
    } else if (status === AppointmentStatus.COMPLETED) {
      updateData.endTime = new Date();
    } else if (status === AppointmentStatus.CANCELLED) {
      if (!cancelReason) {
        throw new ApiError('取消预约必须填写取消原因', 400);
      }
      updateData.cancelReason = cancelReason;
    }

    await appointment.update(updateData, { transaction: t });
    await t.commit();

    logger.info(`更新预约状态成功: 预约ID=${id}, 新状态=${status}, 操作人ID=${req.user.userId}`);
    success(res, appointment, '状态更新成功');
  } catch (error) {
    await t.rollback();
    logger.error('更新预约状态失败:', error);
    next(error);
  }
};

export const deleteAppointment = async (req: Request, res: Response, next: NextFunction) => {
  const t: Transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;

    const appointment = await Appointment.findByPk(id, { transaction: t });
    if (!appointment) {
      throw new ApiError('预约不存在', 404);
    }

    if ([AppointmentStatus.CHECKED_IN, AppointmentStatus.IN_PROGRESS, AppointmentStatus.COMPLETED].includes(appointment.status)) {
      throw new ApiError('该预约已签到或已完成，无法删除，请联系管理员', 400);
    }

    const hasTreatmentRecord = await TreatmentRecord.count({
      where: { appointmentId: id },
      transaction: t,
    });

    if (hasTreatmentRecord > 0) {
      throw new ApiError('该预约已关联诊疗记录，无法删除', 400);
    }

    await appointment.destroy({ transaction: t });
    await t.commit();

    logger.info(`删除预约成功: 预约ID=${id}, 操作人ID=${req.user.userId}`);
    success(res, null, '删除成功');
  } catch (error) {
    await t.rollback();
    logger.error('删除预约失败:', error);
    next(error);
  }
};

export const getAppointment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findByPk(id, {
      include: [
        { model: Patient, as: 'patient' },
        { model: Staff, as: 'doctor' },
        { model: Staff, as: 'nurse' },
      ],
    });

    if (!appointment) {
      throw new ApiError('预约不存在', 404);
    }

    success(res, appointment);
  } catch (error) {
    next(error);
  }
};

export const getAppointmentList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, pageSize = 10, keyword, status, doctorId, patientId, date } = req.query;
    const userRole = req.user.role;
    const userId = req.user.userId;

    const where: any = {};
    
    if (userRole === UserRole.DOCTOR) {
      where.doctorId = userId;
    } else if (userRole !== UserRole.ADMIN && doctorId) {
      where.doctorId = doctorId;
    } else if (userRole === UserRole.ADMIN && doctorId) {
      where.doctorId = doctorId;
    }

    if (status) {
      where.status = status;
    }
    if (patientId) {
      where.patientId = patientId;
    }
    if (date) {
      where.appointmentDate = date;
    }

    const patientWhere: any = {};
    if (keyword) {
      patientWhere.name = { [Op.like]: `%${keyword}%` };
    }

    const { count, rows } = await Appointment.findAndCountAll({
      where,
      include: [
        { model: Patient, as: 'patient', where: Object.keys(patientWhere).length > 0 ? patientWhere : undefined },
        { model: Staff, as: 'doctor' },
        { model: Staff, as: 'nurse' },
      ],
      order: [['appointmentDate', 'DESC'], ['queueNumber', 'ASC']],
      offset: (Number(page) - 1) * Number(pageSize),
      limit: Number(pageSize),
    });

    paginatedSuccess(res, rows, count, Number(page), Number(pageSize));
  } catch (error) {
    next(error);
  }
};

export const getTodayQueue = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { doctorId } = req.query;
    const today = new Date().toISOString().split('T')[0];

    const where: any = {
      appointmentDate: today,
      status: {
        [Op.in]: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED, AppointmentStatus.CHECKED_IN, AppointmentStatus.IN_PROGRESS],
      },
    };

    if (doctorId) {
      where.doctorId = doctorId;
    }

    const queue = await Appointment.findAll({
      where,
      include: [
        { model: Patient, as: 'patient' },
        { model: Staff, as: 'doctor' },
      ],
      order: [['queueNumber', 'ASC']],
    });

    success(res, queue);
  } catch (error) {
    next(error);
  }
};
