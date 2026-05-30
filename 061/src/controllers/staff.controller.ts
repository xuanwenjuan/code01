import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { Op } from 'sequelize';
import Staff from '../models/Staff';
import { StaffStatus } from '../types';
import { success, paginatedSuccess, ApiError } from '../utils/response';

export const createStaffSchema = Joi.object({
  name: Joi.string().required().messages({
    'any.required': '姓名不能为空',
  }),
  code: Joi.string().required().messages({
    'any.required': '员工编号不能为空',
  }),
  gender: Joi.string().valid('male', 'female').required().messages({
    'any.required': '性别不能为空',
  }),
  phone: Joi.string().required().messages({
    'any.required': '手机号不能为空',
  }),
  idCard: Joi.string().allow(null, ''),
  position: Joi.string().required().messages({
    'any.required': '职位不能为空',
  }),
  qualification: Joi.string().allow(null, ''),
  specialty: Joi.string().allow(null, ''),
  avatar: Joi.string().allow(null, ''),
  joinDate: Joi.date().required().messages({
    'any.required': '入职日期不能为空',
  }),
  remark: Joi.string().allow(null, ''),
});

export const updateStaffSchema = Joi.object({
  name: Joi.string(),
  code: Joi.string(),
  gender: Joi.string().valid('male', 'female'),
  phone: Joi.string(),
  idCard: Joi.string().allow(null, ''),
  position: Joi.string(),
  qualification: Joi.string().allow(null, ''),
  specialty: Joi.string().allow(null, ''),
  avatar: Joi.string().allow(null, ''),
  status: Joi.string().valid(...Object.values(StaffStatus)),
  joinDate: Joi.date(),
  leaveDate: Joi.date().allow(null),
  remark: Joi.string().allow(null, ''),
});

export const createStaff = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body;

    const existing = await Staff.findOne({ where: { code: data.code } });
    if (existing) {
      throw new ApiError('员工编号已存在', 400);
    }

    const staff = await Staff.create({
      ...data,
      status: StaffStatus.ON_DUTY,
    });

    success(res, staff, '创建成功');
  } catch (error) {
    next(error);
  }
};

export const updateStaff = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const staff = await Staff.findByPk(id);
    if (!staff) {
      throw new ApiError('员工不存在', 404);
    }

    if (data.code && data.code !== staff.code) {
      const existing = await Staff.findOne({ where: { code: data.code } });
      if (existing) {
        throw new ApiError('员工编号已存在', 400);
      }
    }

    await staff.update(data);
    success(res, staff, '更新成功');
  } catch (error) {
    next(error);
  }
};

export const deleteStaff = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const staff = await Staff.findByPk(id);
    if (!staff) {
      throw new ApiError('员工不存在', 404);
    }

    await staff.destroy();
    success(res, null, '删除成功');
  } catch (error) {
    next(error);
  }
};

export const getStaff = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const staff = await Staff.findByPk(id);
    if (!staff) {
      throw new ApiError('员工不存在', 404);
    }

    success(res, staff);
  } catch (error) {
    next(error);
  }
};

export const getStaffList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, pageSize = 10, keyword, status, position } = req.query;

    const where: any = {};
    if (keyword) {
      where[Op.or] = [
        { name: { [Op.like]: `%${keyword}%` } },
        { code: { [Op.like]: `%${keyword}%` } },
        { phone: { [Op.like]: `%${keyword}%` } },
      ];
    }
    if (status) {
      where.status = status;
    }
    if (position) {
      where.position = position;
    }

    const { count, rows } = await Staff.findAndCountAll({
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

export const getDoctorList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doctors = await Staff.findAll({
      where: {
        status: StaffStatus.ON_DUTY,
        position: { [Op.like]: '%医生%' },
      },
      attributes: ['id', 'name', 'code', 'specialty', 'avatar'],
      order: [['name', 'ASC']],
    });

    success(res, doctors);
  } catch (error) {
    next(error);
  }
};
