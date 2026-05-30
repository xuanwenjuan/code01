import Branch, { BranchStatus, BranchType, BranchAttributes, BranchCreationAttributes } from '../models/Branch';
import Vehicle from '../models/Vehicle';
import Order from '../models/Order';
import { NotFoundError, BusinessError } from '../utils/errors';
import { Op, Transaction } from 'sequelize';
import sequelize from '../config/database';

class BranchService {
  private validateActiveBranch(branch: Branch, operation: string): void {
    if (branch.status === BranchStatus.INACTIVE || branch.status === BranchStatus.CLOSED) {
      throw new BusinessError(`${branch.name} 已${branch.status === BranchStatus.INACTIVE ? '停运' : '注销'}，${operation}`);
    }
  }

  private async checkCircularReference(branchId: number, parentId: number, t?: Transaction): Promise<boolean> {
    let currentParentId: number | null | undefined = parentId;
    const visited = new Set<number>();
    
    while (currentParentId) {
      if (visited.has(currentParentId)) return true;
      if (currentParentId === branchId) return true;
      
      visited.add(currentParentId);
      const parent = await Branch.findByPk(currentParentId, { transaction: t });
      if (!parent) break;
      currentParentId = parent.parentId;
    }
    return false;
  }

  async createBranch(data: BranchCreationAttributes): Promise<Branch> {
    if (data.parentId) {
      const parent = await Branch.findByPk(data.parentId);
      if (!parent) {
        throw new NotFoundError('上级网点不存在');
      }
      this.validateActiveBranch(parent, '无法作为上级网点');
    }

    const existing = await Branch.findOne({ where: { code: data.code } });
    if (existing) {
      throw new BusinessError('网点编码已存在');
    }

    return Branch.create(data);
  }

  async updateBranch(id: number, data: Partial<BranchAttributes>): Promise<Branch> {
    const branch = await Branch.findByPk(id);
    if (!branch) {
      throw new NotFoundError('网点不存在');
    }

    if (data.parentId && data.parentId === id) {
      throw new BusinessError('不能将自己设为上级网点');
    }

    if (data.parentId) {
      const parent = await Branch.findByPk(data.parentId);
      if (!parent) {
        throw new NotFoundError('上级网点不存在');
      }
      this.validateActiveBranch(parent, '无法作为上级网点');

      if (await this.checkCircularReference(id, data.parentId)) {
        throw new BusinessError('存在循环引用，无法绑定该上级网点');
      }
    }

    if (data.code) {
      const existing = await Branch.findOne({
        where: { code: data.code, id: { [Op.ne]: id } }
      });
      if (existing) {
        throw new BusinessError('网点编码已存在');
      }
    }

    await branch.update(data);
    return this.getBranchById(id);
  }

