import { Student, Enrollment, Class } from '../models';
import { AppError } from '../middleware/errorHandler';
import { StudentStatus, EnrollmentStatus, PaymentStatus, ClassStatus } from '../types';
import { Op, Transaction } from 'sequelize';
import { withTransaction } from '../utils/transaction';

export const EnrollmentFlow = {
  PENDING: {
    canTransitionTo: [EnrollmentStatus.APPROVED, EnrollmentStatus.REJECTED, EnrollmentStatus.CANCELLED],
    requiredConditions: []
  },
  APPROVED: {
    canTransitionTo: [EnrollmentStatus.CANCELLED],
    requiredConditions: []
  },
  REJECTED: {
    canTransitionTo: [],
    requiredConditions: []
  },
  CANCELLED: {
    canTransitionTo: [],
    requiredConditions: []
  }
};

export const canTransitionEnrollmentStatus = (
  currentStatus: EnrollmentStatus,
  newStatus: EnrollmentStatus
): boolean => {
  const flow = EnrollmentFlow[currentStatus];
  return flow ? flow.canTransitionTo.includes(newStatus) : false;
};

export const createStudent = async (data: any) => {
  const existingStudent = await Student.findOne({
    where: { parentPhone: data.parentPhone }
  });
  if (existingStudent) {
    throw new AppError('该家长手机号已存在', 400);
  }

  const student = await Student.create(data);
  return student;
};

export const updateStudent = async (id: number, data: any) => {
  const student = await Student.findByPk(id);
  if (!student) {
    throw new AppError('学员不存在', 404);
  }

  if (data.parentPhone && data.parentPhone !== student.parentPhone) {
    const existingStudent = await Student.findOne({
      where: { parentPhone: data.parentPhone }
    });
    if (existingStudent) {
      throw new AppError('该家长手机号已存在', 400);
    }
  }

  await student.update(data);
  return student;
};

export const deleteStudent = async (id: number) => {
  const student = await Student.findByPk(id);
  if (!student) {
    throw new AppError('学员不存在', 404);
  }

  const activeEnrollments = await Enrollment.count({
    where: {
      studentId: id,
      status: { [Op.in]: [EnrollmentStatus.PENDING, EnrollmentStatus.APPROVED] }
    }
  });
  if (activeEnrollments > 0) {
    throw new AppError('该学员存在有效报班记录，无法删除', 400);
  }

  await student.destroy();
  return { message: '删除成功' };
};

export const getStudentById = async (id: number) => {
  const student = await Student.findByPk(id, {
    include: [{
      model: Enrollment,
      include: [Class]
    }]
  });
  if (!student) {
    throw new AppError('学员不存在', 404);
  }
  return student;
};

export const getAllStudents = async (query: any) => {
  const { name, parentPhone, status, page = 1, pageSize = 10 } = query;
  const where: any = {};

  if (name) {
    where.name = { [Op.like]: `%${name}%` };
  }
  if (parentPhone) {
    where.parentPhone = { [Op.like]: `%${parentPhone}%` };
  }
  if (status) {
    where.status = status;
  }

  const { count, rows } = await Student.findAndCountAll({
    where,
    order: [['createdAt', 'DESC']],
    offset: (page - 1) * pageSize,
    limit: Number(pageSize)
  });

  return {
    list: rows,
    total: count,
    page: Number(page),
    pageSize: Number(pageSize)
  };
};

export const updateStatus = async (id: number, status: StudentStatus) => {
  const student = await Student.findByPk(id);
  if (!student) {
    throw new AppError('学员不存在', 404);
  }

  student.status = status;
  await student.save();
  return student;
};

export const enrollStudent = async (data: any) => {
  return withTransaction(async (transaction) => {
    const { studentId, classId, amount, isTrial = false, remark } = data;

    const student = await Student.findByPk(studentId);
    if (!student) {
      throw new AppError('学员不存在', 404);
    }

    const classInfo = await Class.findByPk(classId);
    if (!classInfo) {
      throw new AppError('班级不存在', 404);
    }

    if (classInfo.status !== ClassStatus.NOT_STARTED && classInfo.status !== ClassStatus.IN_PROGRESS) {
      throw new AppError('该班级已结束或已取消，无法报名', 400);
    }

    const existingEnrollment = await Enrollment.findOne({
      where: {
        studentId,
        classId,
        status: { [Op.ne]: EnrollmentStatus.CANCELLED }
      }
    });
    if (existingEnrollment) {
      throw new AppError('该学员已在该班级报名', 400);
    }

    const enrollment = await Enrollment.create({
      studentId,
      classId,
      amount,
      paidAmount: 0,
      status: EnrollmentStatus.PENDING,
      paymentStatus: PaymentStatus.UNPAID,
      usedHours: 0,
      totalHours: classInfo.totalHours,
      enrollmentDate: new Date(),
      isTrial,
      remark
    }, { transaction });

    return enrollment;
  });
};

