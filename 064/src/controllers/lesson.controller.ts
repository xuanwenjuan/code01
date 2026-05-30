import { Request, Response, NextFunction } from 'express';
import { Op } from 'sequelize';
import { Lesson, Class, Teacher, MajorCategory, sequelize } from '../models';
import { ResponseUtil } from '../utils/response';
import { BadRequestException, NotFoundException } from '../exceptions/HttpException';
import { PaginatedParams } from '../types';

export class LessonController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { classId, teacherId, title, content, lessonDate, startTime, endTime, duration, classroom } = req.body;

      if (!classId || !teacherId || !title || !lessonDate || !startTime || !endTime) {
        throw new BadRequestException('必填项不能为空');
      }

      const classItem = await Class.findByPk(classId);
      if (!classItem) {
        throw new NotFoundException('班级不存在');
      }

      const teacher = await Teacher.findByPk(teacherId);
      if (!teacher) {
        throw new NotFoundException('讲师不存在');
      }

      const lesson = await Lesson.create({
        classId,
        teacherId,
        majorId: classItem.majorId,
        title,
        content,
        lessonDate,
        startTime,
        endTime,
        duration: duration || 0,
        classroom,
        isCompleted: false
      });

      res.status(201).json(ResponseUtil.created(lesson, '创建成功'));
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { title, content, lessonDate, startTime, endTime, duration, classroom, isCompleted } = req.body;

      const lesson = await Lesson.findByPk(id);
      if (!lesson) {
        throw new NotFoundException('课时不存在');
      }

      await lesson.update({
        title,
        content,
        lessonDate,
        startTime,
        endTime,
        duration,
        classroom,
        isCompleted
      });

      res.json(ResponseUtil.success(lesson, '更新成功'));
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const lesson = await Lesson.findByPk(id);
      if (!lesson) {
        throw new NotFoundException('课时不存在');
      }

      await lesson.destroy();
      res.json(ResponseUtil.success(null, '删除成功'));
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const lesson = await Lesson.findByPk(id, {
        include: [
          { model: Class, as: 'classInfo' },
          { model: Teacher, as: 'teacher' },
          { model: MajorCategory, as: 'major' }
        ]
      });
      
      if (!lesson) {
        throw new NotFoundException('课时不存在');
      }

      res.json(ResponseUtil.success(lesson));
    } catch (error) {
      next(error);
    }
  }

  static async getList(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = 1, pageSize = 10, classId, teacherId, startDate, endDate, isCompleted } = req.query as PaginatedParams & {
        classId?: string;
        teacherId?: string;
        startDate?: string;
        endDate?: string;
        isCompleted?: string;
      };

      const where: any = {};
      if (classId) {
        where.classId = classId;
      }
      if (teacherId) {
        where.teacherId = teacherId;
      }
      if (startDate && endDate) {
        where.lessonDate = {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        };
      }
      if (isCompleted !== undefined) {
        where.isCompleted = isCompleted === 'true';
      }

      const { count, rows } = await Lesson.findAndCountAll({
        where,
        include: [
          { model: Class, as: 'classInfo' },
          { model: Teacher, as: 'teacher' }
        ],
        order: [['lessonDate', 'ASC'], ['startTime', 'ASC']],
        limit: Number(pageSize),
        offset: (Number(page) - 1) * Number(pageSize)
      });

      res.json(ResponseUtil.paginated(rows, count, Number(page), Number(pageSize)));
    } catch (error) {
      next(error);
    }
  }

  static async complete(req: Request, res: Response, next: NextFunction) {
    const t = await sequelize.transaction();
    try {
      const { id } = req.params;

      const lesson = await Lesson.findByPk(id, { transaction: t });
      if (!lesson) {
        throw new NotFoundException('课时不存在');
      }

      if (lesson.isCompleted) {
        throw new BadRequestException('该课时已完成');
      }

      await lesson.update({ isCompleted: true }, { transaction: t });

      const classItem = await Class.findByPk(lesson.classId, { transaction: t });
      if (classItem) {
        await classItem.increment('completedHours', { 
          by: lesson.duration || 1,
          transaction: t
        });
      }

      await t.commit();
      res.json(ResponseUtil.success(lesson, '课时已完成'));
    } catch (error) {
      await t.rollback();
      next(error);
    }
  }
}
