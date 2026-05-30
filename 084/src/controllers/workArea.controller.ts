import { Response, NextFunction } from 'express';
import WorkArea from '../models/WorkArea';
import Cleaner from '../models/Cleaner';
import WorkOrder, { WorkOrderStatus } from '../models/WorkOrder';
import ResponseUtil from '../utils/response';
import { NotFoundException, BadRequestException } from '../exceptions/AppException';
import { body, param } from 'express-validator';
import { AuthRequest } from '../middlewares/auth.middleware';
import { UserRole } from '../models/User';
import { Op, fn, col } from 'sequelize';

export const createValidation = [
  body('name').notEmpty().withMessage('区域名称不能为空'),
  body('areaType').isIn(['main_road', 'residential', 'commercial', 'park']).withMessage('无效的区域类型'),
  body('parentId').optional().isInt({ min: 1 }).withMessage('父级ID必须为正整数'),
  body('sort').optional().isInt({ min: 0 }).withMessage('排序必须为非负整数'),
  body('description').optional().isString().withMessage('描述必须为字符串'),
  body('status').optional().isIn(['active', 'suspended']).withMessage('无效的状态')
];

export const updateValidation = [
  param('id').isInt({ min: 1 }).withMessage('ID必须为正整数'),
  body('name').optional().notEmpty().withMessage('区域名称不能为空'),
  body('areaType').optional().isIn(['main_road', 'residential', 'commercial', 'park']).withMessage('无效的区域类型'),
  body('parentId').optional().isInt({ min: 1 }).withMessage('父级ID必须为正整数'),
  body('sort').optional().isInt({ min: 0 }).withMessage('排序必须为非负整数'),
  body('status').optional().isIn(['active', 'suspended']).withMessage('无效的状态'),
  body('description').optional().isString().withMessage('描述必须为字符串')
];

const buildTreeMap = (areas: any[]): Map<number | null, any[]> => {
  const map = new Map<number | null, any[]>();
  
  areas.forEach(area => {
    const parentId = area.parentId === null ? null : area.parentId;
    if (!map.has(parentId)) {
      map.set(parentId, []);
    }
    map.get(parentId)!.push(area);
  });
  
  return map;
};

const buildTreeFromMap = (map: Map<number | null, any[]>, parentId: number | null = null): any[] => {
  const children = map.get(parentId) || [];
  return children
    .sort((a, b) => a.sort - b.sort)
    .map(area => ({
      ...area.toJSON(),
      children: buildTreeFromMap(map, area.id)
    }));
};

export const getAllWorkAreas = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { tree = 'true', status, areaType, withStats } = req.query;

    const where: any = {};
    if (status) where.status = status;
    if (areaType) where.areaType = areaType;

    const includeOptions: any[] = [];
    if (withStats === 'true') {
      includeOptions.push(
        { model: WorkArea, as: 'children', attributes: [] }
      );
    }

    const areas = await WorkArea.findAll({
      where,
      include: includeOptions.length > 0 ? includeOptions : undefined,
      order: [['sort', 'ASC'], ['createdAt', 'DESC']],
      distinct: true
    });

    if (tree === 'true') {
      const treeMap = buildTreeMap(areas);
      const treeData = buildTreeFromMap(treeMap);
      ResponseUtil.success(res, treeData);
    } else {
      ResponseUtil.success(res, areas);
    }
  } catch (error) {
    next(error);
  }
};

export const getWorkAreaById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const area = await WorkArea.findByPk(id, {
      include: [{ model: WorkArea, as: 'children' }]
    });

    if (!area) {
      throw new NotFoundException('作业区域不存在');
    }

    ResponseUtil.success(res, area);
  } catch (error) {
    next(error);
  }
};

export const createWorkArea = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, parentId, areaType, sort, description } = req.body;

    let level = 1;
    if (parentId) {
      const parent = await WorkArea.findByPk(parentId);
      if (!parent) {
        throw new BadRequestException('父级区域不存在');
      }
      level = parent.level + 1;
    }

    const area = await WorkArea.create({
      name,
      parentId: parentId || null,
      areaType,
      level,
      sort: sort || 0,
      status: 'active',
      description
    });

    ResponseUtil.created(res, area, '作业区域创建成功');
  } catch (error) {
    next(error);
  }
};

export const updateWorkArea = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, parentId, areaType, sort, status, description } = req.body;

    const area = await WorkArea.findByPk(id);
    if (!area) {
      throw new NotFoundException('作业区域不存在');
    }

    let level = area.level;
    if (parentId !== undefined && parentId !== null) {
      const parent = await WorkArea.findByPk(parentId);
      if (!parent) {
        throw new BadRequestException('父级区域不存在');
      }
      if (parent.id === area.id) {
        throw new BadRequestException('不能将自己设为父级');
      }
      level = parent.level + 1;
    }

    await area.update({
      name,
      parentId: parentId !== undefined ? parentId || null : undefined,
      areaType,
      level,
      sort,
      status,
      description
    });

    ResponseUtil.success(res, area, '作业区域更新成功');
  } catch (error) {
    next(error);
  }
};

export const deleteWorkArea = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const area = await WorkArea.findByPk(id);
    if (!area) {
      throw new NotFoundException('作业区域不存在');
    }

    const childCount = await WorkArea.count({ where: { parentId: id } });
    if (childCount > 0) {
      throw new BadRequestException('该区域下有子区域，无法删除');
    }

    await area.destroy();
    ResponseUtil.success(res, null, '作业区域删除成功');
  } catch (error) {
    next(error);
  }
};

const getAllChildAreaIds = async (parentId: number): Promise<number[]> => {
  const children = await WorkArea.findAll({
    where: { parentId },
    attributes: ['id']
  });
  
  let ids: number[] = [parentId];
  for (const child of children) {
    const childIds = await getAllChildAreaIds(child.id);
    ids = [...ids, ...childIds];
  }
  return ids;
};

export const updateStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const area = await WorkArea.findByPk(id);
    if (!area) {
      throw new NotFoundException('作业区域不存在');
    }

    if (status === 'suspended') {
      const allAreaIds = await getAllChildAreaIds(id);
      
      const [cleanerCount, activeOrderCount] = await Promise.all([
        Cleaner.count({ where: { workAreaId: { [Op.in]: allAreaIds } } }),
        WorkOrder.count({ 
          where: { 
            workAreaId: { [Op.in]: allAreaIds },
            status: { [Op.notIn]: ['completed', 'reviewed'] }
          } 
        })
      ]);

      if (cleanerCount > 0) {
        throw new BadRequestException(`该区域及其子区域下共有${cleanerCount}名保洁人员，请先解除人员绑定后再停运`);
      }

      if (activeOrderCount > 0) {
        throw new BadRequestException(`该区域及其子区域下共有${activeOrderCount}个进行中的工单，请先处理完工单后再停运`);
      }
    }

    await area.update({ status });

    const statusText = status === 'active' ? '启用' : '停运';
    ResponseUtil.success(res, area, `作业区域${statusText}成功`);
  } catch (error) {
    next(error);
  }
};