export const approveEnrollment = async (id: number, data?: { amount?: number; paidAmount?: number }) => {
  return withTransaction(async (transaction) => {
    const enrollment = await Enrollment.findByPk(id, { transaction });
    if (!enrollment) {
      throw new AppError('报名记录不存在', 404);
    }

    if (!canTransitionEnrollmentStatus(enrollment.status, EnrollmentStatus.APPROVED)) {
      throw new AppError(`当前状态${enrollment.status}无法审批通过`, 400);
    }

    const classInfo = await Class.findByPk(enrollment.classId, { transaction });
    if (!classInfo) {
      throw new AppError('班级不存在', 404);
    }

    if (!enrollment.isTrial && classInfo.maxStudents > 0) {
      if (classInfo.currentStudents >= classInfo.maxStudents) {
        throw new AppError('班级人数已满', 400);
      }
    }

    enrollment.status = EnrollmentStatus.APPROVED;
    if (data?.amount !== undefined) {
      enrollment.amount = data.amount;
    }
    if (data?.paidAmount !== undefined) {
      enrollment.paidAmount = data.paidAmount;
      if (data.paidAmount >= enrollment.amount) {
        enrollment.paymentStatus = PaymentStatus.PAID;
      } else if (data.paidAmount > 0) {
        enrollment.paymentStatus = PaymentStatus.PARTIAL_REFUNDED;
      }
    }
    await enrollment.save({ transaction });

    if (!enrollment.isTrial) {
      await Class.increment('currentStudents', {
        by: 1,
        where: { id: enrollment.classId },
        transaction
      });
    }

    return enrollment;
  });
};

export const rejectEnrollment = async (id: number, reason?: string) => {
  return withTransaction(async (transaction) => {
    const enrollment = await Enrollment.findByPk(id, { transaction });
    if (!enrollment) {
      throw new AppError('报名记录不存在', 404);
    }

    if (!canTransitionEnrollmentStatus(enrollment.status, EnrollmentStatus.REJECTED)) {
      throw new AppError(`当前状态${enrollment.status}无法驳回`, 400);
    }

    enrollment.status = EnrollmentStatus.REJECTED;
    if (reason) {
      enrollment.remark = reason;
    }
    await enrollment.save({ transaction });

    if (!enrollment.isTrial) {
      await Class.decrement('currentStudents', {
        by: 1,
        where: { id: enrollment.classId },
        transaction
      });
    }

    return enrollment;
  });
};

export const updatePayment = async (id: number, paidAmount: number) => {
  return withTransaction(async (transaction) => {
    const enrollment = await Enrollment.findByPk(id, { transaction });
    if (!enrollment) {
      throw new AppError('报名记录不存在', 404);
    }

    enrollment.paidAmount = paidAmount;
    if (paidAmount >= enrollment.amount) {
      enrollment.paymentStatus = PaymentStatus.PAID;
    } else if (paidAmount > 0) {
      enrollment.paymentStatus = PaymentStatus.PARTIAL_REFUNDED;
    } else {
      enrollment.paymentStatus = PaymentStatus.UNPAID;
    }
    await enrollment.save({ transaction });

    return enrollment;
  });
};

export const convertTrialToFormal = async (enrollmentId: number) => {
  return withTransaction(async (transaction) => {
    const enrollment = await Enrollment.findByPk(enrollmentId, { transaction });
    if (!enrollment) {
      throw new AppError('报名记录不存在', 404);
    }

    if (!enrollment.isTrial) {
      throw new AppError('该报名不是试听学员', 400);
    }

    if (enrollment.status !== EnrollmentStatus.APPROVED) {
      throw new AppError('只有已审批通过的试听学员才能转正式', 400);
    }

    enrollment.isTrial = false;
    await enrollment.save({ transaction });

    const classInfo = await Class.findByPk(enrollment.classId, { transaction });
    if (classInfo && classInfo.maxStudents > 0) {
      if (classInfo.currentStudents >= classInfo.maxStudents) {
        throw new AppError('班级人数已满', 400);
      }
      await Class.increment('currentStudents', {
        by: 1,
        where: { id: enrollment.classId },
        transaction
      });
    }

    return enrollment;
  });
};

export const suspendStudent = async (enrollmentId: number, remark?: string) => {
  return withTransaction(async (transaction) => {
    const enrollment = await Enrollment.findByPk(enrollmentId, { transaction });
    if (!enrollment) {
      throw new AppError('报名记录不存在', 404);
    }

    if (!canTransitionEnrollmentStatus(enrollment.status, EnrollmentStatus.CANCELLED)) {
      throw new AppError(`当前状态${enrollment.status}无法休学/取消`, 400);
    }

    enrollment.status = EnrollmentStatus.CANCELLED;
    if (remark) {
      enrollment.remark = remark;
    }
    await enrollment.save({ transaction });

    if (!enrollment.isTrial) {
      await Class.decrement('currentStudents', {
        by: 1,
        where: { id: enrollment.classId },
        transaction
      });
    }

    const otherEnrollments = await Enrollment.count({
      where: {
        studentId: enrollment.studentId,
        status: { [Op.in]: [EnrollmentStatus.PENDING, EnrollmentStatus.APPROVED] },
        id: { [Op.ne]: enrollmentId }
      },
      transaction
    });

    if (otherEnrollments === 0) {
      await Student.update(
        { status: StudentStatus.SUSPENDED },
        { where: { id: enrollment.studentId }, transaction }
      );
    }

    return enrollment;
  });
};
