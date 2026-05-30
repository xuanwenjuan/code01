import Joi from 'joi';
import { ConditionGrade, CollectionStatus } from '../models/Collection';

export const createCollectionSchema = Joi.object({
  name: Joi.string().min(2).max(200).required().messages({
    'string.base': '藏品名称必须是字符串',
    'string.min': '藏品名称至少2个字符',
    'string.max': '藏品名称最多200个字符',
    'any.required': '藏品名称不能为空'
  }),
  brand: Joi.string().min(1).max(100).required().messages({
    'string.base': '品牌必须是字符串',
    'string.min': '品牌至少1个字符',
    'string.max': '品牌最多100个字符',
    'any.required': '品牌不能为空'
  }),
  productionYear: Joi.string().max(20).optional().messages({
    'string.max': '生产年代最多20个字符'
  }),
  categoryId: Joi.number().integer().positive().required().messages({
    'number.base': '类目ID必须是数字',
    'number.positive': '类目ID必须是正数',
    'any.required': '类目ID不能为空'
  }),
  movementType: Joi.string().min(1).max(100).required().messages({
    'string.base': '机芯类型必须是字符串',
    'string.min': '机芯类型至少1个字符',
    'string.max': '机芯类型最多100个字符',
    'any.required': '机芯类型不能为空'
  }),
  conditionGrade: Joi.string().valid(...Object.values(ConditionGrade)).required().messages({
    'any.only': '品相等级不合法',
    'any.required': '品相等级不能为空'
  }),
  sourceChannel: Joi.string().min(1).max(100).required().messages({
    'string.base': '来源渠道必须是字符串',
    'string.min': '来源渠道至少1个字符',
    'string.max': '来源渠道最多100个字符',
    'any.required': '来源渠道不能为空'
  }),
  description: Joi.string().allow('').optional().messages({
    'string.base': '描述必须是字符串'
  }),
  images: Joi.string().allow('').optional().messages({
    'string.base': '图片必须是字符串'
  }),
  purchasePrice: Joi.number().precision(2).positive().optional().messages({
    'number.base': '收购价格必须是数字',
    'number.positive': '收购价格必须是正数'
  }),
  estimatedPrice: Joi.number().precision(2).positive().optional().messages({
    'number.base': '估价必须是数字',
    'number.positive': '估价必须是正数'
  }),
  lastMaintenanceDate: Joi.date().iso().optional().messages({
    'date.base': '上次保养日期格式不正确',
    'date.iso': '上次保养日期必须是ISO格式'
  }),
  nextMaintenanceDate: Joi.date().iso().optional().messages({
    'date.base': '下次保养日期格式不正确',
    'date.iso': '下次保养日期必须是ISO格式'
  }),
  maintenanceCycleMonths: Joi.number().integer().positive().max(60).default(12).messages({
    'number.base': '保养周期必须是数字',
    'number.positive': '保养周期必须是正数',
    'number.max': '保养周期最多60个月'
  }),
  ownerName: Joi.string().max(50).allow('').optional().messages({
    'string.max': '持有人姓名最多50个字符'
  }),
  ownerPhone: Joi.string().pattern(/^1[3-9]\d{9}$/).allow('').optional().messages({
    'string.pattern.base': '手机号格式不正确'
  }),
  remarks: Joi.string().allow('').optional().messages({
    'string.base': '备注必须是字符串'
  })
});

