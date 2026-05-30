import Joi from 'joi';

export const createDepartmentSchema = Joi.object({
  name: Joi.string().min(1).max(100).required().messages({
    'string.empty': '部门名称不能为空',
    'string.min': '部门名称长度不能少于1位',
    'string.max': '部门名称长度不能超过100位',
    'any.required': '部门名称是必填项',
  }),
  code: Joi.string().min(1).max(50).required().messages({
    'string.empty': '部门编码不能为空',
    'string.min': '部门编码长度不能少于1位',
    'string.max': '部门编码长度不能超过50位',
    'any.required': '部门编码是必填项',
  }),
  parentId: Joi.number().integer().positive().allow(null).optional().messages({
    'number.base': '父部门ID必须是数字',
    'number.integer': '父部门ID必须是整数',
    'number.positive': '父部门ID必须是正整数',
  }),
  level: Joi.number().integer().min(1).default(1).messages({
    'number.base': '层级必须是数字',
    'number.integer': '层级必须是整数',
    'number.min': '层级必须大于等于1',
  }),
  sortOrder: Joi.number().integer().default(0).messages({
    'number.base': '排序必须是数字',
    'number.integer': '排序必须是整数',
  }),
  managerId: Joi.number().integer().positive().allow(null).optional().messages({
    'number.base': '负责人ID必须是数字',
    'number.integer': '负责人ID必须是整数',
    'number.positive': '负责人ID必须是正整数',
  }),
  description: Joi.string().max(500).allow('').optional().messages({
    'string.max': '描述长度不能超过500位',
  }),
});

export const updateDepartmentSchema = Joi.object({
  name: Joi.string().min(1).max(100).optional().messages({
    'string.min': '部门名称长度不能少于1位',
    'string.max': '部门名称长度不能超过100位',
  }),
  code: Joi.string().min(1).max(50).optional().messages({
    'string.min': '部门编码长度不能少于1位',
    'string.max': '部门编码长度不能超过50位',
  }),
  parentId: Joi.number().integer().positive().allow(null).optional().messages({
    'number.base': '父部门ID必须是数字',
    'number.integer': '父部门ID必须是整数',
    'number.positive': '父部门ID必须是正整数',
  }),
  level: Joi.number().integer().min(1).optional().messages({
    'number.base': '层级必须是数字',
    'number.integer': '层级必须是整数',
    'number.min': '层级必须大于等于1',
  }),
  sortOrder: Joi.number().integer().optional().messages({
    'number.base': '排序必须是数字',
    'number.integer': '排序必须是整数',
  }),
  managerId: Joi.number().integer().positive().allow(null).optional().messages({
    'number.base': '负责人ID必须是数字',
    'number.integer': '负责人ID必须是整数',
    'number.positive': '负责人ID必须是正整数',
  }),
  description: Joi.string().max(500).allow('').optional().messages({
    'string.max': '描述长度不能超过500位',
  }),
  isActive: Joi.boolean().optional().messages({
    'boolean.base': '状态必须是布尔值',
  }),
});
