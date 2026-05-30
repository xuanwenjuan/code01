import { Transaction } from 'sequelize';
import Department from '../models/Department';
import Employee from '../models/Employee';
import { NotFoundException, ConflictException, BadRequestException } from '../exceptions/HttpException';
import sequelize from '../config/database';
import { Op } from 'sequelize';

export interface CreateDepartmentData {
  name: string;
  code: string;
  parentId?: number;
  level?: number;
  sortOrder?: number;
  managerId?: number;
  description?: string;
}

export interface UpdateDepartmentData {
  name?: string;
  code?: string;
  parentId?: number | null;
  level?: number;
  sortOrder?: number;
  managerId?: number | null;
  description?: string;
  isActive?: boolean;
}

const buildDepartmentTree = (departments: Department[], parentId: number | null = null): any[] => {
  return departments
    .filter(dept => dept.parentId === parentId)
    .map(dept => ({
      ...dept.toJSON(),
      children: buildDepartmentTree(departments, dept.id),
    }));
};

const checkDuplicateName = async (
  name: string,
  parentId: number | null | undefined,
  excludeId?: number
): Promise<boolean> => {
  const where: any = {
    name,
    parentId: parentId || null,
  };
  
  if (excludeId) {
    where.id = { [Op.ne]: excludeId };
  }
  
  const count = await Department.count({ where });
  return count > 0;
};

const updateChildDepartmentsLevel = async (
  parentId: number,
  newLevel: number,
  transaction: Transaction
): Promise<void> => {
  const children = await Department.findAll({
    where: { parentId },
    transaction,
  });
  
  for (const child of children) {
    const childNewLevel = newLevel + 1;
    await child.update({ level: childNewLevel }, { transaction });
    await updateChildDepartmentsLevel(child.id, childNewLevel, transaction);
  }
};

const checkCircularReference = async (
  departmentId: number,
  newParentId: number
): Promise<boolean> => {
  let currentParentId: number | null = newParentId;
  const visited = new Set<number>();
  
  while (currentParentId) {
    if (currentParentId === departmentId) {
      return true;
    }
    if (visited.has(currentParentId)) {
      return true;
    }
    visited.add(currentParentId);
    
    const parentDept = await Department.findByPk(currentParentId);
    if (!parentDept) {
      break;
    }
    currentParentId = parentDept.parentId || null;
  }
  
  return false;
};

export const getDepartmentTree = async (includeInactive: boolean = false) => {
  const where = includeInactive ? {} : { isActive: true };
  
  const departments = await Department.findAll({
    where,
    order: [['sortOrder', 'ASC'], ['name', 'ASC']],
    include: [
      {
        model: Employee,
        as: 'employees',
        attributes: ['id', 'name', 'employeeNo'],
      },
    ],
  });
  
  return buildDepartmentTree(departments);
};

export const getDepartmentById = async (id: number) => {
  const department = await Department.findByPk(id, {
    include: [
      {
        model: Department,
        as: 'parent',
        attributes: ['id', 'name', 'code'],
      },
      {
        model: Employee,
        as: 'employees',
        attributes: ['id', 'name', 'employeeNo', 'position'],
      },
    ],
  });
  
  if (!department) {
    throw new NotFoundException('部门不存在');
  }
  
  return department;
};

