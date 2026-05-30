import { Op, Transaction } from 'sequelize';
import sequelize from '../config/database';
import { MaterialCategoryType } from '../constants/material.constants';
import { BadRequestException, NotFoundException } from '../exceptions/base.exception';
import MaterialCategory, { IMaterialCategoryAttributes } from '../models/material-category.model';

export interface CreateCategoryDto {
  name: string;
  code: string;
  type: MaterialCategoryType;
  parentId?: number;
  sortOrder?: number;
  description?: string;
}

export interface UpdateCategoryDto {
  name?: string;
  code?: string;
  type?: MaterialCategoryType;
  parentId?: number;
  sortOrder?: number;
  description?: string;
  isActive?: boolean;
  isSealed?: boolean;
}

export interface CategoryQueryDto {
  type?: MaterialCategoryType;
  isActive?: boolean;
  isSealed?: boolean;
  parentId?: number;
  flat?: boolean;
}

class CategoryService {
  async create(createDto: CreateCategoryDto, userId: number): Promise<MaterialCategory> {
    const existing = await MaterialCategory.findOne({ where: { code: createDto.code } });
    if (existing) {
      throw new BadRequestException('类目编码已存在');
    }

    let level = 1;
    if (createDto.parentId) {
      const parent = await MaterialCategory.findByPk(createDto.parentId);
      if (!parent) {
        throw new NotFoundException('父级类目不存在');
      }
      level = parent.level + 1;
    }

    return await MaterialCategory.create({
      ...createDto,
      level,
      isActive: true,
      isSealed: false,
    });
  }

  async findAll(query?: CategoryQueryDto): Promise<MaterialCategory[]> {
    const where: any = {};
    if (query?.type) where.type = query.type;
    if (query?.isActive !== undefined) where.isActive = query.isActive;
    if (query?.isSealed !== undefined) where.isSealed = query.isSealed;
    if (query?.parentId !== undefined) where.parentId = query.parentId;

    const categories = await MaterialCategory.findAll({
      where,
      order: [['sortOrder', 'ASC'], ['id', 'ASC']],
    });

    if (query?.flat) {
      return categories;
    }

    return this.buildTree(categories);
  }

  async getCategoryChain(id: number): Promise<MaterialCategory[]> {
    const chain: MaterialCategory[] = [];
    let currentId: number | null = id;

    while (currentId) {
      const category = await MaterialCategory.findByPk(currentId);
      if (category) {
        chain.unshift(category);
        currentId = category.parentId || null;
      } else {
        break;
      }
    }

    return chain;
  }

  async getAllChildIds(parentId: number): Promise<number[]> {
    const childIds: number[] = [];
    const children = await MaterialCategory.findAll({ where: { parentId } });

    for (const child of children) {
      childIds.push(child.id);
      const grandChildIds = await this.getAllChildIds(child.id);
      childIds.push(...grandChildIds);
    }

    return childIds;
  }

  async findOne(id: number): Promise<MaterialCategory> {
    const category = await MaterialCategory.findByPk(id, {
      include: [{ model: MaterialCategory, as: 'children' }],
    });
    if (!category) {
      throw new NotFoundException('类目不存在');
    }
    return category;
  }

  async update(id: number, updateDto: UpdateCategoryDto): Promise<MaterialCategory> {
    const category = await this.findOne(id);

    if (updateDto.code) {
      const existing = await MaterialCategory.findOne({
        where: { code: updateDto.code, id: { [Op.ne]: id } },
      });
      if (existing) {
        throw new BadRequestException('类目编码已存在');
      }
    }

    if (updateDto.parentId !== undefined) {
      if (updateDto.parentId === id) {
        throw new BadRequestException('不能将自己设为父级类目');
      }

      if (updateDto.parentId) {
        const parent = await MaterialCategory.findByPk(updateDto.parentId);
        if (!parent) {
          throw new NotFoundException('父级类目不存在');
        }
        updateDto['level'] = parent.level + 1;
      } else {
        updateDto['level'] = 1;
      }
    }

    await category.update(updateDto);
    return category;
  }

  async remove(id: number): Promise<void> {
    const category = await this.findOne(id);

    const childCount = await MaterialCategory.count({ where: { parentId: id } });
    if (childCount > 0) {
      throw new BadRequestException('该类目下存在子类目，无法删除');
    }

    await category.destroy();
  }

  async toggleSeal(id: number, isSealed: boolean): Promise<MaterialCategory> {
    const category = await this.findOne(id);
    await category.update({ isSealed });
    return category;
  }

  async updateSortOrder(ids: number[]): Promise<void> {
    await sequelize.transaction(async (t: Transaction) => {
      for (let i = 0; i < ids.length; i++) {
        await MaterialCategory.update(
          { sortOrder: i },
          { where: { id: ids[i] }, transaction: t }
        );
      }
    });
  }

  private buildTree(categories: MaterialCategory[]): MaterialCategory[] {
    const categoryMap = new Map<number, any>();
    const roots: MaterialCategory[] = [];

    categories.forEach((category) => {
      categoryMap.set(category.id, { ...category.toJSON(), children: [] });
    });

    categories.forEach((category) => {
      const node = categoryMap.get(category.id);
      if (category.parentId && categoryMap.has(category.parentId)) {
        categoryMap.get(category.parentId).children.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }
}

export default new CategoryService();
