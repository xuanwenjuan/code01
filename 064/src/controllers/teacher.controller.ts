import { Request, Response, NextFunction } from 'express';
import { Op } from 'sequelize';
import { Teacher, Class } from '../models';
import { ResponseUtil } from '../utils/response';
import { BadRequestException, NotFoundException, ForbiddenException } from '../exceptions/HttpException';
import { createTeacherSchema, updateTeacherSchema, getTeacherListSchema } from '../validations/teacher.validation';
import { TeacherStatus, TeacherType, ITeacherQueryParams } from '../types';
import { PermissionGuard } from '../middlewares/auth';

export class TeacherController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user || !PermissionGuard.canManageTeachers(req.user.role)) {
        throw new ForbiddenException('权限不足，无法创建讲师');
      }

      const { error, value } = createTeacherSchema.validate(req.body);
      if (error) {
        throw new BadRequestException(error.message);
      }

      const existingTeacher = await Teacher.findOne({ where: { phone: value.phone } });
      if (existingTeacher) {
        throw new BadRequestException('该手机号已被使用');
      }

      const teacher = await Teacher.create({
        ...value,
        status: TeacherStatus.ON_DUTY
      });

      res.status(201).json(ResponseUtil.created(teacher, '讲师创建成功'));
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user || !PermissionGuard.canManageTeachers(req.user.role)) {
        throw new ForbiddenException('权限不足，无法更新讲师信息');
      }

      const { id } = req.params;
      const { error, value } = updateTeacherSchema.validate(req.body);
      if (error) {
        throw new BadRequestException(error.message);
      }

      const teacher = await Teacher.findByPk(id);
      if (!teacher) {
        throw new NotFoundException('讲师不存在');
      }

      if (value.phone && value.phone !== teacher.phone) {
        const existingTeacher = await Teacher.findOne({ where: { phone: value.phone } });
        if (existingTeacher) {
          throw new BadRequestException('该手机号已被使用');
        }
      }

      await teacher.update(value);
      res.json(ResponseUtil.success(teacher, '讲师信息更新成功'));
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user || !PermissionGuard.canManageTeachers(req.user.role)) {
        throw new ForbiddenException('权限不足，无法删除讲师');
      }

      const { id } = req.params;
      const teacher = await Teacher.findByPk(id);
      if (!teacher) {
        throw new NotFoundException('讲师不存在');
      }

      const hasClasses = await Class.count({ where: { teacherId: id } });
      if (hasClasses > 0) {
        throw new BadRequestException('该讲师还有关联班级，无法删除');
      }

      await teacher.destroy();
      res.json(ResponseUtil.success(null, '讲师删除成功'));
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const teacher = await Teacher.findByPk(id, {
        include: [{ model: Class, as: 'classes' }]
      });
      
      if (!teacher) {
        throw new NotFoundException('讲师不存在');
      }

      res.json(ResponseUtil.success(teacher));
    } catch (error) {
      next(error);
    }
  }

  static async getList(req: Request, res: Response, next: NextFunction) {
    try {
      const { error, value } = getTeacherListSchema.validate(req.query);
      if (error) {
        throw new BadRequestException(error.message);
      }

      const {
        page = 1,
        pageSize = 10,
        status,
        type,
        majorId,
        keyword
      } = value as ITeacherQueryParams;

      const where: any = {};
      
      if (status) {
        where.status = status;
      }
      if (type) {
        where.type = type;
      }
      
      if (keyword) {
        where[Op.or] = [
          { name: { [Op.like]: `%${keyword}%` } },
          { phone: { [Op.like]: `%${keyword}%` } }
        ];
      }

      if (majorId) {
        where.teachingMajorIds = {
          [Op.or]: [
            { [Op.like]: `%${majorId}%` },
            { [Op.like]: `${majorId},%` },
            { [Op.like]: `%,${majorId}` },
            { [Op.like]: `%,${majorId},%` }
          ]
        };
      }

      const { count, rows } = await Teacher.findAndCountAll({
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
      if (!req.user || !PermissionGuard.canManageTeachers(req.user.role)) {
        throw new ForbiddenException('权限不足，无法更新讲师状态');
      }

      const { id } = req.params;
      const { status } = req.body;

      if (!Object.values(TeacherStatus).includes(status)) {
        throw new BadRequestException('状态值不正确');
      }

      const teacher = await Teacher.findByPk(id);
      if (!teacher) {
        throw new NotFoundException('讲师不存在');
      }

      await teacher.update({ status });
      res.json(ResponseUtil.success(teacher, '讲师状态更新成功'));
    } catch (error) {
      next(error);
    }
  }

  static async getAvailableTeachers(req: Request, res: Response, next: NextFunction) {
    try {
      const { majorId } = req.query;
      
      const where: any = {
        status: TeacherStatus.ON_DUTY
      };

      if (majorId) {
        where[Op.and] = [
          {
            [Op.or]: [
              { teachingMajorIds: { [Op.like]: `%${majorId}%` } },
              { teachingMajorIds: null },
              { teachingMajorIds: '' }
            ]
          }
        ];
      }

      const teachers = await Teacher.findAll({
        where,
        attributes: ['id', 'name', 'phone', 'type', 'teachingMajorIds'],
        order: [['name', 'ASC']]
      });

      res.json(ResponseUtil.success(teachers));
    } catch (error) {
      next(error);
    }
  }
}
