import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { ResponseUtil } from '../utils/response';
import { OrderStatus, RoomStatus } from '../constants';

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => err.msg).join(', ');
    return res.status(400).json(ResponseUtil.badRequest(errorMessages));
  }
  next();
};

export const userValidation = {
  register: [
    body('username').notEmpty().withMessage('用户名不能为空'),
    body('password').isLength({ min: 6 }).withMessage('密码长度不能少于6位'),
    body('realName').notEmpty().withMessage('真实姓名不能为空'),
    body('phone').matches(/^1[3-9]\d{9}$/).withMessage('手机号格式不正确'),
    body('email').optional().isEmail().withMessage('邮箱格式不正确'),
    body('role').optional().isIn(['super_admin', 'operation', 'building_admin', 'finance', 'staff', 'customer']).withMessage('角色值不正确'),
    validate
  ],
  login: [
    body('username').notEmpty().withMessage('用户名不能为空'),
    body('password').notEmpty().withMessage('密码不能为空'),
    validate
  ],
  update: [
    param('id').isInt().withMessage('用户ID必须是整数'),
    body('realName').optional().notEmpty().withMessage('真实姓名不能为空'),
    body('phone').optional().matches(/^1[3-9]\d{9}$/).withMessage('手机号格式不正确'),
    body('email').optional().isEmail().withMessage('邮箱格式不正确'),
    validate
  ]
};

export const roomCategoryValidation = {
  create: [
    body('name').notEmpty().withMessage('分类名称不能为空'),
    body('parentId').optional().isInt().withMessage('父分类ID必须是整数'),
    body('sort').optional().isInt({ min: 0 }).withMessage('排序必须是非负整数'),
    body('description').optional().isString().withMessage('描述必须是字符串'),
    validate
  ],
  update: [
    param('id').isInt().withMessage('ID必须是整数'),
    body('name').optional().notEmpty().withMessage('分类名称不能为空'),
    body('parentId').optional().isInt().withMessage('父分类ID必须是整数'),
    body('sort').optional().isInt({ min: 0 }).withMessage('排序必须是非负整数'),
    validate
  ],
  delete: [
    param('id').isInt().withMessage('ID必须是整数'),
    validate
  ],
  toggleStatus: [
    param('id').isInt().withMessage('ID必须是整数'),
    body('status').isBoolean().withMessage('状态值必须是布尔类型'),
    validate
  ]
};

export const roomValidation = {
  create: [
    body('roomNo').notEmpty().withMessage('房间号不能为空'),
    body('categoryId').isInt().withMessage('房型分类ID必须是整数'),
    body('building').notEmpty().withMessage('楼栋不能为空'),
    body('floor').notEmpty().withMessage('楼层不能为空'),
    body('bedCount').isInt({ min: 1 }).withMessage('床位数量必须大于0'),
    body('maxGuests').isInt({ min: 1 }).withMessage('最大入住人数必须大于0'),
    body('area').isFloat({ min: 0 }).withMessage('面积必须大于0'),
    body('facilities').optional().isJSON().withMessage('设施信息格式不正确'),
    body('peakPrice').isFloat({ min: 0 }).withMessage('旺季价格必须大于等于0'),
    body('normalPrice').isFloat({ min: 0 }).withMessage('平季价格必须大于等于0'),
    body('lowPrice').isFloat({ min: 0 }).withMessage('淡季价格必须大于等于0'),
    body('description').optional().isString().withMessage('描述必须是字符串'),
    validate
  ],
  update: [
    param('id').isInt().withMessage('ID必须是整数'),
    body('roomNo').optional().notEmpty().withMessage('房间号不能为空'),
    body('categoryId').optional().isInt().withMessage('房型分类ID必须是整数'),
    body('building').optional().notEmpty().withMessage('楼栋不能为空'),
    body('maxGuests').optional().isInt({ min: 1 }).withMessage('最大入住人数必须大于0'),
    body('peakPrice').optional().isFloat({ min: 0 }).withMessage('旺季价格必须大于等于0'),
    validate
  ],
  filter: [
    query('page').optional().isInt({ min: 1 }).withMessage('页码必须大于0'),
    query('pageSize').optional().isInt({ min: 1, max: 100 }).withMessage('每页数量必须在1-100之间'),
    query('building').optional().isString().withMessage('楼栋参数错误'),
    query('categoryId').optional().isInt().withMessage('分类ID必须是整数'),
    query('minGuests').optional().isInt({ min: 0 }).withMessage('最小入住人数必须是非负整数'),
    query('maxGuests').optional().isInt({ min: 0 }).withMessage('最大入住人数必须是非负整数'),
    query('minPrice').optional().isFloat({ min: 0 }).withMessage('最低价格必须是非负数'),
    query('maxPrice').optional().isFloat({ min: 0 }).withMessage('最高价格必须是非负数'),
    query('facilities').optional().isString().withMessage('设施参数错误'),
    query('status').optional().isIn(Object.values(RoomStatus)).withMessage('状态值不正确'),
    query('checkInDate').optional().isISO8601().withMessage('入住日期格式不正确'),
    query('checkOutDate').optional().isISO8601().withMessage('离店日期格式不正确'),
    query('keyword').optional().isString().withMessage('关键词参数错误'),
    validate
  ],
  updateStatus: [
    param('id').isInt().withMessage('ID必须是整数'),
    body('status').isIn(Object.values(RoomStatus)).withMessage('状态值不正确'),
    validate
  ],
  updateMaintenance: [
    param('id').isInt().withMessage('ID必须是整数'),
    body('lastMaintenanceDate').optional().isISO8601().withMessage('上次维保日期格式不正确'),
    body('nextMaintenanceDate').optional().isISO8601().withMessage('下次维保日期格式不正确'),
    validate
  ]
};

