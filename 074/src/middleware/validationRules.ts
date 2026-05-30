import { body, query, param } from 'express-validator';
import {
  CourseCategoryStatus,
  TeacherStatus,
  StudentStatus,
  ClassStatus,
  EnrollmentStatus,
  PaymentStatus,
  AttendanceStatus,
  UserRole
} from '../types';

export const commonValidators = {
  id: (field = 'id') =>
    param(field).isInt({ min: 1 }).withMessage('ID必须是大于0的整数'),

  queryId: (field = 'id') =>
    query(field).optional().isInt({ min: 1 }).withMessage('ID必须是大于0的整数'),

  name: (max = 50) =>
    body('name')
      .notEmpty()
      .withMessage('名称不能为空')
      .isLength({ max })
      .withMessage(`名称不能超过${max}个字符`),

  phone: () =>
    body('phone')
      .notEmpty()
      .withMessage('手机号不能为空')
      .isMobilePhone('zh-CN')
      .withMessage('请输入有效的手机号'),

  email: () =>
    body('email')
      .optional()
      .isEmail()
      .withMessage('请输入有效的邮箱地址'),

  date: (field = 'date') =>
    body(field).optional().isISO8601().withMessage('请输入有效的日期'),

  amount: (field = 'amount') =>
    body(field)
      .notEmpty()
      .withMessage('金额不能为空')
      .isFloat({ min: 0 })
      .withMessage('金额必须是大于等于0的数字'),

  pagination: () => [
    query('page').optional().isInt({ min: 1 }).withMessage('页码必须大于0'),
    query('pageSize').optional().isInt({ min: 1, max: 100 }).withMessage('每页条数必须在1-100之间')
  ],

  time: (field = 'time') =>
    body(field)
      .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage('请输入有效的时间格式 (HH:MM)'),

  status: (enumObj: any, field = 'status') =>
    body(field)
      .optional()
      .isIn(Object.values(enumObj))
      .withMessage('无效的状态值'),

  queryStatus: (enumObj: any, field = 'status') =>
    query(field)
      .optional()
      .isIn(Object.values(enumObj))
      .withMessage('无效的状态值'),

  keyword: () =>
    query('keyword').optional().isLength({ max: 100 }).withMessage('搜索关键词不能超过100个字符'),

  remark: (max = 500) =>
    body('remark').optional().isLength({ max }).withMessage(`备注不能超过${max}个字符`)
};

export const courseCategoryValidation = {
  create: [
    commonValidators.name(100),
    body('description').optional().isLength({ max: 500 }).withMessage('描述不能超过500个字符'),
    body('parentId').optional().isInt().withMessage('父级ID必须是整数'),
    body('sortOrder').optional().isInt({ min: 0 }).withMessage('排序必须是非负整数'),
    body('icon').optional().isLength({ max: 255 }).withMessage('图标路径不能超过255个字符')
  ],

  update: [
    body('name').optional().notEmpty().withMessage('分类名称不能为空').isLength({ max: 100 }).withMessage('分类名称不能超过100个字符'),
    body('description').optional().isLength({ max: 500 }).withMessage('描述不能超过500个字符'),
    body('parentId').optional().isInt().withMessage('父级ID必须是整数'),
    body('sortOrder').optional().isInt({ min: 0 }).withMessage('排序必须是非负整数'),
    commonValidators.status(CourseCategoryStatus),
    body('icon').optional().isLength({ max: 255 }).withMessage('图标路径不能超过255个字符')
  ],

  query: [
    commonValidators.queryStatus(CourseCategoryStatus),
    commonValidators.queryId('parentId'),
    ...commonValidators.pagination()
  ]
};

