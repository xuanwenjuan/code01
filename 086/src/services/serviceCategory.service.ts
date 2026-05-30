import { ServiceCategory, Order } from '../models';
import { ServiceCategoryStatus, OrderStatus } from '../types';
import { sequelize } from '../config/database';
import { NotFoundException, BadRequestException } from '../exceptions/HttpException';
import { Op } from 'sequelize';

export interface CreateServiceCategoryDto {
  name: string;
  parentId?: string;
  description?: string;
  icon?: string;
  sortOrder?: number;
  commissionRate?: number;
  basePrice?: number;
  unit?: string;
}

export interface UpdateServiceCategoryDto {
  name?: string;
  parentId?: string;
  description?: string;
  icon?: string;
  sortOrder?: number;
  status?: ServiceCategoryStatus;
  commissionRate?: number;
  basePrice?: number;
  unit?: string;
}

class ServiceCategoryService {
  async createCategory(createDto: CreateServiceCategoryDto) {
    if (createDto.parentId) {
      const parent = await ServiceCategory.findByPk(createDto.parentId);
      if (!parent) {
        throw new NotFoundException('父级类目不存在');
      }
      if (parent.status !== ServiceCategoryStatus.ACTIVE) {
        throw new BadRequestException('父级类目已下线，不能添加子类目');
      }
    }

    const category = await ServiceCategory.create({
      ...createDto,
      status: ServiceCategoryStatus.ACTIVE
    });

    return category;
  }

  async updateCategory(id: string, updateDto: UpdateServiceCategoryDto) {
    const category = await ServiceCategory.findByPk(id);
    if (!category) {
      throw new NotFoundException('类目不存在');
    }

    if (updateDto.parentId && updateDto.parentId === id) {
      throw new BadRequestException('不能将自己设为父级');
    }

    if (updateDto.parentId) {
      const parent = await ServiceCategory.findByPk(updateDto.parentId);
      if (!parent) {
        throw new NotFoundException('父级类目不存在');
      }
      if (parent.status !== ServiceCategoryStatus.ACTIVE) {
        throw new BadRequestException('父级类目已下线，不能移动到该类目下');
      }
    }

    if (updateDto.status === ServiceCategoryStatus.INACTIVE && category.status === ServiceCategoryStatus.ACTIVE) {
      await this.validateCategoryDeactivation(id);
    }

    await category.update(updateDto);
    return category;
  }

  async deleteCategory(id: string) {
    const category = await ServiceCategory.findByPk(id);
    if (!category) {
      throw new NotFoundException('类目不存在');
    }

    const hasChildren = await ServiceCategory.count({ where: { parentId: id } });
    if (hasChildren > 0) {
      throw new BadRequestException('请先删除或移动子类目');
    }

    const hasActiveOrders = await Order.count({
      where: {
        serviceCategoryId: id,
        status: {
          [Op.in]: [
            OrderStatus.PENDING_PAYMENT,
            OrderStatus.PENDING_ASSIGN,
            OrderStatus.ASSIGNED,
            OrderStatus.WORKER_ON_WAY,
            OrderStatus.IN_SERVICE
          ]
        }
      }
    });

    if (hasActiveOrders > 0) {
      throw new BadRequestException('该类目下有进行中的订单，无法删除');
    }

    await category.destroy();
    return true;
  }

  async getCategoryById(id: string) {
    const category = await ServiceCategory.findByPk(id, {
      include: [{ association: 'parent' }]
    });
    
    if (!category) {
      throw new NotFoundException('类目不存在');
    }

    return category;
  }

  async getCategoryTree(status?: ServiceCategoryStatus, includeChildren: boolean = true) {
    const where: any = {};
    if (status) {
      where.status = status;
    }

    const categories = await ServiceCategory.findAll({
      where,
      order: [['sortOrder', 'ASC'], ['createdAt', 'DESC']]
    });

    if (includeChildren) {
      return this.buildTreeRecursive(categories);
    }

    return categories;
  }

