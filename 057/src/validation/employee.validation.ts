import Joi from 'joi';
import { EmployeeStatus } from '../models/Employee';

export const createEmployeeSchema = Joi.object({
  employeeNo: Joi.string().min(1).max(50).required().messages({
    'string.empty': '员工编号不能为空',
    'string.min': '员工编号长度不能少于1位',
    'string.max': '员工编号长度不能超过50位',
    'any.required': '员工编号是必填项',
  }),
  name: Joi.string().min(1).max(50).required().messages({
    'string.empty': '员工姓名不能为空',
    'string.min': '员工姓名长度不能少于1位',
    'string.max': '员工姓名长度不能超过50位',
    'any.required': '员工姓名是必填项',
  }),
  gender: Joi.string().valid('male', 'female').required().messages({
    'any.only': '性别必须是 male 或 female',
    'any.required': '性别是必填项',
  }),
  birthDate: Joi.date().iso().optional().allow(null).messages({
    'date.format': '出生日期格式不正确',
  }),
  idCardNo: Joi.string().pattern(/^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/).optional().allow(null).messages({
    'string.pattern.base': '身份证号格式不正确',
  }),
  phone: Joi.string().pattern(/^1[3-9]\d{9}$/).required().messages({
    'string.empty': '手机号不能为空',
    'string.pattern.base': '手机号格式不正确',
    'any.required': '手机号是必填项',
  }),
  email: Joi.string().email().max(100).optional().allow(null, '').messages({
    'string.email': '邮箱格式不正确',
    'string.max': '邮箱长度不能超过100位',
  }),
  address: Joi.string().max(255).optional().allow(null, '').messages({
    'string.max': '地址长度不能超过255位',
  }),
  departmentId: Joi.number().integer().positive().required().messages({
    'number.base': '部门ID必须是数字',
    'number.integer': '部门ID必须是整数',
    'number.positive': '部门ID必须是正整数',
    'any.required': '部门是必填项',
  }),
  position: Joi.string().min(1).max(100).required().messages({
    'string.empty': '职位不能为空',
    'string.min': '职位长度不能少于1位',
    'string.max': '职位长度不能超过100位',
    'any.required': '职位是必填项',
  }),
  baseSalary: Joi.number().precision(2).min(0).default(0).messages({
    'number.base': '基本工资必须是数字',
    'number.min': '基本工资不能小于0',
  }),
  hireDate: Joi.date().iso().required().messages({
    'date.format': '入职日期格式不正确',
    'any.required': '入职日期是必填项',
  }),
  confirmationDate: Joi.date().iso().optional().allow(null).messages({
    'date.format': '转正日期格式不正确',
  }),
  resignationDate: Joi.date().iso().optional().allow(null).messages({
    'date.format': '离职日期格式不正确',
  }),
  status: Joi.string().valid(...Object.values(EmployeeStatus)).default(EmployeeStatus.PROBATION).messages({
    'any.only': '状态值不正确',
  }),
  remark: Joi.string().max(500).optional().allow(null, '').messages({
    'string.max': '备注长度不能超过500位',
  }),
});

export const updateEmployeeSchema = Joi.object({
  employeeNo: Joi.string().min(1).max(50).optional().messages({
    'string.min': '员工编号长度不能少于1位',
    'string.max': '员工编号长度不能超过50位',
  }),
  name: Joi.string().min(1).max(50).optional().messages({
    'string.min': '员工姓名长度不能少于1位',
    'string.max': '员工姓名长度不能超过50位',
  }),
  gender: Joi.string().valid('male', 'female').optional().messages({
    'any.only': '性别必须是 male 或 female',
  }),
  birthDate: Joi.date().iso().optional().allow(null).messages({
    'date.format': '出生日期格式不正确',
  }),
  idCardNo: Joi.string().pattern(/^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/).optional().allow(null).messages({
    'string.pattern.base': '身份证号格式不正确',
  }),
  phone: Joi.string().pattern(/^1[3-9]\d{9}$/).optional().messages({
    'string.pattern.base': '手机号格式不正确',
  }),
  email: Joi.string().email().max(100).optional().allow(null, '').messages({
    'string.email': '邮箱格式不正确',
    'string.max': '邮箱长度不能超过100位',
  }),
  address: Joi.string().max(255).optional().allow(null, '').messages({
    'string.max': '地址长度不能超过255位',
  }),
  departmentId: Joi.number().integer().positive().optional().messages({
    'number.base': '部门ID必须是数字',
    'number.integer': '部门ID必须是整数',
    'number.positive': '部门ID必须是正整数',
  }),
  position: Joi.string().min(1).max(100).optional().messages({
    'string.min': '职位长度不能少于1位',
    'string.max': '职位长度不能超过100位',
  }),
  baseSalary: Joi.number().precision(2).min(0).optional().messages({
    'number.base': '基本工资必须是数字',
    'number.min': '基本工资不能小于0',
  }),
  hireDate: Joi.date().iso().optional().messages({
    'date.format': '入职日期格式不正确',
  }),
  confirmationDate: Joi.date().iso().optional().allow(null).messages({
    'date.format': '转正日期格式不正确',
  }),
  resignationDate: Joi.date().iso().optional().allow(null).messages({
    'date.format': '离职日期格式不正确',
  }),
  status: Joi.string().valid(...Object.values(EmployeeStatus)).optional().messages({
    'any.only': '状态值不正确',
  }),
  remark: Joi.string().max(500).optional().allow(null, '').messages({
    'string.max': '备注长度不能超过500位',
  }),
});

export const confirmEmployeeSchema = Joi.object({
  confirmationDate: Joi.date().iso().optional().messages({
    'date.format': '转正日期格式不正确',
  }),
});

export const resignEmployeeSchema = Joi.object({
  resignationDate: Joi.date().iso().required().messages({
    'date.format': '离职日期格式不正确',
    'any.required': '离职日期是必填项',
  }),
  reason: Joi.string().max(500).optional().allow(null, '').messages({
    'string.max': '离职原因长度不能超过500位',
  }),
});
