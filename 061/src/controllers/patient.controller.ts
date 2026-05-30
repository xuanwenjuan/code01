import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { Op } from 'sequelize';
import Patient from '../models/Patient';
import { success, paginatedSuccess, ApiError } from '../utils/response';

export const createPatientSchema = Joi.object({
  name: Joi.string().required().messages({
    'any.required': '姓名不能为空',
  }),
  gender: Joi.string().valid('male', 'female').required().messages({
    'any.required': '性别不能为空',
  }),
  birthDate: Joi.date().allow(null),
  phone: Joi.string().required().messages({
    'any.required': '手机号不能为空',
  }),
  idCard: Joi.string().allow(null, ''),
  address: Joi.string().allow(null, ''),
  emergencyContact: Joi.string().allow(null, ''),
  emergencyPhone: Joi.string().allow(null, ''),
  medicalHistory: Joi.string().allow(null, ''),
  allergyHistory: Joi.string().allow(null, ''),
  remark: Joi.string().allow(null, ''),
});

export const updatePatientSchema = Joi.object({
  name: Joi.string(),
  gender: Joi.string().valid('male', 'female'),
  birthDate: Joi.date().allow(null),
  phone: Joi.string(),
  idCard: Joi.string().allow(null, ''),
  address: Joi.string().allow(null, ''),
  emergencyContact: Joi.string().allow(null, ''),
  emergencyPhone: Joi.string().allow(null, ''),
  medicalHistory: Joi.string().allow(null, ''),
  allergyHistory: Joi.string().allow(null, ''),
  remark: Joi.string().allow(null, ''),
});

export const createPatient = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body;
    const patient = await Patient.create(data);
    success(res, patient, '创建成功');
  } catch (error) {
    next(error);
  }
};

export const updatePatient = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const patient = await Patient.findByPk(id);
    if (!patient) {
      throw new ApiError('患者不存在', 404);
    }

    await patient.update(data);
    success(res, patient, '更新成功');
  } catch (error) {
    next(error);
  }
};

export const deletePatient = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const patient = await Patient.findByPk(id);
    if (!patient) {
      throw new ApiError('患者不存在', 404);
    }

    await patient.destroy();
    success(res, null, '删除成功');
  } catch (error) {
    next(error);
  }
};

export const getPatient = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const patient = await Patient.findByPk(id);
    if (!patient) {
      throw new ApiError('患者不存在', 404);
    }

    success(res, patient);
  } catch (error) {
    next(error);
  }
};

export const getPatientList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, pageSize = 10, keyword, phone } = req.query;

    const where: any = {};
    if (keyword) {
      where[Op.or] = [
        { name: { [Op.like]: `%${keyword}%` } },
        { phone: { [Op.like]: `%${keyword}%` } },
      ];
    }
    if (phone) {
      where.phone = { [Op.like]: `%${phone}%` };
    }

    const { count, rows } = await Patient.findAndCountAll({
      where,
      order: [['id', 'DESC']],
      offset: (Number(page) - 1) * Number(pageSize),
      limit: Number(pageSize),
    });

    paginatedSuccess(res, rows, count, Number(page), Number(pageSize));
  } catch (error) {
    next(error);
  }
};
