import { Request, Response } from 'express';
import { ReagentCategory, sequelize } from '../models';
import { ResponseUtil } from '../utils/response';
import { TreeBuilder } from '../utils/treeBuilder';
import { NotFoundException, BadRequestException } from '../exceptions/HttpException';
import { OperationLogger } from '../utils/operationLogger';

export class CategoryController {
  private static async validateParentHierarchy(parentId: number | null, currentId?: number): Promise<void> {
    if (!parentId) return;

    const parent = await ReagentCategory.findByPk(parentId);
    if (!parent) {
      throw new NotFoundException('父分类不存在');
    }

    if (!parent.status) {
      throw new BadRequestException('父分类已停用，无法作为上级');
    }

    if (currentId) {
      const allCategories = await ReagentCategory.findAll({
        attributes: ['id', 'parentId']
      });
      
      const categoriesMap = allCategories.map(c => c.toJSON());
      
      let checkId = parentId;
      const visited = new Set<number>();
      
      while (checkId) {
        if (visited.has(checkId)) {
          throw new BadRequestException('检测到循环引用，无法设置该父分类');
        }
        visited.add(checkId);
        
        if (checkId === currentId) {
          throw new BadRequestException('不能将自己或子分类设置为父分类');
        }
        
        const category = categoriesMap.find(c => c.id === checkId);
        checkId = category?.parentId || 0;
      }
    }
  }

  private static async buildTreeOptimized(type?: string, status?: boolean): Promise<any[]> {
    const where: any = {};
    if (type) where.type = type;
    if (status !== undefined) where.status = status;

    const categories = await ReagentCategory.findAll({
      where,
      order: [['sortOrder', 'ASC'], ['createdAt', 'DESC']],
      raw: true
    });

    return TreeBuilder.buildTree(categories);
  }

  static async create(req: Request, res: Response) {
    const { name, code, type, parentId, sortOrder, description } = req.body;

    await this.validateParentHierarchy(parentId || null);

    const existing = await ReagentCategory.findOne({ where: { code } });
    if (existing) {
      throw new BadRequestException('分类编码已存在');
    }

    const category = await ReagentCategory.create({
      name,
      code,
      type,
      parentId: parentId || null,
      sortOrder: sortOrder || 0,
      description,
      status: true
    });

    await OperationLogger.create(req, 'category', category.id, `创建分类: ${name}`);

    return ResponseUtil.success(res, category, '创建成功');
  }

  static async update(req: Request, res: Response) {
    const { id } = req.params;
    const { name, code, type, parentId, sortOrder, description } = req.body;

    const category = await ReagentCategory.findByPk(id);
    if (!category) {
      throw new NotFoundException('分类不存在');
    }

    if (parentId !== undefined) {
      await this.validateParentHierarchy(parentId || null, parseInt(id));
    }

    if (code && code !== category.code) {
      const existing = await ReagentCategory.findOne({ where: { code } });
      if (existing) {
        throw new BadRequestException('分类编码已存在');
      }
    }

    const beforeData = category.toJSON();
    await category.update({
      name,
      code,
      type,
      parentId: parentId !== undefined ? parentId : category.parentId,
      sortOrder: sortOrder !== undefined ? sortOrder : category.sortOrder,
      description: description !== undefined ? description : category.description
    });

    await OperationLogger.update(req, 'category', category.id, `更新分类: ${name || category.name}`, beforeData, category.toJSON());

    return ResponseUtil.success(res, category, '更新成功');
  }

  static async toggleStatus(req: Request, res: Response) {
    const { id } = req.params;

    const category = await ReagentCategory.findByPk(id);
    if (!category) {
      throw new NotFoundException('分类不存在');
    }

    const newStatus = !category.status;

    if (newStatus === false) {
      const hasChildren = await ReagentCategory.count({ where: { parentId: id, status: true } });
      if (hasChildren > 0) {
        throw new BadRequestException('该分类下存在启用的子分类，无法停用');
      }
    }

    const beforeData = category.toJSON();
    await category.update({ status: newStatus });

    await OperationLogger.update(
      req,
      'category',
      category.id,
      `${newStatus ? '启用' : '停用'}分类: ${category.name}`,
      beforeData,
      category.toJSON()
    );

    return ResponseUtil.success(res, category, '状态更新成功');
  }

  static async getTree(req: Request, res: Response) {
    const { type, status } = req.query;

    const tree = await this.buildTreeOptimized(
      type as string | undefined,
      status !== undefined ? status === 'true' : undefined
    );

    return ResponseUtil.success(res, tree, '查询成功');
  }

  static async getById(req: Request, res: Response) {
    const { id } = req.params;

    const category = await ReagentCategory.findByPk(id);
    if (!category) {
      throw new NotFoundException('分类不存在');
    }

    return ResponseUtil.success(res, category, '查询成功');
  }

  static async getList(req: Request, res: Response) {
    const { type, status } = req.query;

    const where: any = {};
    if (type) where.type = type;
    if (status !== undefined) where.status = status === 'true';

    const categories = await ReagentCategory.findAll({
      where,
      order: [['sortOrder', 'ASC'], ['createdAt', 'DESC']]
    });

    return ResponseUtil.success(res, categories, '查询成功');
  }

  static async getChildren(req: Request, res: Response) {
    const { parentId } = req.params;

    const categories = await ReagentCategory.findAll({
      where: { parentId: parentId === '0' ? null : parentId },
      order: [['sortOrder', 'ASC'], ['createdAt', 'DESC']]
    });

    return ResponseUtil.success(res, categories, '查询成功');
  }

  static async getPath(req: Request, res: Response) {
    const { id } = req.params;

    const category = await ReagentCategory.findByPk(id);
    if (!category) {
      throw new NotFoundException('分类不存在');
    }

    const path: any[] = [];
    let currentId: number | null = parseInt(id);

    while (currentId) {
      const cat = await ReagentCategory.findByPk(currentId, { raw: true });
      if (cat) {
        path.unshift({ id: cat.id, name: cat.name, code: cat.code });
        currentId = cat.parentId;
      } else {
        break;
      }
    }

    return ResponseUtil.success(res, path, '查询成功');
  }
}