export const orderValidation = {
  create: [
    body('roomId').isInt().withMessage('房源ID必须是整数'),
    body('customerName').notEmpty().withMessage('客户姓名不能为空'),
    body('customerPhone').matches(/^1[3-9]\d{9}$/).withMessage('手机号格式不正确'),
    body('customerIdCard').notEmpty().withMessage('身份证号不能为空'),
    body('checkInDate').isISO8601().withMessage('入住日期格式不正确'),
    body('checkOutDate').isISO8601().withMessage('离店日期格式不正确'),
    body('guestCount').isInt({ min: 1 }).withMessage('入住人数必须大于0'),
    body('remark').optional().isString().withMessage('备注必须是字符串'),
    validate
  ],
  pay: [
    param('id').isInt().withMessage('订单ID必须是整数'),
    body('payAmount').optional().isFloat({ min: 0 }).withMessage('支付金额必须是非负数'),
    validate
  ],
  checkIn: [
    param('id').isInt().withMessage('订单ID必须是整数'),
    body('remark').optional().isString().withMessage('备注必须是字符串'),
    validate
  ],
  checkOut: [
    param('id').isInt().withMessage('订单ID必须是整数'),
    body('extraCharges').optional().isArray().withMessage('额外消费必须是数组'),
    body('extraCharges.*.name').optional().notEmpty().withMessage('消费项目名称不能为空'),
    body('extraCharges.*.amount').optional().isFloat({ min: 0 }).withMessage('消费金额必须是非负数'),
    body('extraCharges.*.quantity').optional().isInt({ min: 1 }).withMessage('数量必须大于0'),
    body('remark').optional().isString().withMessage('备注必须是字符串'),
    validate
  ],
  cancel: [
    param('id').isInt().withMessage('订单ID必须是整数'),
    body('cancelReason').optional().isString().withMessage('取消原因必须是字符串'),
    validate
  ],
  updateStatus: [
    param('id').isInt().withMessage('ID必须是整数'),
    body('status').isIn(Object.values(OrderStatus)).withMessage('状态值不正确'),
    validate
  ],
  query: [
    query('page').optional().isInt({ min: 1 }).withMessage('页码必须大于0'),
    query('pageSize').optional().isInt({ min: 1, max: 100 }).withMessage('每页数量必须在1-100之间'),
    query('status').optional().isIn(Object.values(OrderStatus)).withMessage('状态值不正确'),
    query('startDate').optional().isISO8601().withMessage('开始日期格式不正确'),
    query('endDate').optional().isISO8601().withMessage('结束日期格式不正确'),
    query('keyword').optional().isString().withMessage('关键词参数错误'),
    query('building').optional().isString().withMessage('楼栋参数错误'),
    validate
  ]
};

export const revenueValidation = {
  query: [
    query('startDate').optional().isISO8601().withMessage('开始日期格式不正确'),
    query('endDate').optional().isISO8601().withMessage('结束日期格式不正确'),
    query('building').optional().isString().withMessage('楼栋参数错误'),
    query('categoryId').optional().isInt().withMessage('分类ID必须是整数'),
    validate
  ],
  generateReport: [
    param('date').optional().isISO8601().withMessage('报表日期格式不正确'),
    validate
  ],
  queryReports: [
    query('page').optional().isInt({ min: 1 }).withMessage('页码必须大于0'),
    query('pageSize').optional().isInt({ min: 1, max: 100 }).withMessage('每页数量必须在1-100之间'),
    query('startDate').optional().isISO8601().withMessage('开始日期格式不正确'),
    query('endDate').optional().isISO8601().withMessage('结束日期格式不正确'),
    validate
  ]
};
