import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { BadRequestError } from '../utils/errors';

export const validate = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((e) => e.msg).join('; ');
    throw new BadRequestError(errorMessages);
  }
  next();
};

export const paginationValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('页码必须大于0'),
  query('pageSize').optional().isInt({ min: 1, max: 100 }).withMessage('每页数量必须在1-100之间'),
];

export const idValidation = [
  param('id').isInt({ min: 1 }).withMessage('ID必须为正整数'),
];

export const categoryValidators = {
  create: [
    body('name').notEmpty().withMessage('类目名称不能为空').isLength({ max: 100 }).withMessage('类目名称最多100个字符'),
    body('code').notEmpty().withMessage('类目编码不能为空').isLength({ max: 50 }).withMessage('类目编码最多50个字符'),
    body('parentId').optional().isInt({ min: 1 }).withMessage('父类目ID必须为正整数'),
    body('sortOrder').optional().isInt({ min: 0 }).withMessage('排序值必须为非负整数'),
    body('description').optional().isLength({ max: 500 }).withMessage('描述最多500个字符'),
  ],
  update: [
    ...idValidation,
    body('name').optional().isLength({ max: 100 }).withMessage('类目名称最多100个字符'),
    body('code').optional().isLength({ max: 50 }).withMessage('类目编码最多50个字符'),
    body('parentId').optional().isInt({ min: 1 }).withMessage('父类目ID必须为正整数'),
    body('sortOrder').optional().isInt({ min: 0 }).withMessage('排序值必须为非负整数'),
    body('isActive').optional().isBoolean().withMessage('状态必须为布尔值'),
  ],
};

export const materialValidators = {
  create: [
    body('name').notEmpty().withMessage('原料名称不能为空').isLength({ max: 100 }).withMessage('原料名称最多100个字符'),
    body('type').notEmpty().withMessage('原料类型不能为空').isIn(['aluminum', 'carbon_fiber', 'plastic_resin', 'alloy']).withMessage('原料类型不正确'),
    body('specification').notEmpty().withMessage('规格不能为空').isLength({ max: 200 }).withMessage('规格最多200个字符'),
    body('quantity').notEmpty().withMessage('数量不能为空').isFloat({ min: 0 }).withMessage('数量必须大于等于0'),
    body('unit').optional().isLength({ max: 20 }).withMessage('单位最多20个字符'),
    body('unitCost').notEmpty().withMessage('单价不能为空').isFloat({ min: 0 }).withMessage('单价必须大于等于0'),
    body('supplier').optional().isLength({ max: 100 }).withMessage('供应商最多100个字符'),
    body('receivedDate').notEmpty().withMessage('入库日期不能为空').isISO8601().withMessage('入库日期格式不正确'),
  ],
  update: [
    ...idValidation,
    body('name').optional().isLength({ max: 100 }).withMessage('原料名称最多100个字符'),
    body('type').optional().isIn(['aluminum', 'carbon_fiber', 'plastic_resin', 'alloy']).withMessage('原料类型不正确'),
    body('specification').optional().isLength({ max: 200 }).withMessage('规格最多200个字符'),
    body('quantity').optional().isFloat({ min: 0 }).withMessage('数量必须大于等于0'),
    body('status').optional().isIn(['available', 'locked', 'used', 'pending_scrap']).withMessage('状态值不正确'),
  ],
  updateStatus: [
    ...idValidation,
    body('status').notEmpty().withMessage('状态不能为空').isIn(['available', 'locked', 'used', 'pending_scrap']).withMessage('状态值不正确'),
  ],
  consume: [
    ...idValidation,
    body('quantity').notEmpty().withMessage('消耗数量不能为空').isFloat({ min: 0.01 }).withMessage('消耗数量必须大于0'),
  ],
  stockIn: [
    ...idValidation,
    body('quantity').notEmpty().withMessage('入库数量不能为空').isFloat({ min: 0.01 }).withMessage('入库数量必须大于0'),
    body('remark').optional().isLength({ max: 500 }).withMessage('备注最多500个字符'),
  ],
  lock: [
    ...idValidation,
    body('orderId').notEmpty().withMessage('订单ID不能为空').isInt({ min: 1 }).withMessage('订单ID必须为正整数'),
    body('quantity').notEmpty().withMessage('锁定数量不能为空').isFloat({ min: 0.01 }).withMessage('锁定数量必须大于0'),
    body('lockType').optional().isIn(['production_schedule', 'order_reservation', 'temporary']).withMessage('锁定类型不正确'),
    body('remarks').optional().isLength({ max: 500 }).withMessage('备注最多500个字符'),
  ],
  filter: [
    query('types').optional().isArray().withMessage('类型必须为数组'),
    query('types.*').optional().isIn(['aluminum', 'carbon_fiber', 'plastic_resin', 'alloy']).withMessage('类型值不正确'),
    query('statuses').optional().isArray().withMessage('状态必须为数组'),
    query('statuses.*').optional().isIn(['available', 'locked', 'used', 'pending_scrap']).withMessage('状态值不正确'),
    query('name').optional().isLength({ max: 100 }).withMessage('名称最多100个字符'),
    query('batchNumber').optional().isLength({ max: 50 }).withMessage('批次号最多50个字符'),
    query('supplier').optional().isLength({ max: 100 }).withMessage('供应商最多100个字符'),
    query('minQuantity').optional().isFloat({ min: 0 }).withMessage('最小数量必须大于等于0'),
    query('maxQuantity').optional().isFloat({ min: 0 }).withMessage('最大数量必须大于等于0'),
    query('startDate').optional().isISO8601().withMessage('开始日期格式不正确'),
    query('endDate').optional().isISO8601().withMessage('结束日期格式不正确'),
  ],
};

