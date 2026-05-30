import { ForageCategory, ForageInventory } from '../models';
import { BusinessException } from '../utils/response';
import { ForageCategoryType, ForageStatus } from '../constants';
import sequelize from 'sequelize';

export interface CreateCategoryDto {
  name: string;
  code: string;
  type: ForageCategoryType;
  parentId?: number;
  level?: number;
  sortOrder?: number;
  description?: string;
  unit?: string;
}

export interface UpdateCategoryDto extends Partial<CreateCategoryDto> {
  status?: ForageStatus;
}

class ForageService {
  async createCategory(createDto: CreateCategoryDto) {
    const existingCategory = await ForageCategory.findOne({ where: { code: createDto.code } });
    if (existingCategory) {
      throw new BusinessException('类目编码已存在', 400);
    }

    if (createDto.parentId) {
      const parentCategory = await ForageCategory.findByPk(createDto.parentId);
      if (!parentCategory) {
        throw new BusinessException('父级类目不存在', 400);
      }
      createDto.level = parentCategory.level + 1;
    }

    const category = await ForageCategory.create({
      ...createDto,
      status: ForageStatus.ACTIVE
    });

    await ForageInventory.create({
      categoryId: category.id,
      quantity: 0,
      reservedQuantity: 0
    });

    return category;
  }

  async getCategoryTree(type?: ForageCategoryType) {
    const where: any = {};
    if (type) {
      where.type = type;
    }

    const allCategories = await ForageCategory.findAll({
      where,
      order: [['sortOrder', 'ASC'], ['name', 'ASC']],
      raw: true
    });

    const categoryMap = new Map<number, any>();
    const rootCategories: any[] = [];

    for (const category of allCategories) {
      categoryMap.set(category.id, { ...category, children: [] });
    }

    for (const category of allCategories) {
      const node = categoryMap.get(category.id)!;
      if (category.parentId === null) {
        rootCategories.push(node);
      } else {
        const parent = categoryMap.get(category.parentId);
        if (parent) {
          parent.children.push(node);
        }
      }
    }

    const filterEmptyChildren = (nodes: any[]) => {
      for (const node of nodes) {
        if (node.children.length === 0) {
          delete node.children;
        } else {
          filterEmptyChildren(node.children);
        }
      }
      return nodes;
    };

    return filterEmptyChildren(rootCategories);
  }

  async getCategories(page: number = 1, pageSize: number = 10, type?: ForageCategoryType, status?: ForageStatus) {
    const where: any = {};
    if (type) where.type = type;
    if (status) where.status = status;

    const { count, rows } = await ForageCategory.findAndCountAll({
      where,
      include: [{ model: ForageInventory, as: 'inventory' }],
      limit: pageSize,
      offset: (page - 1) * pageSize,
      order: [['sortOrder', 'ASC'], ['createdAt', 'DESC']]
    });

    return {
      list: rows,
      total: count,
      page,
      pageSize,
      totalPages: Math.ceil(count / pageSize)
    };
  }

  async getCategoryById(id: number) {
    const category = await ForageCategory.findByPk(id, {
      include: [{ model: ForageInventory, as: 'inventory' }]
    });
    
    if (!category) {
      throw new BusinessException('类目不存在', 404);
    }

    return category;
  }

  async updateCategory(id: number, updateDto: UpdateCategoryDto) {
    const category = await ForageCategory.findByPk(id);
    if (!category) {
      throw new BusinessException('类目不存在', 404);
    }

    if (updateDto.code && updateDto.code !== category.code) {
      const existingCategory = await ForageCategory.findOne({ where: { code: updateDto.code } });
      if (existingCategory) {
        throw new BusinessException('类目编码已存在', 400);
      }
    }

    if (updateDto.parentId !== undefined) {
      if (updateDto.parentId === id) {
        throw new BusinessException('不能将自己设为父级类目', 400);
      }
      
      if (updateDto.parentId) {
        const parentCategory = await ForageCategory.findByPk(updateDto.parentId);
        if (!parentCategory) {
          throw new BusinessException('父级类目不存在', 400);
        }
        updateDto.level = parentCategory.level + 1;
      } else {
        updateDto.level = 1;
      }
    }

    await category.update(updateDto);
    return this.getCategoryById(id);
  }

  async deleteCategory(id: number) {
    const category = await ForageCategory.findByPk(id);
    if (!category) {
      throw new BusinessException('类目不存在', 404);
    }

    const childCount = await ForageCategory.count({ where: { parentId: id } });
    if (childCount > 0) {
      throw new BusinessException('存在子类目，无法删除', 400);
    }

    const t = await ForageCategory.sequelize!.transaction();
    try {
      await ForageInventory.destroy({ where: { categoryId: id }, transaction: t });
      await category.destroy({ transaction: t });
      await t.commit();
    } catch (error) {
      await t.rollback();
      throw error;
    }

    return null;
  }

  async updateInventory(id: number, quantity: number, unitPrice?: number) {
    const t = await ForageCategory.sequelize!.transaction();
    
    try {
      const category = await ForageCategory.findByPk(id, { transaction: t });
      if (!category) {
        throw new BusinessException('饲草料类目不存在', 404);
      }

      if (category.status === 'obsolete' && quantity > 0) {
        throw new BusinessException('该类目已淘汰，禁止入库', 400);
      }

      if (category.status === 'inactive' && quantity > 0) {
        throw new BusinessException('该类目已停用，禁止入库', 400);
      }

      const inventory = await ForageInventory.findOne({ 
        where: { categoryId: id },
        transaction: t
      });
      if (!inventory) {
        throw new BusinessException('库存记录不存在', 404);
      }

      if (quantity < 0 && (inventory.quantity as number) + quantity < 0) {
        throw new BusinessException('库存不足，无法出库', 400);
      }

      await inventory.update({
        quantity: sequelize.literal(`quantity + ${quantity}`) as any,
        unitPrice: unitPrice || inventory.unitPrice,
        totalValue: sequelize.literal(`(quantity + ${quantity}) * COALESCE(unitPrice, ${unitPrice || 0})`) as any,
        lastInboundDate: quantity > 0 ? new Date() : inventory.lastInboundDate,
        lastOutboundDate: quantity < 0 ? new Date() : inventory.lastOutboundDate
      }, { transaction: t });

      await t.commit();
      return inventory.reload();
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }
}

export const forageService = new ForageService();