export const teacherValidation = {
  create: [
    commonValidators.name(50),
    commonValidators.phone(),
    commonValidators.email(),
    body('gender').optional().isIn(['male', 'female']).withMessage('性别只能是male或female'),
    commonValidators.date('birthDate'),
    body('avatar').optional().isLength({ max: 255 }).withMessage('头像路径不能超过255个字符'),
    body('qualifications').optional().isLength({ max: 1000 }).withMessage('资质描述不能超过1000个字符'),
    commonValidators.date('qualificationExpiryDate'),
    commonValidators.status(TeacherStatus),
    body('courseIds').optional().isArray().withMessage('授课科目必须是数组'),
    body('courseIds.*').isInt().withMessage('授课科目ID必须是整数'),
    body('availableTimeSlots').optional().isArray().withMessage('可排时段必须是数组'),
    body('availableTimeSlots.*.dayOfWeek').isInt({ min: 0, max: 6 }).withMessage('星期必须在0-6之间'),
    body('availableTimeSlots.*.startTime').matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('请输入有效的开始时间'),
    body('availableTimeSlots.*.endTime').matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('请输入有效的结束时间'),
    body('availableTimeSlots.*.isAvailable').isBoolean().withMessage('isAvailable必须是布尔值'),
    commonValidators.remark(1000)
  ],

  update: [
    body('name').optional().notEmpty().withMessage('教师姓名不能为空').isLength({ max: 50 }).withMessage('姓名不能超过50个字符'),
    body('phone').optional().isMobilePhone('zh-CN').withMessage('请输入有效的手机号'),
    commonValidators.email(),
    body('gender').optional().isIn(['male', 'female']).withMessage('性别只能是male或female'),
    commonValidators.date('birthDate'),
    body('avatar').optional().isLength({ max: 255 }).withMessage('头像路径不能超过255个字符'),
    body('qualifications').optional().isLength({ max: 1000 }).withMessage('资质描述不能超过1000个字符'),
    commonValidators.date('qualificationExpiryDate'),
    commonValidators.status(TeacherStatus),
    body('courseIds').optional().isArray().withMessage('授课科目必须是数组'),
    body('courseIds.*').isInt().withMessage('授课科目ID必须是整数'),
    body('availableTimeSlots').optional().isArray().withMessage('可排时段必须是数组'),
    body('availableTimeSlots.*.dayOfWeek').isInt({ min: 0, max: 6 }).withMessage('星期必须在0-6之间'),
    body('availableTimeSlots.*.startTime').matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('请输入有效的开始时间'),
    body('availableTimeSlots.*.endTime').matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('请输入有效的结束时间'),
    body('availableTimeSlots.*.isAvailable').isBoolean().withMessage('isAvailable必须是布尔值'),
    commonValidators.remark(1000)
  ],

  query: [
    commonValidators.keyword(),
    commonValidators.queryStatus(TeacherStatus),
    commonValidators.queryId('courseId'),
    query('dayOfWeek').optional().isInt({ min: 0, max: 6 }).withMessage('星期必须在0-6之间'),
    query('startTime').optional().matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('请输入有效的开始时间'),
    query('endTime').optional().matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('请输入有效的结束时间'),
    ...commonValidators.pagination()
  ],

  rating: [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('评分必须在1-5之间')
  ]
};

