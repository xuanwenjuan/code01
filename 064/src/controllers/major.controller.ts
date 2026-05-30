import { Request, Response, NextFunction } from 'express';
import { Op } from 'sequelize';
import { MajorCategory } from '../models';
import { ResponseUtil } from '../utils/response';
import { BadRequestException, NotFoundException } from '../exceptions/HttpException';
import { createMajorSchema, updateMajorSchema } from '../validations/major.validation';
import { PaginatedParams } from '../types';

export class MajorController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { error, value } = createMajorSchema.validate(req.body);
      if (error) {
        throw new BadRequestException(error.message);
      }

      if (value.parentId) {
        const parent = await MajorCategory.findByPk(value.parentId);
        if (!parent) {
          throw new BadRequestException('父级分类不存在');
        }
        value.level = parent.level + 1;
      }

      const major = await MajorCategory.create(value);
      res.status(201).json(ResponseUtil.created(major, '创建成功'));
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { error, value } = updateMajorSchema.validate(req.body);
      if (error) {
        throw new BadRequestException(error.message);
      }

      const major = await MajorCategory.findByPk(id);
      if (!major) {
        throw new NotFoundException('专业分类不存在');
      }

      if (value.parentId && value.parentId !== major.parentId) {
        const parent = await MajorCategory.findByPk(value.parentId);
        if (!parent) {
          throw new BadRequestException('父级分类不存在');
        }
        value.level = parent.level + 1;
      }

      await major.update(value);
      res.json(ResponseUtil.success(major, '更新成功'));
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const major = await MajorCategory.findByPk(id);
      if (!major) {
        throw new NotFoundException('专业分类不存在');
      }

      const hasChildren = await MajorCategory.count({ where: { parentId: id } });
      if (hasChildren > 0) {
        throw new BadRequestException('请先删除子分类');
      }

      await major.destroy();
      res.json(ResponseUtil.success(null, '删除成功'));
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const major = await MajorCategory.findByPk(id, {
        include: [{ model: MajorCategory, as: 'children' }]
      });
      
      if (!major) {
        throw new NotFoundException('专业分类不存在');
      }

      res.json(ResponseUtil.success(major));
    } catch (error) {
      next(error);
    }
  }

  static async getTree(req: Request, res: Response, next: NextFunction) {
    try {
      const { type, isActive, parentId: queryParentId } = req.query;
      const where: any = {};
      if (type) {
        where.type = type;
      }
      if (isActive !== undefined) {
        where.isActive = isActive === 'true';
      }

      const allMajors = await MajorCategory.findAll({
        where,
        order: [['sort', 'ASC'], ['id', 'ASC']]
      });

      const rootParentId = queryParentId ? Number(queryParentId) : null;

      const buildTree = (parentId: number | null, level: number = 1, maxLevel: number = 10): any[] => {
        if (level > maxLevel) return [];
        return allMajors
          .filter(m => m.parentId === parentId)
          .map(m => {
            const node = m.toJSON();
            node.children = buildTree(m.id, level + 1, maxLevel);
            node.hasChildren = node.children.length > 0;
            return node;
          });
      };

      const tree = buildTree(rootParentId);

      const getFlatIds = (nodes: any[]): number[] => {
        let ids: number[] = [];
        nodes.forEach(node => {
          ids.push(node.id);
          if (node.children && node.children.length > 0) {
            ids = ids.concat(getFlatIds(node.children));
          }
        });
        return ids;
      };

      res.json(ResponseUtil.success({
        tree,
        totalCount: allMajors.length,
        allIds: getFlatIds(tree)
      }));
    } catch (error) {
      next(error);
    }
  }

  static async getList(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = 1, pageSize = 10, type, isActive, keyword } = req.query as PaginatedParams & {
        type?: string;
        isActive?: string;
        keyword?: string;
      };

      const where: any = {};
      if (type) {
        where.type = type;
      }
      if (isActive !== undefined) {
        where.isActive = isActive === 'true';
      }
      if (keyword) {
        where.name = { [Op.like]: `%${keyword}%` };
      }

      const { count, rows } = await MajorCategory.findAndCountAll({
        where,
        order: [['sort', 'ASC'], ['id', 'DESC']],
        limit: Number(pageSize),
        offset: (Number(page) - 1) * Number(pageSize)
      });

      res.json(ResponseUtil.paginated(rows, count, Number(page), Number(pageSize)));
    } catch (error) {
      next(error);
    }
  }

  static async toggleStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const major = await MajorCategory.findByPk(id);
      
      if (!major) {
        throw new NotFoundException('专业分类不存在');
      }

      await major.update({ isActive: !major.isActive });
      res.json(ResponseUtil.success(major, '状态更新成功'));
    } catch (error) {
      next(error);
    }
  }
}