  async deleteBranch(id: number): Promise<void> {
    const t = await sequelize.transaction();
    try {
      const branch = await Branch.findByPk(id, { transaction: t });
      if (!branch) {
        throw new NotFoundError('网点不存在');
      }

      const children = await Branch.count({ where: { parentId: id }, transaction: t });
      if (children > 0) {
        throw new BusinessError('该网点下存在子网点，无法删除');
      }

      const vehicleCount = await Vehicle.count({ where: { branchId: id }, transaction: t });
      if (vehicleCount > 0) {
        throw new BusinessError('该网点下存在挂靠车辆，无法删除');
      }

      const orderCount = await Order.count({
        where: {
          [Op.or]: [{ shipperBranchId: id }, { receiverBranchId: id }]
        },
        transaction: t
      });
      if (orderCount > 0) {
        throw new BusinessError('该网点下存在关联订单，无法删除');
      }

      await branch.destroy({ transaction: t });
      await t.commit();
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async getBranchById(id: number): Promise<Branch> {
    const branch = await Branch.findByPk(id, {
      include: [
        { model: Branch, as: 'parent' },
        { model: Branch, as: 'children' }
      ]
    });
    if (!branch) {
      throw new NotFoundError('网点不存在');
    }
    return branch;
  }

  async getBranchList(params: {
    type?: BranchType;
    status?: BranchStatus;
    keyword?: string;
    page?: number;
    pageSize?: number;
    includeChildren?: boolean;
  }): Promise<{ list: Branch[]; total: number; page: number; pageSize: number }> {
    const { type, status, keyword, page = 1, pageSize = 10, includeChildren = false } = params;
    const where: any = {};

    if (type) where.type = type;
    if (status) where.status = status;
    if (keyword) {
      where[Op.or] = [
        { name: { [Op.like]: `%${keyword}%` } },
        { code: { [Op.like]: `%${keyword}%` } },
        { contactPerson: { [Op.like]: `%${keyword}%` } },
        { contactPhone: { [Op.like]: `%${keyword}%` } }
      ];
    }

    const include: any[] = [{ model: Branch, as: 'parent' }];
    if (includeChildren) {
      include.push({ model: Branch, as: 'children' });
    }

    const { count, rows } = await Branch.findAndCountAll({
      where,
      include,
      order: [['sortOrder', 'ASC'], ['createdAt', 'DESC']],
      limit: pageSize,
      offset: (page - 1) * pageSize,
      distinct: true
    });

    return {
      list: rows,
      total: count,
      page,
      pageSize
    };
  }

  async getBranchTree(params: {
    type?: BranchType;
    status?: BranchStatus;
    parentId?: number;
    keyword?: string;
    includeInactive?: boolean;
  }): Promise<Branch[]> {
    const { type, status, parentId, keyword, includeInactive = false } = params;
    const where: any = {};

    if (!includeInactive) {
      where.status = status || BranchStatus.ACTIVE;
    } else if (status) {
      where.status = status;
    }

    if (type) where.type = type;

    let branches = await Branch.findAll({
      where,
      order: [['sortOrder', 'ASC'], ['createdAt', 'DESC']]
    });

    if (keyword) {
      const matchedBranchIds = new Set<number>();
      const keywordLower = keyword.toLowerCase();
      
      for (const branch of branches) {
        if (
          branch.name.toLowerCase().includes(keywordLower) ||
          branch.code.toLowerCase().includes(keywordLower)
        ) {
          matchedBranchIds.add(branch.id);
          let currentId = branch.parentId;
          while (currentId) {
            matchedBranchIds.add(currentId);
            const parent = branches.find(b => b.id === currentId);
            currentId = parent?.parentId;
          }
        }
      }
      
      branches = branches.filter(b => matchedBranchIds.has(b.id));
    }

    return this.buildTree(branches, parentId);
  }

  private buildTree(branches: Branch[], parentId?: number, level: number = 0): Branch[] {
    const tree: Branch[] = [];
    for (const branch of branches) {
      if (branch.parentId === parentId || (!parentId && !branch.parentId)) {
        const children = this.buildTree(branches, branch.id, level + 1);
        (branch as any).dataValues.children = children;
        (branch as any).dataValues.level = level;
        (branch as any).dataValues.hasChildren = children.length > 0;
        tree.push(branch);
      }
    }
    return tree;
  }

  async updateBranchStatus(id: number, status: BranchStatus, operatorId?: number): Promise<Branch> {
    const t = await sequelize.transaction();
    try {
      const branch = await Branch.findByPk(id, { transaction: t });
      if (!branch) {
        throw new NotFoundError('网点不存在');
      }

      if (status !== BranchStatus.ACTIVE) {
        const activeChildren = await Branch.count({
          where: { parentId: id, status: BranchStatus.ACTIVE },
          transaction: t
        });
        if (activeChildren > 0) {
          throw new BusinessError('该网点下存在运营中的子网点，无法停运或注销');
        }

        const activeVehicles = await Vehicle.count({
          where: { branchId: id },
          transaction: t
        });
        if (activeVehicles > 0) {
          throw new BusinessError('该网点下存在挂靠车辆，无法停运或注销');
        }

        const pendingOrders = await Order.count({
          where: {
            [Op.or]: [{ shipperBranchId: id }, { receiverBranchId: id }],
            status: { [Op.ne]: 'signed' }
          },
          transaction: t
        });
        if (pendingOrders > 0) {
          throw new BusinessError('该网点下存在未完成的订单，无法停运或注销');
        }
      }

      const oldStatus = branch.status;
      await branch.update({ status }, { transaction: t });

      if (status === BranchStatus.ACTIVE && oldStatus !== BranchStatus.ACTIVE) {
        const parent = branch.parentId ? await Branch.findByPk(branch.parentId, { transaction: t }) : null;
        if (parent && parent.status !== BranchStatus.ACTIVE) {
          throw new BusinessError('上级网点未处于运营状态，无法启用该网点');
        }
      }

      await t.commit();
      return this.getBranchById(id);
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async bindParentBranch(id: number, parentId: number): Promise<Branch> {
    const t = await sequelize.transaction();
    try {
      const branch = await Branch.findByPk(id, { transaction: t });
      if (!branch) {
        throw new NotFoundError('网点不存在');
      }

      this.validateActiveBranch(branch, '无法绑定上级网点');

      if (parentId) {
        const parent = await Branch.findByPk(parentId, { transaction: t });
        if (!parent) {
          throw new NotFoundError('上级网点不存在');
        }

        this.validateActiveBranch(parent, '无法作为上级网点');

        if (parentId === id) {
          throw new BusinessError('不能将自己设为上级网点');
        }

        if (await this.checkCircularReference(id, parentId, t)) {
          throw new BusinessError('存在循环引用，无法绑定该上级网点');
        }
      }

      await branch.update({ parentId }, { transaction: t });
      await t.commit();
      return this.getBranchById(id);
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async getBranchStats(id: number): Promise<any> {
    const branch = await Branch.findByPk(id);
    if (!branch) {
      throw new NotFoundError('网点不存在');
    }

    const [childCount, vehicleCount, orderCount, pendingOrderCount] = await Promise.all([
      Branch.count({ where: { parentId: id } }),
      Vehicle.count({ where: { branchId: id } }),
      Order.count({
        where: {
          [Op.or]: [{ shipperBranchId: id }, { receiverBranchId: id }]
        }
      }),
      Order.count({
        where: {
          [Op.or]: [{ shipperBranchId: id }, { receiverBranchId: id }],
          status: { [Op.ne]: 'signed' }
        }
      })
    ]);

    return {
      childCount,
      vehicleCount,
      orderCount,
      pendingOrderCount,
      status: branch.status,
      name: branch.name
    };
  }
}

export default new BranchService();