export const orderValidators = {
  create: [
    body('customerName').notEmpty().withMessage('客户姓名不能为空').isLength({ max: 100 }).withMessage('客户姓名最多100个字符'),
    body('customerPhone').notEmpty().withMessage('客户电话不能为空').isMobilePhone('zh-CN').withMessage('客户电话格式不正确'),
    body('customerEmail').optional().isEmail().withMessage('邮箱格式不正确'),
    body('categoryId').notEmpty().withMessage('配件类目不能为空').isInt({ min: 1 }).withMessage('配件类目ID必须为正整数'),
    body('materialId').optional().isInt({ min: 1 }).withMessage('原料ID必须为正整数'),
    body('quantity').notEmpty().withMessage('数量不能为空').isInt({ min: 1 }).withMessage('数量必须大于0'),
    body('unitPrice').notEmpty().withMessage('单价不能为空').isFloat({ min: 0 }).withMessage('单价必须大于等于0'),
    body('requirements').optional().isLength({ max: 1000 }).withMessage('加工要求最多1000个字符'),
  ],
  update: [
    ...idValidation,
    body('customerName').optional().isLength({ max: 100 }).withMessage('客户姓名最多100个字符'),
    body('customerPhone').optional().isMobilePhone('zh-CN').withMessage('客户电话格式不正确'),
    body('customerEmail').optional().isEmail().withMessage('邮箱格式不正确'),
    body('quantity').optional().isInt({ min: 1 }).withMessage('数量必须大于0'),
    body('unitPrice').optional().isFloat({ min: 0 }).withMessage('单价必须大于等于0'),
  ],
  updateStatus: [
    ...idValidation,
    body('status').notEmpty().withMessage('状态不能为空').isIn([
      'pending_payment', 'paid', 'designing', 'production_scheduled',
      'cnc_processing', 'quality_checking', 'polishing', 'completed',
      'ready_to_ship', 'shipped', 'delivered', 'cancelled', 'closed'
    ]).withMessage('状态值不正确'),
    body('remark').optional().isLength({ max: 500 }).withMessage('备注最多500个字符'),
  ],
  schedule: [
    ...idValidation,
    body('materialId').notEmpty().withMessage('原料ID不能为空').isInt({ min: 1 }).withMessage('原料ID必须为正整数'),
    body('requiredQuantity').notEmpty().withMessage('所需数量不能为空').isFloat({ min: 0.01 }).withMessage('所需数量必须大于0'),
    body('remarks').optional().isLength({ max: 500 }).withMessage('备注最多500个字符'),
  ],
  complete: [
    ...idValidation,
    body('actualMaterialUsed').notEmpty().withMessage('实际用料不能为空').isFloat({ min: 0 }).withMessage('实际用料必须大于等于0'),
    body('laborHours').notEmpty().withMessage('人工工时不能为空').isFloat({ min: 0 }).withMessage('人工工时必须大于等于0'),
    body('machineHours').notEmpty().withMessage('机器工时不能为空').isFloat({ min: 0 }).withMessage('机器工时必须大于等于0'),
    body('additionalCosts').optional().isFloat({ min: 0 }).withMessage('额外费用必须大于等于0'),
    body('remarks').optional().isLength({ max: 500 }).withMessage('备注最多500个字符'),
  ],
};

