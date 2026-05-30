import { Response, NextFunction } from 'express';
import Cleaner, { CleanerStatus, WorkType, ShiftType } from '../models/Cleaner';
import WorkArea from '../models/WorkArea';
import ResponseUtil from '../utils/response';
import { NotFoundException, BadRequestException, ForbiddenException } from '../exceptions/AppException';
import { body, param } from 'express-validator';
import { AuthRequest } from '../middlewares/auth.middleware';
import { UserRole } from '../models/User';
import { Op } from 'sequelize';
import moment from 'moment';

export const createValidation = [
  body('employeeNo').notEmpty().withMessage('员工编号不能为空'),
  body('name').notEmpty().withMessage('姓名不能为空'),
  body('idCard').isLength({ min: 18, max: 18 }).withMessage('身份证号必须为18位').matches(/^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/).withMessage('身份证号格式错误'),
  body('phone').notEmpty().withMessage('手机号不能为空').matches(/^1[3-9]\d{9}$/).withMessage('手机号格式错误'),
  body('workAreaId').isInt({ min: 1 }).withMessage('作业区域ID必须为正整数'),
  body('workType').isIn(Object.values(WorkType)).withMessage('无效的工种类型'),
  body('shiftType').isIn(Object.values(ShiftType)).withMessage('无效的班次类型'),
  body('hireDate').isISO8601().withMessage('入职日期格式错误'),
  body('contractExpiryDate').isISO8601().withMessage('合同到期日期格式错误'),
  body('qualifications').optional().isString().withMessage('资质必须为字符串'),
  body('status').optional().isIn(Object.values(CleanerStatus)).withMessage('无效的状态')
];

export const updateValidation = [
  param('id').isInt({ min: 1 }).withMessage('ID必须为正整数'),
  body('name').optional().notEmpty().withMessage('姓名不能为空'),
  body('phone').optional().matches(/^1[3-9]\d{9}$/).withMessage('手机号格式错误'),
  body('workAreaId').optional().isInt({ min: 1 }).withMessage('作业区域ID必须为正整数'),
  body('workType').optional().isIn(Object.values(WorkType)).withMessage('无效的工种类型'),
  body('shiftType').optional().isIn(Object.values(ShiftType)).withMessage('无效的班次类型'),
  body('status').optional().isIn(Object.values(CleanerStatus)).withMessage('无效的状态'),
  body('qualifications').optional().isString().withMessage('资质必须为字符串'),
  body('hireDate').optional().isISO8601().withMessage('入职日期格式错误'),
  body('contractExpiryDate').optional().isISO8601().withMessage('合同到期日期格式错误')
];

export const getAllCleaners = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status, workAreaId, workType, shiftType, keyword } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;

    const where: any = {};
    if (status) where.status = status;
    if (workAreaId) where.workAreaId = Number(workAreaId);
    if (workType) where.workType = workType;
    if (shiftType) where.shiftType = shiftType;
    if (keyword) {
      where[Op.or] = [
        { name: { [Op.like]: `%${keyword}%` } },
        { employeeNo: { [Op.like]: `%${keyword}%` } },
        { phone: { [Op.like]: `%${keyword}%` } },
        { idCard: { [Op.like]: `%${keyword}%` } }
      ];
    }

    const { count, rows } = await Cleaner.findAndCountAll({
      where,
      include: [{ model: WorkArea, as: 'workArea', attributes: ['id', 'name', 'areaType'] }],
      order: [['createdAt', 'DESC']],
      offset: (page - 1) * pageSize,
      limit: pageSize
    });

    ResponseUtil.success(res, {
      list: rows,
      total: count,
      page,
      pageSize,
      totalPages: Math.ceil(count / pageSize)
    });
  } catch (error) {
    next(error);
  }
};

export const getCleanerById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const cleaner = await Cleaner.findByPk(id, {
      include: [{ model: WorkArea, as: 'workArea' }]
    });

    if (!cleaner) {
      throw new NotFoundException('保洁人员不存在');
    }

    ResponseUtil.success(res, cleaner);
  } catch (error) {
    next(error);
  }
};

export const createCleaner = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { employeeNo, name, idCard, phone, workAreaId, workType, shiftType, qualifications, hireDate, contractExpiryDate } = req.body;

    const [existingNo, existingIdCard] = await Promise.all([
      Cleaner.findOne({ where: { employeeNo } }),
      Cleaner.findOne({ where: { idCard } })
    ]);

    if (existingNo) {
      throw new BadRequestException('员工编号已存在');
    }
    if (existingIdCard) {
      throw new BadRequestException('身份证号已存在');
    }

    const workArea = await WorkArea.findByPk(workAreaId);
    if (!workArea) {
      throw new BadRequestException('作业区域不存在');
    }

    if (workArea.status === 'suspended') {
      throw new BadRequestException('该作业区域已停运，不能绑定保洁人员');
    }

    const cleaner = await Cleaner.create({
      employeeNo,
      name,
      idCard,
      phone,
      workAreaId,
      workType,
      shiftType,
      status: CleanerStatus.ON_DUTY,
      qualifications,
      hireDate,
      contractExpiryDate,
      contractReminded: false
    });

    ResponseUtil.created(res, cleaner, '保洁人员创建成功');
  } catch (error) {
    next(error);
  }
};

export const updateCleaner = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, phone, workAreaId, workType, shiftType, status, qualifications, hireDate, contractExpiryDate } = req.body;

    const cleaner = await Cleaner.findByPk(id);
    if (!cleaner) {
      throw new NotFoundException('保洁人员不存在');
    }

    if (workAreaId) {
      const workArea = await WorkArea.findByPk(workAreaId);
      if (!workArea) {
        throw new BadRequestException('作业区域不存在');
      }
      if (workArea.status === 'suspended') {
        throw new BadRequestException('该作业区域已停运，不能绑定保洁人员');
      }
    }

    await cleaner.update({
      name,
      phone,
      workAreaId,
      workType,
      shiftType,
      status,
      qualifications,
      hireDate,
      contractExpiryDate
    });

    ResponseUtil.success(res, cleaner, '保洁人员更新成功');
  } catch (error) {
    next(error);
  }
};

export const deleteCleaner = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const cleaner = await Cleaner.findByPk(id);
    if (!cleaner) {
      throw new NotFoundException('保洁人员不存在');
    }

    await cleaner.destroy();
    ResponseUtil.success(res, null, '保洁人员删除成功');
  } catch (error) {
    next(error);
  }
};

export const getContractExpiringSoon = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const today = moment().startOf('day');
    const expiringDate = today.clone().add(days, 'days');

    const cleaners = await Cleaner.findAll({
      where: {
        contractExpiryDate: {
          [Op.between]: [today.toDate(), expiringDate.toDate()]
        },
        status: {
          [Op.ne]: CleanerStatus.RESIGNED
        }
      },
      include: [{ model: WorkArea, as: 'workArea' }],
      order: [['contractExpiryDate', 'ASC']]
    });

    ResponseUtil.success(res, {
      list: cleaners,
      total: cleaners.length,
      days
    });
  } catch (error) {
    next(error);
  }
};

export const updateContractReminded = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const cleaner = await Cleaner.findByPk(id);
    if (!cleaner) {
      throw new NotFoundException('保洁人员不存在');
    }

    await cleaner.update({ contractReminded: true });
    ResponseUtil.success(res, null, '合同提醒已标记');
  } catch (error) {
    next(error);
  }
};