export const createDepartment = async (data: CreateDepartmentData) => {
  const transaction = await sequelize.transaction();
  
  try {
    const existingCode = await Department.findOne({ 
      where: { code: data.code },
      transaction,
    });
    
    if (existingCode) {
      throw new ConflictException('部门编码已存在');
    }
    
    const hasDuplicateName = await checkDuplicateName(
      data.name,
      data.parentId,
      undefined
    );
    
    if (hasDuplicateName) {
      throw new ConflictException('同一父级部门下已存在相同名称的部门');
    }
    
    if (data.parentId) {
      const parentExists = await Department.findByPk(data.parentId, { transaction });
      if (!parentExists) {
        throw new BadRequestException('父级部门不存在');
      }
      if (!parentExists.isActive) {
        throw new BadRequestException('父级部门已被禁用，无法创建子部门');
      }
      data.level = parentExists.level + 1;
    }
    
    const department = await Department.create(
      {
        ...data,
        isActive: true,
      },
      { transaction }
    );
    
    await transaction.commit();
    
    return department;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const updateDepartment = async (id: number, data: UpdateDepartmentData) => {
  const transaction = await sequelize.transaction();
  
  try {
    const department = await Department.findByPk(id, { transaction });
    
    if (!department) {
      throw new NotFoundException('部门不存在');
    }
    
    if (data.code) {
      const existingCode = await Department.findOne({
        where: {
          code: data.code,
          id: { [Op.ne]: id },
        },
        transaction,
      });
      
      if (existingCode) {
        throw new ConflictException('部门编码已存在');
      }
    }
    
    const newParentId = data.parentId !== undefined ? data.parentId : department.parentId;
    
    if (data.name) {
      const hasDuplicateName = await checkDuplicateName(
        data.name,
        newParentId,
        id
      );
      
      if (hasDuplicateName) {
        throw new ConflictException('同一父级部门下已存在相同名称的部门');
      }
    }
    
    if (data.parentId !== undefined) {
      if (data.parentId === id) {
        throw new BadRequestException('不能将自己设为父级部门');
      }
      
      if (data.parentId !== null) {
        const parentExists = await Department.findByPk(data.parentId, { transaction });
        if (!parentExists) {
          throw new BadRequestException('父级部门不存在');
        }
        if (!parentExists.isActive) {
          throw new BadRequestException('父级部门已被禁用');
        }
        
        const hasCircularRef = await checkCircularReference(id, data.parentId);
        if (hasCircularRef) {
          throw new BadRequestException('存在循环引用，无法设置该父级部门');
        }
        
        const oldLevel = department.level;
        const newLevel = parentExists.level + 1;
        data.level = newLevel;
        
        if (oldLevel !== newLevel) {
          await updateChildDepartmentsLevel(id, newLevel, transaction);
        }
      } else {
        data.level = 1;
        const oldLevel = department.level;
        if (oldLevel !== 1) {
          await updateChildDepartmentsLevel(id, 1, transaction);
        }
      }
    }
    
    await department.update(data, { transaction });
    await transaction.commit();
    
    return department;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const deleteDepartment = async (id: number) => {
  const transaction = await sequelize.transaction();
  
  try {
    const department = await Department.findByPk(id, { transaction });
    
    if (!department) {
      throw new NotFoundException('部门不存在');
    }
    
    const childCount = await Department.count({ 
      where: { parentId: id },
      transaction,
    });
    if (childCount > 0) {
      throw new BadRequestException('该部门下存在子部门，无法删除');
    }
    
    const employeeCount = await Employee.count({ 
      where: { departmentId: id },
      transaction,
    });
    if (employeeCount > 0) {
      throw new BadRequestException('该部门下存在员工，无法删除');
    }
    
    await department.destroy({ transaction });
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const getDepartmentStats = async () => {
  const totalDepartments = await Department.count();
  const activeDepartments = await Department.count({ where: { isActive: true } });
  const totalEmployees = await Employee.count();
  
  const departmentsWithEmployeeCount = await Department.findAll({
    where: { isActive: true },
    attributes: ['id', 'name', 'code'],
    include: [
      {
        model: Employee,
        as: 'employees',
        attributes: [],
      },
    ],
    group: ['Department.id'],
  });
  
  return {
    totalDepartments,
    activeDepartments,
    totalEmployees,
    departments: departmentsWithEmployeeCount.map(d => ({
      id: d.id,
      name: d.name,
      code: d.code,
      employeeCount: (d as any).employees?.length || 0,
    })),
  };
};
