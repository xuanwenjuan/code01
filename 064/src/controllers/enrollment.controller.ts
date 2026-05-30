import { Request, Response, NextFunction } from 'express';
import { Op, Transaction } from 'sequelize';
import { Enrollment, Student, MajorCategory, Class, sequelize } from '../models';
import { ResponseUtil } from '../utils/response';
import { BadRequestException, NotFoundException, ForbiddenException } from '../exceptions/HttpException';
import { PaginatedParams, EnrollmentStatus, PaymentStatus, StudentStatus, ClassStatus, IEnrollmentQueryParams } from '../types';
import {
  createEnrollmentSchema,
  approveEnrollmentSchema,
  rejectEnrollmentSchema,
  assignClassSchema,
  getEnrollmentListSchema
} from '../validations/enrollment.validation';
import { PermissionGuard } from '../middlewares/auth';

export class EnrollmentController {
  static async create(req: Request, res: Response, next: NextFunction) {
    const t = await sequelize.transaction();
    
    try {
      if (!req.user || !PermissionGuard.canManageEnrollments(req.user.role)) {
        throw new ForbiddenException('权限不足，无法创建报名');
      }

      const { error, value } = createEnrollmentSchema.validate(req.body);
      if (error) {
        throw new BadRequestException(error.message);
      }

      const { studentId, majorId, amount, remark } = value;

      const student = await Student.findByPk(studentId, { transaction: t });
      if (!student) {
        throw new NotFoundException('学员不存在');
      }

      const major = await MajorCategory.findByPk(majorId, { transaction: t });
      if (!major) {
        throw new NotFoundException('专业不存在');
      }

      if (!major.isActive) {
        throw new BadRequestException('该专业已停招，无法报名');
      }

      const existingEnrollment = await Enrollment.findOne({
        where: {
          studentId,
          majorId,
          status: { [Op.ne]: EnrollmentStatus.REJECTED }
        },
        transaction: t
      });
      if (existingEnrollment) {
        throw new BadRequestException('该学员已报名此专业');
      }

      const enrollment = await Enrollment.create({
        studentId,
        majorId,
        amount: amount || 0,
        remark,
        status: EnrollmentStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING
      }, { transaction: t });

      await t.commit();
      res.status(201).json(ResponseUtil.created(enrollment, '报名成功'));
    } catch (error) {
      await t.rollback();
      next(error);
    }
  }

  static async approve(req: Request, res: Response, next: NextFunction) {
    const t = await sequelize.transaction();
    
    try {
      if (!req.user || !PermissionGuard.canApproveEnrollment(req.user.role)) {
        throw new ForbiddenException('权限不足，无法审核报名');
      }

      const { id } = req.params;
      const { error, value } = approveEnrollmentSchema.validate(req.body);
      if (error) {
        throw new BadRequestException(error.message);
      }

      const { remark } = value;
      const auditorId = req.user.userId;

      const enrollment = await Enrollment.findByPk(id, { transaction: t });
      if (!enrollment) {
        throw new NotFoundException('报名记录不存在');
      }

      if (enrollment.status !== EnrollmentStatus.PENDING) {
        throw new BadRequestException('该报名记录已审核');
      }

      const student = await Student.findByPk(enrollment.studentId, { transaction: t });
      if (!student) {
        throw new NotFoundException('学员不存在');
      }

      const availableClass = await Class.findOne({
        where: {
          majorId: enrollment.majorId,
          status: ClassStatus.PREPARING,
          [Op.and]: sequelize.literal('currentStudents < maxStudents')
        },
        order: [['createdAt', 'ASC']],
        transaction: t
      });

      await enrollment.update({
        status: EnrollmentStatus.APPROVED,
        auditorId,
        auditTime: new Date(),
        auditRemark: remark,
        classId: availableClass?.id || null
      }, { transaction: t });

      if (availableClass) {
        await availableClass.increment('currentStudents', { transaction: t });
        await student.update({ status: StudentStatus.ENROLLED }, { transaction: t });
      }

      await t.commit();
      res.json(ResponseUtil.success(enrollment, availableClass ? '审核通过，已自动分班' : '审核通过，暂无可用班级'));
    } catch (error) {
      await t.rollback();
      next(error);
    }
  }