export const studentValidation = {
  create: [
    commonValidators.name(50),
    body('parentPhone').notEmpty().isMobilePhone('zh-CN').withMessage('请输入有效的家长手机号'),
    body('parentName').optional().isLength({ max: 50 }).withMessage('家长姓名不能超过50个字符'),
    body('gender').optional().isIn(['male', 'female']).withMessage('性别只能是male或female'),
    commonValidators.date('birthDate'),
    body('address').optional().isLength({ max: 255 }).withMessage('地址不能超过255个字符'),
    commonValidators.status(StudentStatus),
    commonValidators.remark(1000)
  ],

  update: [
    body('name').optional().notEmpty().withMessage('学员姓名不能为空').isLength({ max: 50 }).withMessage('姓名不能超过50个字符'),
    body('parentPhone').optional().isMobilePhone('zh-CN').withMessage('请输入有效的家长手机号'),
    body('parentName').optional().isLength({ max: 50 }).withMessage('家长姓名不能超过50个字符'),
    body('gender').optional().isIn(['male', 'female']).withMessage('性别只能是male或female'),
    commonValidators.date('birthDate'),
    body('address').optional().isLength({ max: 255 }).withMessage('地址不能超过255个字符'),
    commonValidators.status(StudentStatus),
    commonValidators.remark(1000)
  ],

  query: [
    commonValidators.keyword(),
    commonValidators.queryStatus(StudentStatus),
    commonValidators.queryId('classId'),
    ...commonValidators.pagination()
  ],

  enroll: [
    body('studentId').notEmpty().isInt().withMessage('学员ID不能为空且必须是整数'),
    body('classId').notEmpty().isInt().withMessage('班级ID不能为空且必须是整数'),
    commonValidators.amount(),
    body('paidAmount').optional().isFloat({ min: 0 }).withMessage('已付金额必须是大于等于0的数字'),
    body('isTrial').optional().isBoolean().withMessage('是否试听必须是布尔值'),
    commonValidators.remark()
  ],

  approveEnrollment: [
    body('amount').optional().isFloat({ min: 0 }).withMessage('金额必须是大于等于0的数字'),
    body('paidAmount').optional().isFloat({ min: 0 }).withMessage('已付金额必须是大于等于0的数字'),
    commonValidators.remark()
  ],

  rejectEnrollment: [
    body('reason').notEmpty().isLength({ max: 500 }).withMessage('拒绝原因不能为空且不能超过500个字符')
  ],

  updatePayment: [
    body('paidAmount').notEmpty().isFloat({ min: 0 }).withMessage('已付金额必须是大于等于0的数字'),
    body('paymentStatus').notEmpty().isIn(Object.values(PaymentStatus)).withMessage('无效的支付状态'),
    commonValidators.remark()
  ]
};

export const classValidation = {
  create: [
    commonValidators.name(100),
    body('courseId').notEmpty().isInt().withMessage('课程ID不能为空且必须是整数'),
    body('teacherId').notEmpty().isInt().withMessage('教师ID不能为空且必须是整数'),
    body('maxStudents').optional().isInt({ min: 0 }).withMessage('最大人数必须是非负整数'),
    body('currentStudents').optional().isInt({ min: 0 }).withMessage('当前人数必须是非负整数'),
    body('totalHours').notEmpty().isInt({ min: 1 }).withMessage('总课时必须大于0'),
    body('tuition').notEmpty().isFloat({ min: 0 }).withMessage('学费必须是大于等于0的数字'),
    commonValidators.date('startDate'),
    commonValidators.date('endDate'),
    commonValidators.status(ClassStatus),
    body('description').optional().isLength({ max: 500 }).withMessage('描述不能超过500个字符'),
    body('scheduleData').optional().isArray().withMessage('课表数据必须是数组'),
    body('scheduleData.*.dayOfWeek').isInt({ min: 0, max: 6 }).withMessage('星期必须在0-6之间'),
    body('scheduleData.*.startTime').notEmpty().matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('请输入有效的开始时间'),
    body('scheduleData.*.endTime').notEmpty().matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('请输入有效的结束时间'),
    body('scheduleData.*.classroom').optional().isLength({ max: 100 }).withMessage('教室名称不能超过100个字符')
  ],

  update: [
    body('name').optional().notEmpty().withMessage('班级名称不能为空').isLength({ max: 100 }).withMessage('班级名称不能超过100个字符'),
    body('courseId').optional().isInt().withMessage('课程ID必须是整数'),
    body('teacherId').optional().isInt().withMessage('教师ID必须是整数'),
    body('maxStudents').optional().isInt({ min: 0 }).withMessage('最大人数必须是非负整数'),
    body('currentStudents').optional().isInt({ min: 0 }).withMessage('当前人数必须是非负整数'),
    body('totalHours').optional().isInt({ min: 1 }).withMessage('总课时必须大于0'),
    body('tuition').optional().isFloat({ min: 0 }).withMessage('学费必须是大于等于0的数字'),
    commonValidators.date('startDate'),
    commonValidators.date('endDate'),
    commonValidators.status(ClassStatus),
    body('description').optional().isLength({ max: 500 }).withMessage('描述不能超过500个字符'),
    body('scheduleData').optional().isArray().withMessage('课表数据必须是数组'),
    body('scheduleData.*.dayOfWeek').isInt({ min: 0, max: 6 }).withMessage('星期必须在0-6之间'),
    body('scheduleData.*.startTime').matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('请输入有效的开始时间'),
    body('scheduleData.*.endTime').matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('请输入有效的结束时间'),
    body('scheduleData.*.classroom').optional().isLength({ max: 100 }).withMessage('教室名称不能超过100个字符')
  ],

  query: [
    commonValidators.keyword(),
    commonValidators.queryStatus(ClassStatus),
    commonValidators.queryId('courseId'),
    commonValidators.queryId('teacherId'),
    ...commonValidators.pagination()
  ],

  attendance: [
    body('classId').notEmpty().isInt().withMessage('班级ID不能为空且必须是整数'),
    body('attendanceDate').notEmpty().isISO8601().withMessage('请输入有效的考勤日期'),
    body('records').isArray({ min: 1 }).withMessage('考勤记录不能为空且必须是数组'),
    body('records.*.studentId').notEmpty().isInt().withMessage('学员ID不能为空且必须是整数'),
    body('records.*.status').optional().isIn(Object.values(AttendanceStatus)).withMessage('无效的考勤状态'),
    body('records.*.hoursConsumed').optional().isInt({ min: 0 }).withMessage('消耗课时必须是非负整数'),
    body('records.*.checkInTime').optional().matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('请输入有效的签到时间'),
    body('records.*.remark').optional().isLength({ max: 500 }).withMessage('备注不能超过500个字符')
  ],

  attendanceQuery: [
    commonValidators.queryId('classId'),
    commonValidators.queryId('studentId'),
    query('attendanceDate').optional().isISO8601().withMessage('请输入有效的考勤日期'),
    query('startDate').optional().isISO8601().withMessage('请输入有效的开始日期'),
    query('endDate').optional().isISO8601().withMessage('请输入有效的结束日期'),
    ...commonValidators.pagination()
  ]
};