export const updateCollectionSchema = Joi.object({
  name: Joi.string().min(2).max(200).optional().messages({
    'string.base': '藏品名称必须是字符串',
    'string.min': '藏品名称至少2个字符',
    'string.max': '藏品名称最多200个字符'
  }),
  brand: Joi.string().min(1).max(100).optional().messages({
    'string.base': '品牌必须是字符串',
    'string.min': '品牌至少1个字符',
    'string.max': '品牌最多100个字符'
  }),
  productionYear: Joi.string().max(20).optional().messages({
    'string.max': '生产年代最多20个字符'
  }),
  categoryId: Joi.number().integer().positive().optional().messages({
    'number.base': '类目ID必须是数字',
    'number.positive': '类目ID必须是正数'
  }),
  movementType: Joi.string().min(1).max(100).optional().messages({
    'string.base': '机芯类型必须是字符串',
    'string.min': '机芯类型至少1个字符',
    'string.max': '机芯类型最多100个字符'
  }),
  conditionGrade: Joi.string().valid(...Object.values(ConditionGrade)).optional().messages({
    'any.only': '品相等级不合法'
  }),
  sourceChannel: Joi.string().min(1).max(100).optional().messages({
    'string.base': '来源渠道必须是字符串',
    'string.min': '来源渠道至少1个字符',
    'string.max': '来源渠道最多100个字符'
  }),
  description: Joi.string().allow('').optional().messages({
    'string.base': '描述必须是字符串'
  }),
  images: Joi.string().allow('').optional().messages({
    'string.base': '图片必须是字符串'
  }),
  purchasePrice: Joi.number().precision(2).positive().optional().messages({
    'number.base': '收购价格必须是数字',
    'number.positive': '收购价格必须是正数'
  }),
  estimatedPrice: Joi.number().precision(2).positive().optional().messages({
    'number.base': '估价必须是数字',
    'number.positive': '估价必须是正数'
  }),
  lastMaintenanceDate: Joi.date().iso().optional().messages({
    'date.base': '上次保养日期格式不正确',
    'date.iso': '上次保养日期必须是ISO格式'
  }),
  nextMaintenanceDate: Joi.date().iso().optional().messages({
    'date.base': '下次保养日期格式不正确',
    'date.iso': '下次保养日期必须是ISO格式'
  }),
  maintenanceCycleMonths: Joi.number().integer().positive().max(60).optional().messages({
    'number.base': '保养周期必须是数字',
    'number.positive': '保养周期必须是正数',
    'number.max': '保养周期最多60个月'
  }),
  ownerName: Joi.string().max(50).allow('').optional().messages({
    'string.max': '持有人姓名最多50个字符'
  }),
  ownerPhone: Joi.string().pattern(/^1[3-9]\d{9}$/).allow('').optional().messages({
    'string.pattern.base': '手机号格式不正确'
  }),
  remarks: Joi.string().allow('').optional().messages({
    'string.base': '备注必须是字符串'
  })
});

export const getCollectionListSchema = Joi.object({
  page: Joi.number().integer().positive().optional().messages({
    'number.base': '页码必须是数字',
    'number.positive': '页码必须是正数'
  }),
  pageSize: Joi.number().integer().positive().max(100).optional().messages({
    'number.base': '每页数量必须是数字',
    'number.positive': '每页数量必须是正数',
    'number.max': '每页数量最多100条'
  }),
  collectionNo: Joi.string().optional().messages({
    'string.base': '藏品编号必须是字符串'
  }),
  name: Joi.string().optional().messages({
    'string.base': '藏品名称必须是字符串'
  }),
  categoryId: Joi.number().integer().positive().optional().messages({
    'number.base': '类目ID必须是数字',
    'number.positive': '类目ID必须是正数'
  }),
  status: Joi.string().valid(...Object.values(CollectionStatus)).optional().messages({
    'any.only': '状态不合法'
  }),
  conditionGrade: Joi.string().valid(...Object.values(ConditionGrade)).optional().messages({
    'any.only': '品相等级不合法'
  }),
  brand: Joi.string().optional().messages({
    'string.base': '品牌必须是字符串'
  }),
  productionYear: Joi.string().optional().messages({
    'string.base': '生产年代必须是字符串'
  }),
  sourceChannel: Joi.string().optional().messages({
    'string.base': '来源渠道必须是字符串'
  }),
  startDate: Joi.date().iso().optional().messages({
    'date.base': '开始日期格式不正确',
    'date.iso': '开始日期必须是ISO格式'
  }),
  endDate: Joi.date().iso().optional().messages({
    'date.base': '结束日期格式不正确',
    'date.iso': '结束日期必须是ISO格式'
  })
});

export const collectionIdSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    'number.base': '藏品ID必须是数字',
    'number.positive': '藏品ID必须是正数',
    'any.required': '藏品ID不能为空'
  })
});

export const batchUpdateStatusSchema = Joi.object({
  ids: Joi.array().items(Joi.number().integer().positive()).min(1).max(100).required().messages({
    'array.base': 'ID列表必须是数组',
    'array.min': '至少选择1个藏品',
    'array.max': '最多批量操作100个藏品',
    'any.required': 'ID列表不能为空'
  }),
  status: Joi.string().valid(...Object.values(CollectionStatus)).required().messages({
    'any.only': '状态不合法',
    'any.required': '状态不能为空'
  })
});

export const batchDeleteSchema = Joi.object({
  ids: Joi.array().items(Joi.number().integer().positive()).min(1).max(100).required().messages({
    'array.base': 'ID列表必须是数组',
    'array.min': '至少选择1个藏品',
    'array.max': '最多批量操作100个藏品',
    'any.required': 'ID列表不能为空'
  })
});