export const costReportValidators = {
  generate: [
    body('startDate').notEmpty().withMessage('开始日期不能为空').isISO8601().withMessage('开始日期格式不正确'),
    body('endDate').notEmpty().withMessage('结束日期不能为空').isISO8601().withMessage('结束日期格式不正确'),
    body('categoryId').optional().isInt({ min: 1 }).withMessage('类目ID必须为正整数'),
  ],
  summary: [
    query('startDate').notEmpty().withMessage('开始日期不能为空').isISO8601().withMessage('开始日期格式不正确'),
    query('endDate').notEmpty().withMessage('结束日期不能为空').isISO8601().withMessage('结束日期格式不正确'),
  ],
  categoryAnalysis: [
    query('startDate').notEmpty().withMessage('开始日期不能为空').isISO8601().withMessage('开始日期格式不正确'),
    query('endDate').notEmpty().withMessage('结束日期不能为空').isISO8601().withMessage('结束日期格式不正确'),
  ],
  materialAnalysis: [
    query('startDate').notEmpty().withMessage('开始日期不能为空').isISO8601().withMessage('开始日期格式不正确'),
    query('endDate').notEmpty().withMessage('结束日期不能为空').isISO8601().withMessage('结束日期格式不正确'),
  ],
};

export const authValidators = {
  login: [
    body('username').notEmpty().withMessage('用户名不能为空'),
    body('password').notEmpty().withMessage('密码不能为空'),
  ],
  register: [
    body('username').notEmpty().withMessage('用户名不能为空').isLength({ min: 3, max: 50 }).withMessage('用户名长度为3-50个字符'),
    body('password').notEmpty().withMessage('密码不能为空').isLength({ min: 6 }).withMessage('密码长度不能少于6位'),
    body('email').notEmpty().withMessage('邮箱不能为空').isEmail().withMessage('邮箱格式不正确'),
    body('realName').optional().isLength({ max: 50 }).withMessage('真实姓名最多50个字符'),
    body('role').optional().isIn(['super_admin', 'admin', 'design', 'production', 'warehouse', 'finance']).withMessage('角色值不正确'),
  ],
};

export const operationLogValidators = {
  list: [
    ...paginationValidation,
    query('module').optional().isIn(['category', 'material', 'order', 'cost_report']).withMessage('模块值不正确'),
    query('operationType').optional().isIn(['create', 'update', 'delete', 'status_change', 'lock', 'unlock', 'consume', 'stock_in', 'schedule', 'complete', 'calculate_cost']).withMessage('操作类型不正确'),
    query('operatorId').optional().isInt({ min: 1 }).withMessage('操作人ID必须为正整数'),
    query('recordId').optional().isInt({ min: 1 }).withMessage('记录ID必须为正整数'),
    query('startDate').optional().isISO8601().withMessage('开始日期格式不正确'),
    query('endDate').optional().isISO8601().withMessage('结束日期格式不正确'),
  ],
  recordLogs: [
    param('module').isIn(['category', 'material', 'order', 'cost_report']).withMessage('模块值不正确'),
    param('recordId').isInt({ min: 1 }).withMessage('记录ID必须为正整数'),
    query('limit').optional().isInt({ min: 1, max: 200 }).withMessage('数量必须在1-200之间'),
  ],
};