  static async reject(req: Request, res: Response, next: NextFunction) {
    const t = await sequelize.transaction();
    
    try {
      if (!req.user || !PermissionGuard.canApproveEnrollment(req.user.role)) {
        throw new ForbiddenException('权限不足，无法拒绝报名');
      }

      const { id } = req.params;
      const { error, value } = rejectEnrollmentSchema.validate(req.body);
      if (error) {
        throw new BadRequestException(error.message);
      }

      const enrollment = await Enrollment.findByPk(id, { transaction: t });
      if (!enrollment) {
        throw new NotFoundException('报名记录不存在');
      }

      if (enrollment.status !== EnrollmentStatus.PENDING) {
        throw new BadRequestException('该报名记录已审核');
      }

      await enrollment.update({
        status: EnrollmentStatus.REJECTED,
        auditorId: req.user.userId,
        auditTime: new Date(),
        auditRemark: value.remark
      }, { transaction: t });

      await t.commit();
      res.json(ResponseUtil.success(enrollment, '已拒绝报名'));
    } catch (error) {
      await t.rollback();
      next(error);
    }
  }

  static async confirmPayment(req: Request, res: Response, next: NextFunction) {
    const t = await sequelize.transaction();
    
    try {
      if (!req.user || !PermissionGuard.canVerifyPayment(req.user.role)) {
        throw new ForbiddenException('权限不足，无法确认缴费');
      }

      const { id } = req.params;

      const enrollment = await Enrollment.findByPk(id, { transaction: t });
      if (!enrollment) {
        throw new NotFoundException('报名记录不存在');
      }

      if (enrollment.paymentStatus === PaymentStatus.VERIFIED) {
        throw new BadRequestException('该报名已确认缴费');
      }

      await enrollment.update({
        paymentStatus: PaymentStatus.VERIFIED,
        paidAt: new Date()
      }, { transaction: t });

      if (enrollment.status === EnrollmentStatus.APPROVED && !enrollment.classId) {
        const availableClass = await Class.findOne({
          where: {
            majorId: enrollment.majorId,
            status: ClassStatus.PREPARING,
            [Op.and]: sequelize.literal('currentStudents < maxStudents')
          },
          order: [['createdAt', 'ASC']],
          transaction: t
        });

        if (availableClass) {
          await enrollment.update({ classId: availableClass.id }, { transaction: t });
          await availableClass.increment('currentStudents', { transaction: t });

          const student = await Student.findByPk(enrollment.studentId, { transaction: t });
          if (student && student.status === StudentStatus.REGISTERED) {
            await student.update({ status: StudentStatus.ENROLLED }, { transaction: t });
          }
        }
      }

      await t.commit();
      res.json(ResponseUtil.success(enrollment, '缴费确认成功'));
    } catch (error) {
      await t.rollback();
      next(error);
    }
  }

