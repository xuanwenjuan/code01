import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { ApiResponse } from '../utils/response';

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array()[0];
    const message = firstError.msg || '参数校验失败';
    return ApiResponse.badRequest(res, message);
  }
  next();
};

export const validationRules = {
  idParam: [param('id').isInt({ min: 1 }).withMessage('ID必须为正整数')],

  pagination: [
    query('page').optional().isInt({ min: 1 }).withMessage('页码必须为正整数'),
    query('pageSize').optional().isInt({ min: 1, max: 100 }).withMessage('每页条数必须在1-100之间'),
  ],

  productCategory: {
    create: [
      body('name').notEmpty().withMessage('分类名称不能为空').isLength({ max: 100 }).withMessage('分类名称不能超过100个字符'),
      body('type').notEmpty().withMessage('分类类型不能为空').isIn(['ticket', 'package', 'year_card', 'amusement']).withMessage('分类类型无效'),
      body('parentId').optional().isInt({ min: 1 }).withMessage('父分类ID必须为正整数'),
      body('sortOrder').optional().isInt({ min: 0 }).withMessage('排序权重必须为非负整数'),
      body('enabled').optional().isBoolean().withMessage('启用状态必须为布尔值'),
      body('remark').optional().isLength({ max: 500 }).withMessage('备注不能超过500个字符'),
    ],
    update: [
      param('id').isInt({ min: 1 }).withMessage('ID必须为正整数'),
      body('name').optional().isLength({ max: 100 }).withMessage('分类名称不能超过100个字符'),
      body('type').optional().isIn(['ticket', 'package', 'year_card', 'amusement']).withMessage('分类类型无效'),
      body('parentId').optional().isInt({ min: 1 }).withMessage('父分类ID必须为正整数'),
      body('sortOrder').optional().isInt({ min: 0 }).withMessage('排序权重必须为非负整数'),
      body('enabled').optional().isBoolean().withMessage('启用状态必须为布尔值'),
      body('remark').optional().isLength({ max: 500 }).withMessage('备注不能超过500个字符'),
    ],
    updateSortOrder: [
      body('ids').isArray({ min: 1 }).withMessage('分类ID列表不能为空'),
      body('ids.*').isInt({ min: 1 }).withMessage('分类ID必须为正整数'),
    ],
  },

  distributor: {
    create: [
      body('name').notEmpty().withMessage('分销商名称不能为空').isLength({ max: 100 }).withMessage('分销商名称不能超过100个字符'),
      body('type').notEmpty().withMessage('分销商类型不能为空').isIn(['travel_agency', 'online_agent', 'individual']).withMessage('分销商类型无效'),
      body('contactPerson').optional().isLength({ max: 50 }).withMessage('联系人名称不能超过50个字符'),
      body('contactPhone').optional().isMobilePhone('zh-CN').withMessage('联系电话格式不正确'),
      body('address').optional().isLength({ max: 200 }).withMessage('地址不能超过200个字符'),
      body('commissionRate').isFloat({ min: 0, max: 100 }).withMessage('佣金比例必须在0-100之间'),
      body('creditLimit').optional().isFloat({ min: 0 }).withMessage('授信额度必须为非负数'),
      body('status').optional().isIn(['active', 'inactive', 'terminated']).withMessage('状态值无效'),
      body('effectiveDate').optional().isISO8601().withMessage('生效日期格式不正确'),
      body('terminationDate').optional().isISO8601().withMessage('终止日期格式不正确'),
      body('remark').optional().isLength({ max: 500 }).withMessage('备注不能超过500个字符'),
    ],
    update: [
      param('id').isInt({ min: 1 }).withMessage('ID必须为正整数'),
      body('name').optional().isLength({ max: 100 }).withMessage('分销商名称不能超过100个字符'),
      body('type').optional().isIn(['travel_agency', 'online_agent', 'individual']).withMessage('分销商类型无效'),
      body('contactPerson').optional().isLength({ max: 50 }).withMessage('联系人名称不能超过50个字符'),
      body('contactPhone').optional().isMobilePhone('zh-CN').withMessage('联系电话格式不正确'),
      body('address').optional().isLength({ max: 200 }).withMessage('地址不能超过200个字符'),
      body('commissionRate').optional().isFloat({ min: 0, max: 100 }).withMessage('佣金比例必须在0-100之间'),
      body('creditLimit').optional().isFloat({ min: 0 }).withMessage('授信额度必须为非负数'),
      body('status').optional().isIn(['active', 'inactive', 'terminated']).withMessage('状态值无效'),
      body('effectiveDate').optional().isISO8601().withMessage('生效日期格式不正确'),
      body('terminationDate').optional().isISO8601().withMessage('终止日期格式不正确'),
      body('remark').optional().isLength({ max: 500 }).withMessage('备注不能超过500个字符'),
    ],
  },

  order: {
    create: [
      body('distributorId').optional().isInt({ min: 1 }).withMessage('分销商ID必须为正整数'),
      body('visitorName').notEmpty().withMessage('游客姓名不能为空').isLength({ max: 100 }).withMessage('游客姓名不能超过100个字符'),
      body('visitorPhone').notEmpty().withMessage('游客电话不能为空').isMobilePhone('zh-CN').withMessage('游客电话格式不正确'),
      body('idCard').optional().isLength({ min: 15, max: 18 }).withMessage('身份证号格式不正确'),
      body('quantity').isInt({ min: 1, max: 100 }).withMessage('购买数量必须在1-100之间'),
      body('unitPrice').isFloat({ min: 0 }).withMessage('单价必须为非负数'),
      body('productName').optional().isLength({ max: 200 }).withMessage('产品名称不能超过200个字符'),
      body('expireAt').optional().isISO8601().withMessage('过期日期格式不正确'),
      body('remark').optional().isLength({ max: 500 }).withMessage('备注不能超过500个字符'),
    ],
    query: [
      query('distributorId').optional().isInt({ min: 1 }).withMessage('分销商ID必须为正整数'),
      query('status').optional().isIn(['pending', 'paid', 'verified', 'expired', 'cancelled']).withMessage('订单状态无效'),
      query('startDate').optional().isISO8601().withMessage('开始日期格式不正确'),
      query('endDate').optional().isISO8601().withMessage('结束日期格式不正确'),
      query('keyword').optional().isLength({ max: 100 }).withMessage('关键词不能超过100个字符'),
    ],
  },

  ticket: {
    verify: [
      body('ticketCode').notEmpty().withMessage('票券码不能为空').isLength({ min: 10, max: 50 }).withMessage('票券码格式不正确'),
    ],
    query: [
      query('orderId').optional().isInt({ min: 1 }).withMessage('订单ID必须为正整数'),
      query('status').optional().isIn(['unused', 'used', 'expired', 'cancelled']).withMessage('票券状态无效'),
      query('startDate').optional().isISO8601().withMessage('开始日期格式不正确'),
      query('endDate').optional().isISO8601().withMessage('结束日期格式不正确'),
    ],
  },

  settlement: {
    generate: [
      body('distributorId').isInt({ min: 1 }).withMessage('分销商ID必须为正整数'),
      body('period').notEmpty().withMessage('结算周期不能为空').matches(/^\d{4}-\d{2}$/).withMessage('结算周期格式应为YYYY-MM'),
    ],
    pay: [
      param('id').isInt({ min: 1 }).withMessage('ID必须为正整数'),
      body('paidAmount').isFloat({ min: 0 }).withMessage('支付金额必须为非负数'),
    ],
    query: [
      query('distributorId').optional().isInt({ min: 1 }).withMessage('分销商ID必须为正整数'),
      query('status').optional().isIn(['pending', 'confirmed', 'paid']).withMessage('结算状态无效'),
      query('period').optional().matches(/^\d{4}-\d{2}$/).withMessage('结算周期格式应为YYYY-MM'),
    ],
  },

  auth: {
    login: [
      body('username').notEmpty().withMessage('用户名不能为空'),
      body('password').notEmpty().withMessage('密码不能为空'),
    ],
  },
};
