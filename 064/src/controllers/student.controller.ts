import { Request, Response, NextFunction } from 'express';
import { Op, Transaction } from 'sequelize';
import { Student, Enrollment, sequelize } from '../models';
import { ResponseUtil } from '../utils/response';
import { BadRequestException, NotFoundException } from '../exceptions/HttpException';
import { createStudentSchema, updateStudentSchema } from '../validations/student.validation';
import { PaginatedParams, StudentStatus } from '../types';

export class StudentController {
  static async create(req: Request, res: Response, next: NextFunction) {
    const t = await sequelize.transaction();
    try {
      const { error, value } = createStudentSchema.validate(req.body);
      if (error) {
        throw new BadRequestException(error.message);
      }

      const existingStudent = await Student.findOne({ where: { phone: value.phone }, transaction: t });
      if (existingStudent) {
        throw new BadRequestException('该手机号已被使用');
      }

      const student = await Student.create(value, { transaction: t });
      await t.commit();
      
      res.status(201).json(ResponseUtil.created(student, '创建成功'));
    } catch (error) {
      await t.rollback();
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { error, value } = updateStudentSchema.validate(req.body);
      if (error) {
        throw new BadRequestException(error.message);
      }

      const student = await Student.findByPk(id);
      if (!student) {
        throw new NotFoundException('学员不存在');
      }

      if (value.phone && value.phone !== student.phone) {
        const existingStudent = await Student.findOne({ where: { phone: value.phone } });
        if (existingStudent) {
          throw new BadRequestException('该手机号已被使用');
        }
      }

      await student.update(value);
      res.json(ResponseUtil.success(student, '更新成功'));
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    const t = await sequelize.transaction();
    try {
      const { id } = req.params;
      const student = await Student.findByPk(id, { transaction: t });
      if (!student) {
        throw new NotFoundException('学员不存在');
      }

      const hasEnrollments = await Enrollment.count({ where: { studentId: id }, transaction: t });
      if (hasEnrollments > 0) {
        throw new BadRequestException('该学员还有报名记录，无法删除');
      }

      await student.destroy({ transaction: t });
      await t.commit();
      
      res.json(ResponseUtil.success(null, '删除成功'));
    } catch (error) {
      await t.rollback();
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const student = await Student.findByPk(id, {
        include: [{ model: Enrollment, as: 'enrollments' }]
      });
      
      if (!student) {
        throw new NotFoundException('学员不存在');
      }

      res.json(ResponseUtil.success(student));
    } catch (error) {
      next(error);
    }
  }

  static async getList(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = 1, pageSize = 10, status, keyword } = req.query as PaginatedParams & {
        status?: string;
        keyword?: string;
      };

      const where: any = {};
      if (status) {
        where.status = status;
      }
      if (keyword) {
        where[Op.or] = [
          { name: { [Op.like]: `%${keyword}%` } },
          { phone: { [Op.like]: `%${keyword}%` } }
        ];
      }

      const { count, rows } = await Student.findAndCountAll({
        where,
        order: [['id', 'DESC']],
        limit: Number(pageSize),
        offset: (Number(page) - 1) * Number(pageSize)
      });

      res.json(ResponseUtil.paginated(rows, count, Number(page), Number(pageSize)));
    } catch (error) {
      next(error);
    }
  }

  static async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!Object.values(StudentStatus).includes(status)) {
        throw new BadRequestException('状态值不正确');
      }

      const student = await Student.findByPk(id);
      if (!student) {
        throw new NotFoundException('学员不存在');
      }

      await student.update({ status });
      res.json(ResponseUtil.success(student, '状态更新成功'));
    } catch (error) {
      next(error);
    }
  }
}
