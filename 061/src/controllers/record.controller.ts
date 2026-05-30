import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { Op } from 'sequelize';
import TreatmentRecord from '../models/TreatmentRecord';
import Patient from '../models/Patient';
import Staff from '../models/Staff';
import Appointment from '../models/Appointment';
import { success, paginatedSuccess, ApiError } from '../utils/response';

const generateRecordNo = () => {
  const date = new Date();
  const timestamp = date.getTime().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `REC${timestamp}${random}`;
};

export const createRecordSchema = Joi.object({
  patientId: Joi.number().required().messages({
    'any.required': '患者ID不能为空',
  }),
  appointmentId: Joi.number().allow(null),
  doctorId: Joi.number().required().messages({
    'any.required': '医生ID不能为空',
  }),
  nurseId: Joi.number().allow(null),
  chiefComplaint: Joi.string().allow(null, ''),
  presentIllness: Joi.string().allow(null, ''),
  pastHistory: Joi.string().allow(null, ''),
  examination: Joi.string().allow(null, ''),
  diagnosis: Joi.string().allow(null, ''),
  treatmentPlan: Joi.string().allow(null, ''),
  treatmentNotes: Joi.string().allow(null, ''),
  prescription: Joi.string().allow(null, ''),
  nextVisitDate: Joi.date().allow(null),
  remark: Joi.string().allow(null, ''),
});

export const updateRecordSchema = Joi.object({
  doctorId: Joi.number(),
  nurseId: Joi.number().allow(null),
  chiefComplaint: Joi.string().allow(null, ''),
  presentIllness: Joi.string().allow(null, ''),
  pastHistory: Joi.string().allow(null, ''),
  examination: Joi.string().allow(null, ''),
  diagnosis: Joi.string().allow(null, ''),
  treatmentPlan: Joi.string().allow(null, ''),
  treatmentNotes: Joi.string().allow(null, ''),
  prescription: Joi.string().allow(null, ''),
  nextVisitDate: Joi.date().allow(null),
  remark: Joi.string().allow(null, ''),
});

export const createRecord = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body;

    const patient = await Patient.findByPk(data.patientId);
    if (!patient) {
      throw new ApiError('患者不存在', 400);
    }

    const doctor = await Staff.findByPk(data.doctorId);
    if (!doctor) {
      throw new ApiError('医生不存在', 400);
    }

    const record = await TreatmentRecord.create({
      ...data,
      recordNo: generateRecordNo(),
    });

    success(res, record, '创建成功');
  } catch (error) {
    next(error);
  }
};

export const updateRecord = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const record = await TreatmentRecord.findByPk(id);
    if (!record) {
      throw new ApiError('诊疗记录不存在', 404);
    }

    await record.update(data);
    success(res, record, '更新成功');
  } catch (error) {
    next(error);
  }
};

export const deleteRecord = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const record = await TreatmentRecord.findByPk(id);
    if (!record) {
      throw new ApiError('诊疗记录不存在', 404);
    }

    await record.destroy();
    success(res, null, '删除成功');
  } catch (error) {
    next(error);
  }
};

export const getRecord = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const record = await TreatmentRecord.findByPk(id, {
      include: [
        { model: Patient, as: 'patient' },
        { model: Staff, as: 'doctor' },
        { model: Staff, as: 'nurse' },
        { model: Appointment, as: 'appointment' },
      ],
    });

    if (!record) {
      throw new ApiError('诊疗记录不存在', 404);
    }

    success(res, record);
  } catch (error) {
    next(error);
  }
};

export const getRecordList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, pageSize = 10, keyword, patientId, doctorId, startDate, endDate } = req.query;

    const where: any = {};
    if (patientId) {
      where.patientId = patientId;
    }
    if (doctorId) {
      where.doctorId = doctorId;
    }
    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate as string), new Date(endDate as string)],
      };
    }

    const patientWhere: any = {};
    if (keyword) {
      patientWhere.name = { [Op.like]: `%${keyword}%` };
    }

    const { count, rows } = await TreatmentRecord.findAndCountAll({
      where,
      include: [
        { model: Patient, as: 'patient', where: Object.keys(patientWhere).length > 0 ? patientWhere : undefined },
        { model: Staff, as: 'doctor' },
        { model: Staff, as: 'nurse' },
      ],
      order: [['createdAt', 'DESC']],
      offset: (Number(page) - 1) * Number(pageSize),
      limit: Number(pageSize),
    });

    paginatedSuccess(res, rows, count, Number(page), Number(pageSize));
  } catch (error) {
    next(error);
  }
};

export const getPatientRecords = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { patientId } = req.params;

    const records = await TreatmentRecord.findAll({
      where: { patientId },
      include: [
        { model: Staff, as: 'doctor' },
        { model: Staff, as: 'nurse' },
      ],
      order: [['createdAt', 'DESC']],
    });

    success(res, records);
  } catch (error) {
    next(error);
  }
};