  async getCategoryList(
    parentId?: string,
    status?: ServiceCategoryStatus,
    page: number = 1,
    pageSize: number = 10
  ) {
    const where: any = {};
    
    if (parentId !== undefined) {
      where.parentId = parentId || null;
    }
    if (status) {
      where.status = status;
    }

    const { count, rows } = await ServiceCategory.findAndCountAll({
      where,
      include: [{ association: 'parent' }],
      order: [['sortOrder', 'ASC'], ['createdAt', 'DESC']],
      offset: (page - 1) * pageSize,
      limit: pageSize
    });

    return {
      list: rows,
      total: count,
      page,
      pageSize
    };
  }

  async updateSortOrder(id: string, sortOrder: number) {
    const category = await ServiceCategory.findByPk(id);
    if (!category) {
      throw new NotFoundException('类目不存在');
    }

    await category.update({ sortOrder });
    return category;
  }

  async getActiveLeafCategories() {
    const categories = await ServiceCategory.findAll({
      where: { status: ServiceCategoryStatus.ACTIVE },
      order: [['sortOrder', 'ASC']]
    });

    const tree = this.buildTreeRecursive(categories);
    return this.extractLeafCategories(tree);
  }

  private async validateCategoryDeactivation(categoryId: string) {
    const hasActiveOrders = await Order.count({
      where: {
        serviceCategoryId: categoryId,
        status: {
          [Op.in]: [
            OrderStatus.PENDING_PAYMENT,
            OrderStatus.PENDING_ASSIGN,
            OrderStatus.ASSIGNED,
            OrderStatus.WORKER_ON_WAY,
            OrderStatus.IN_SERVICE
          ]
        }
      }
    });

    if (hasActiveOrders > 0) {
      throw new BadRequestException('该类目下有进行中的订单，无法下线');
    }

    const childIds = await this.getAllChildCategoryIds(categoryId);
    if (childIds.length > 0) {
      const hasChildActiveOrders = await Order.count({
        where: {
          serviceCategoryId: { [Op.in]: childIds },
          status: {
            [Op.in]: [
              OrderStatus.PENDING_PAYMENT,
              OrderStatus.PENDING_ASSIGN,
              OrderStatus.ASSIGNED,
              OrderStatus.WORKER_ON_WAY,
              OrderStatus.IN_SERVICE
            ]
          }
        }
      });

      if (hasChildActiveOrders > 0) {
        throw new BadRequestException('该类目下的子类目有进行中的订单，无法下线');
      }
    }
  }

  private async getAllChildCategoryIds(parentId: string): Promise<string[]> {
    const children = await ServiceCategory.findAll({
      where: { parentId },
      attributes: ['id']
    });

    const childIds: string[] = [];
    
    for (const child of children) {
      childIds.push(child.id);
      const grandChildren = await this.getAllChildCategoryIds(child.id);
      childIds.push(...grandChildren);
    }

    return childIds;
  }

  private buildTreeRecursive(categories: ServiceCategory[]): any[] {
    const tree: any[] = [];
    const lookup: Record<string, any> = {};

    categories.forEach(category => {
      lookup[category.id] = { ...category.toJSON(), children: [] };
    });

    categories.forEach(category => {
      if (category.parentId && lookup[category.parentId]) {
        lookup[category.parentId].children.push(lookup[category.id]);
      } else if (!category.parentId) {
        tree.push(lookup[category.id]);
      }
    });

    return tree;
  }

  private extractLeafCategories(tree: any[]): any[] {
    const leaves: any[] = [];

    const extract = (nodes: any[]) => {
      nodes.forEach(node => {
        if (node.children && node.children.length > 0) {
          extract(node.children);
        } else {
          const { children, ...leaf } = node;
          leaves.push(leaf);
        }
      });
    };

    extract(tree);
    return leaves;
  }
}

export default new ServiceCategoryService();