export const authValidation = {
  login: [
    body('username').notEmpty().withMessage('用户名不能为空').isLength({ min: 3, max: 50 }).withMessage('用户名长度必须在3-50之间'),
    body('password').notEmpty().withMessage('密码不能为空').isLength({ min: 6 }).withMessage('密码长度不能少于6位')
  ],

  changePassword: [
    body('oldPassword').notEmpty().withMessage('原密码不能为空'),
    body('newPassword').notEmpty().isLength({ min: 6 }).withMessage('新密码长度不能少于6位')
  ],

  createUser: [
    body('username').notEmpty().withMessage('用户名不能为空').isLength({ min: 3, max: 50 }).withMessage('用户名长度必须在3-50之间'),
    body('password').notEmpty().withMessage('密码不能为空').isLength({ min: 6 }).withMessage('密码长度不能少于6位'),
    body('realName').notEmpty().withMessage('真实姓名不能为空').isLength({ max: 50 }).withMessage('真实姓名不能超过50个字符'),
    body('role').notEmpty().isIn(Object.values(UserRole)).withMessage('无效的角色'),
    body('phone').optional().isMobilePhone('zh-CN').withMessage('请输入有效的手机号'),
    commonValidators.email()
  ],

  updateUser: [
    body('realName').optional().notEmpty().withMessage('真实姓名不能为空').isLength({ max: 50 }).withMessage('真实姓名不能超过50个字符'),
    body('role').optional().isIn(Object.values(UserRole)).withMessage('无效的角色'),
    body('phone').optional().isMobilePhone('zh-CN').withMessage('请输入有效的手机号'),
    commonValidators.email(),
    body('isActive').optional().isBoolean().withMessage('isActive必须是布尔值')
  ]
};

export const logValidation = {
  query: [
    commonValidators.queryId('operatorId'),
    query('module').optional().isLength({ max: 50 }).withMessage('模块名不能超过50个字符'),
    query('action').optional().isLength({ max: 50 }).withMessage('操作名不能超过50个字符'),
    query('startDate').optional().isISO8601().withMessage('请输入有效的开始日期'),
    query('endDate').optional().isISO8601().withMessage('请输入有效的结束日期'),
    ...commonValidators.pagination()
  ]
};

export const idParamValidation = [
  commonValidators.id()
];
