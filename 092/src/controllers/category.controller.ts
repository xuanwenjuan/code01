import { Request, Response, NextFunction } from 'express';
import sequelize from '../config/database';
import Category from '../models/category.model';
import Equipment from '../models/equipment.model';
import { ResponseUtil } from '../utils/response.util';
import { NotFoundException, BadRequestException } from '../common/http-exception';
import { CategoryStatus, EquipmentStatus } from '../common/enums';
import { OperationLogService } from '../services/operation-log.service';
import { Op, fn, col } from 'sequelize';

export const getCategoryTree = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { includeDiscontinued = 'false' } = req.query;

    const where: any = {};
    if (includeDiscontinued !== 'true') {
      where.status = CategoryStatus.ACTIVE;
    }

    const categories = await Category.findAll({
      where,
      order: [['sort', 'ASC'], ['id', 'ASC']],
    });

    const buildTree = (parentId: number | null): any[] => {
      return categories
        .filter((cat) => cat.parentId === parentId)
        .map((cat) => ({
          id: cat.id,
          name: cat.name,
          code: cat.code,
          parentId: cat.parentId,
          level: cat.level,
          sort: cat.sort,
          icon: cat.icon,
          description: cat.description,
          status: cat.status,
          children: buildTree(cat.id),
        }));
    };

    const tree = buildTree(null);
    res.json(ResponseUtil.success(tree));
  } catch (error) {
    next(error);
  }
};

export const getCategoryPath = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const findPath = async (categoryId: number, path: any[] = []): Promise<any[]> => {
      const category = await Category.findByPk(categoryId);
      if (!category) return path;

      path.unshift({
        id: category.id,
        name: category.name,
        code: category.code,
      });

      if (category.parentId) {
        return findPath(category.parentId, path);
      }

      return path;
    };

    const path = await findPath(Number(id));
    res.json(ResponseUtil.success(path));
  } catch (error) {
    next(error);
  }
};

export const getCategoryChildren = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { parentId } = req.params;

    const categories = await Category.findAll({
      where: { parentId: parentId === 'root' ? null : parentId },
      order: [['sort', 'ASC'], ['id', 'ASC']],
    });

    res.json(ResponseUtil.success(categories));
  } catch (error) {
    next(error);
  }
};

export const getCategoryList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, pageSize = 10, name, code, status } = req.query;

    const where: any = {};
    if (name) {
      where.name = { [Op.like]: `%${name}%` };
    }
    if (code) {
      where.code = { [Op.like]: `%${code}%` };
    }
    if (status) {
      where.status = status;
    }

    const { count, rows } = await Category.findAndCountAll({
      where,
      order: [['sort', 'ASC'], ['id', 'ASC']],
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize),
    });

    res.json(ResponseUtil.page(rows, count, Number(page), Number(pageSize)));
  } catch (error) {
    next(error);
  }
};

export const getCategoryById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const category = await Category.findByPk(id);

    if (!category) {
      return next(new NotFoundException('分类不存在'));
    }

    res.json(ResponseUtil.success(category));
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  const transaction = await sequelize.transaction();

  try {
    const { name, code, parentId, sort, icon, description, status } = req.body;

    const existingCode = await Category.findOne({ where: { code }, transaction });
    if (existingCode) {
      await transaction.rollback();
      return next(new BadRequestException('分类编码已存在'));
    }

    let level = 1;
    if (parentId) {
      const parent = await Category.findByPk(parentId, { transaction });
      if (!parent) {
        await transaction.rollback();
        return next(new BadRequestException('父分类不存在'));
      }
      level = parent.level + 1;
    }

    const category = await Category.create({
      name,
      code,
      parentId: parentId || null,
      level,
      sort: sort || 0,
      icon,
      description,
      status: status || CategoryStatus.ACTIVE,
    }, { transaction });

    await OperationLogService.createLogWithTransaction(
      req.user!,
      {
        module: 'category',
        operation: 'create',
        recordId: category.id,
        afterData: category.toJSON(),
        changes: ['创建分类'],
      },
      transaction,
      req.ip
    );

    await transaction.commit();
    res.json(ResponseUtil.created(category));
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { name, code, parentId, sort, icon, description, status } = req.body;

    const category = await Category.findByPk(id, { transaction });
    if (!category) {
      await transaction.rollback();
      return next(new NotFoundException('分类不存在'));
    }

    const beforeData = category.toJSON();

    if (code && code !== category.code) {
      const existingCode = await Category.findOne({ where: { code }, transaction });
      if (existingCode) {
        await transaction.rollback();
        return next(new BadRequestException('分类编码已存在'));
      }
    }

    let level = category.level;
    if (parentId !== undefined && parentId !== category.parentId) {
      if (parentId) {
        const parent = await Category.findByPk(parentId, { transaction });
        if (!parent) {
          await transaction.rollback();
          return next(new BadRequestException('父分类不存在'));
        }
        level = parent.level + 1;
      } else {
        level = 1;
      }
    }

    await category.update({
      name,
      code,
      parentId: parentId || null,
      level,
      sort,
      icon,
      description,
      status,
    }, { transaction });

    await OperationLogService.createLogWithTransaction(
      req.user!,
      {
        module: 'category',
        operation: 'update',
        recordId: category.id,
        beforeData,
        afterData: category.toJSON(),
        changes: ['更新分类'],
      },
      transaction,
      req.ip
    );

    await transaction.commit();
    res.json(ResponseUtil.updated(category));
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;

    const category = await Category.findByPk(id, { transaction });
    if (!category) {
      await transaction.rollback();
      return next(new NotFoundException('分类不存在'));
    }

    const beforeData = category.toJSON();

    const hasChildren = await Category.count({ where: { parentId: id }, transaction });
    if (hasChildren > 0) {
      await transaction.rollback();
      return next(new BadRequestException('请先删除子分类'));
    }

    const hasEquipments = await Equipment.count({ where: { categoryId: id }, transaction });
    if (hasEquipments > 0) {
      await transaction.rollback();
      return next(new BadRequestException('该分类下存在设备，无法删除'));
    }

    await category.destroy({ transaction });

    await OperationLogService.createLogWithTransaction(
      req.user!,
      {
        module: 'category',
        operation: 'delete',
        recordId: category.id,
        beforeData,
        changes: ['删除分类'],
      },
      transaction,
      req.ip
    );

    await transaction.commit();
    res.json(ResponseUtil.deleted('删除成功'));
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

export const getCategoryStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await Category.findAll({
      attributes: [
        'id', 'name', 'code', 'status',
        [fn('COUNT', col('equipments.id')), 'equipmentCount'],
      ],
      include: [
        {
          model: Equipment,
          as: 'equipments',
          attributes: [],
          required: false,
          where: {
            status: { [Op.ne]: EquipmentStatus.SCRAPPED },
          },
        },
      ],
      group: ['Category.id'],
      order: [['sort', 'ASC']],
    });

    res.json(ResponseUtil.success(stats));
  } catch (error) {
    next(error);
  }
};
