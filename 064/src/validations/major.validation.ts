import Joi from 'joi';
import { MajorCategoryType } from '../types';

export const createMajorSchema = Joi.object({
  name: Joi.string().required().messages({
    'string.empty': '专业名称不能为空',
    'any.required': '专业名称是必填项'
  }),
  type: Joi.string().valid(...Object.values(MajorCategoryType)).required().messages({
    'any.only': '专业类型不正确',
    'any.required': '专业类型是必填项'
  }),
  parentId: Joi.number().integer().allow(null),
  level: Joi.number().integer().min(1).default(1),
  sort: Joi.number().integer().min(0).default(0),
  hours: Joi.number().integer().min(0).default(0),
  isActive: Joi.boolean().default(true),
  description: Joi.string().allow(null, '')
});

export const updateMajorSchema = Joi.object({
  name: Joi.string(),
  type: Joi.string().valid(...Object.values(MajorCategoryType)),
  parentId: Joi.number().integer().allow(null),
  level: Joi.number().integer().min(1),
  sort: Joi.number().integer().min(0),
  hours: Joi.number().integer().min(0),
  isActive: Joi.boolean(),
  description: Joi.string().allow(null, '')
});