  static async assignClass(req: Request, res: Response, next: NextFunction) {
    const t = await sequelize.transaction();
    
    try {
      if (!req.user || !PermissionGuard.canManageEnrollments(req.user.role)) {
        throw new ForbiddenException('权限不足，无法分配班级');
      }

      const { error, value } = assignClassSchema.validate(req.body);
      if (error) {
        throw new BadRequestException(error.message);
      }

      const { id, classId } = value;

      const enrollment = await Enrollment.findByPk(id, { transaction: t });
      if (!enrollment) {
        throw new NotFoundException('报名记录不存在');
      }

      const targetClass = await Class.findByPk(classId, { transaction: t });
      if (!targetClass) {
        throw new NotFoundException('班级不存在');
      }

      if (targetClass.majorId !== enrollment.majorId) {
        throw new BadRequestException('班级专业与报名专业不一致');
      }

      if (targetClass.currentStudents >= targetClass.maxStudents) {
        throw new BadRequestException('班级人数已满');
      }

      if (enrollment.classId) {
        const oldClass = await Class.findByPk(enrollment.classId, { transaction: t });
        if (oldClass) {
          await oldClass.decrement('currentStudents', { transaction: t });
        }
      }

      await targetClass.increment('currentStudents', { transaction: t });
      await enrollment.update({ classId }, { transaction: t });

      const student = await Student.findByPk(enrollment.studentId, { transaction: t });
      if (student && student.status === StudentStatus.REGISTERED) {
        await student.update({ status: StudentStatus.ENROLLED }, { transaction: t });
      }

      await t.commit();
      res.json(ResponseUtil.success(enrollment, '分班成功'));
    } catch (error) {
      await t.rollback();
      next(error);
    }
  }

  static async updateStudentStatus(req: Request, res: Response, next: NextFunction) {
    const t = await sequelize.transaction();
    
    try {
      if (!req.user || !PermissionGuard.canManageStudents(req.user.role)) {
        throw new ForbiddenException('权限不足，无法更新学员状态');
      }

      const { id } = req.params;
      const { status } = req.body;

      if (![StudentStatus.REGISTERED, StudentStatus.ENROLLED, StudentStatus.AUDITING, 
            StudentStatus.GRADUATED, StudentStatus.SUSPENDED].includes(status)) {
        throw new BadRequestException('无效的学员状态');
      }

      const enrollment = await Enrollment.findByPk(id, { transaction: t });
      if (!enrollment) {
        throw new NotFoundException('报名记录不存在');
      }

      const student = await Student.findByPk(enrollment.studentId, { transaction: t });
      if (!student) {
        throw new NotFoundException('学员不存在');
      }

      if (enrollment.classId && status === StudentStatus.GRADUATED) {
        const classInfo = await Class.findByPk(enrollment.classId, { transaction: t });
        if (classInfo) {
          await classInfo.decrement('currentStudents', { transaction: t });
        }
      }

      await student.update({ status }, { transaction: t });
      await t.commit();

      res.json(ResponseUtil.success(null, '学员状态更新成功'));
    } catch (error) {
      await t.rollback();
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const enrollment = await Enrollment.findByPk(id, {
        include: [
          { model: Student, as: 'student' },
          { model: MajorCategory, as: 'major' },
          { model: Class, as: 'classInfo' }
        ]
      });
      
      if (!enrollment) {
        throw new NotFoundException('报名记录不存在');
      }

      res.json(ResponseUtil.success(enrollment));
    } catch (error) {
      next(error);
    }
  }

  static async getList(req: Request, res: Response, next: NextFunction) {
    try {
      const { error, value } = getEnrollmentListSchema.validate(req.query);
      if (error) {
        throw new BadRequestException(error.message);
      }

      const {
        page = 1,
        pageSize = 10,
        status,
        paymentStatus,
        studentId,
        majorId,
        classId
      } = value as IEnrollmentQueryParams;

      const where: any = {};
      if (status) {
        where.status = status;
      }
      if (paymentStatus) {
        where.paymentStatus = paymentStatus;
      }
      if (studentId) {
        where.studentId = studentId;
      }
      if (majorId) {
        where.majorId = majorId;
      }
      if (classId) {
        where.classId = classId;
      }

      const { count, rows } = await Enrollment.findAndCountAll({
        where,
        include: [
          { model: Student, as: 'student' },
          { model: MajorCategory, as: 'major' },
          { model: Class, as: 'classInfo' }
        ],
        order: [['id', 'DESC']],
        limit: Number(pageSize),
        offset: (Number(page) - 1) * Number(pageSize)
      });

      res.json(ResponseUtil.paginated(rows, count, Number(page), Number(pageSize)));
    } catch (error) {
      next(error);
    }
  }
}
