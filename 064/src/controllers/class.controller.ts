import { Request, Response, NextFunction } from 'express';
import { Op } from 'sequelize';
import { Class, MajorCategory, Teacher, Lesson, Enrollment } from '../models';
import { ResponseUtil } from '../utils/response';
import { BadRequestException, NotFoundException } from '../exceptions/HttpException';
import { createClassSchema, updateClassSchema } from '../validations/class.validation';
import { PaginatedParams, ClassStatus } from '../types';

export class ClassController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { error, value } = createClassSchema.validate(req.body);
      if (error) {
        throw new BadRequestException(error.message);
      }

      const major = await MajorCategory.findByPk(value.majorId);
      if (!major) {
        throw new BadRequestException('专业不存在');
      }

      const teacher = await Teacher.findByPk(value.teacherId);
      if (!teacher) {
        throw new BadRequestException('讲师不存在');
      }

      const newClass = await Class.create({
        ...value,
        status: ClassStatus.PREPARING,
        currentStudents: 0,
        completedHours: 0
      });

      res.status(201).json(ResponseUtil.created(newClass, '创建成功'));
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { error, value } = updateClassSchema.validate(req.body);
      if (error) {
        throw new BadRequestException(error.message);
      }

      const classItem = await Class.findByPk(id);
      if (!classItem) {
        throw new NotFoundException('班级不存在');
      }

      if (value.majorId && value.majorId !== classItem.majorId) {
        const major = await MajorCategory.findByPk(value.majorId);
        if (!major) {
          throw new BadRequestException('专业不存在');
        }
      }

      if (value.teacherId && value.teacherId !== classItem.teacherId) {
        const teacher = await Teacher.findByPk(value.teacherId);
        if (!teacher) {
          throw new BadRequestException('讲师不存在');
        }
      }

      await classItem.update(value);
      res.json(ResponseUtil.success(classItem, '更新成功'));
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const classItem = await Class.findByPk(id);
      if (!classItem) {
        throw new NotFoundException('班级不存在');
      }

      if (classItem.currentStudents > 0) {
        throw new BadRequestException('该班级还有学员，无法删除');
      }

      await Lesson.destroy({ where: { classId: id } });
      await classItem.destroy();

      res.json(ResponseUtil.success(null, '删除成功'));
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const classItem = await Class.findByPk(id, {
        include: [
          { model: MajorCategory, as: 'major' },
          { model: Teacher, as: 'teacher' },
          { model: Lesson, as: 'lessons' },
          { model: Enrollment, as: 'enrollments' }
        ]
      });
      
      if (!classItem) {
        throw new NotFoundException('班级不存在');
      }

      res.json(ResponseUtil.success(classItem));
    } catch (error) {
      next(error);
    }
  }

  static async getList(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = 1, pageSize = 10, status, majorId, teacherId, keyword } = req.query as PaginatedParams & {
        status?: string;
        majorId?: string;
        teacherId?: string;
        keyword?: string;
      };

      const where: any = {};
      if (status) {
        where.status = status;
      }
      if (majorId) {
        where.majorId = majorId;
      }
      if (teacherId) {
        where.teacherId = teacherId;
      }
      if (keyword) {
        where.name = { [Op.like]: `%${keyword}%` };
      }

      const { count, rows } = await Class.findAndCountAll({
        where,
        include: [
          { model: MajorCategory, as: 'major' },
          { model: Teacher, as: 'teacher' }
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

  static async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!Object.values(ClassStatus).includes(status)) {
        throw new BadRequestException('状态值不正确');
      }

      const classItem = await Class.findByPk(id);
      if (!classItem) {
        throw new NotFoundException('班级不存在');
      }

      await classItem.update({ status });
      res.json(ResponseUtil.success(classItem, '状态更新成功'));
    } catch (error) {
      next(error);
    }
  }
}
