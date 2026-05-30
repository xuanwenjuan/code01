import { Transaction } from 'sequelize';
import Employee, { EmployeeStatus, EmployeeAttributes } from '../models/Employee';
import EmployeeHistory from '../models/EmployeeHistory';
import Department from '../models/Department';
import { NotFoundException, ConflictException, BadRequestException } from '../exceptions/HttpException';
import sequelize from '../config/database';
import { Op } from 'sequelize';

export interface CreateEmployeeData extends Omit<EmployeeAttributes, 'id' | 'createdAt' | 'updatedAt'> {}
export interface UpdateEmployeeData extends Partial<CreateEmployeeData> {}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  CONFIRM = 'confirm',
  RESIGN = 'resign',
  TERMINATE = 'terminate',
}

const recordHistory = async (
  employeeId: number,
  oldEmployee: Employee | null,
  newData: UpdateEmployeeData | CreateEmployeeData | null,
  operatorId: number,
  transaction: Transaction,
  operationType?: OperationType,
  remark?: string
) => {
  const historyRecords = [];
  
  if (operationType) {
    historyRecords.push({
      employeeId,
      fieldName: operationType,
      oldValue: oldEmployee ? oldEmployee.status : null,
      newValue: newData ? (newData as any).status || operationType : operationType,
      operatorId,
      remark: remark || `${operationType}操作`,
      createdAt: new Date(),
    });
  } else if (oldEmployee && newData) {
    for (const [key, newValue] of Object.entries(newData)) {
      const oldValue = (oldEmployee as any)[key];
      
      const oldString = oldValue !== undefined && oldValue !== null ? String(oldValue) : null;
      const newString = newValue !== undefined && newValue !== null ? String(newValue) : null;
      
      if (oldString !== newString) {
        historyRecords.push({
          employeeId,
          fieldName: key,
          oldValue: oldString,
          newValue: newString,
          operatorId,
          createdAt: new Date(),
        });
      }
    }
  }
  
  if (historyRecords.length > 0) {
    await EmployeeHistory.bulkCreate(historyRecords, { transaction });
  }
};

const validateStatusTransition = (
  currentStatus: EmployeeStatus,
  newStatus: EmployeeStatus
): boolean => {
  const validTransitions: Record<EmployeeStatus, EmployeeStatus[]> = {
    [EmployeeStatus.PROBATION]: [EmployeeStatus.REGULAR, EmployeeStatus.RESIGNED, EmployeeStatus.TERMINATED],
    [EmployeeStatus.REGULAR]: [EmployeeStatus.RESIGNED, EmployeeStatus.TERMINATED],
    [EmployeeStatus.RESIGNED]: [],
    [EmployeeStatus.TERMINATED]: [],
  };
  
  return validTransitions[currentStatus]?.includes(newStatus) ?? false;
};

const validateDepartmentActive = async (
  departmentId: number,
  transaction: Transaction
): Promise<void> => {
  const department = await Department.findByPk(departmentId, { transaction });
  
  if (!department) {
    throw new BadRequestException('部门不存在');
  }
  
  if (!department.isActive) {
    throw new BadRequestException('部门已被禁用，无法分配员工到该部门');
  }
};

export const getEmployeeList = async (params: {
  page?: number;
  pageSize?: number;
  departmentId?: number;
  status?: EmployeeStatus;
  keyword?: string;
}) => {
  const { page = 1, pageSize = 10, departmentId, status, keyword } = params;
  
  const where: any = {};
  
  if (departmentId) {
    where.departmentId = departmentId;
  }
  
  if (status) {
    where.status = status;
  }
  
  if (keyword) {
    where[Op.or] = [
      { name: { [Op.like]: `%${keyword}%` } },
      { employeeNo: { [Op.like]: `%${keyword}%` } },
      { phone: { [Op.like]: `%${keyword}%` } },
    ];
  }
  
  const { count, rows } = await Employee.findAndCountAll({
    where,
    include: [
      {
        model: Department,
        as: 'department',
        attributes: ['id', 'name', 'code'],
      },
    ],
    order: [['createdAt', 'DESC']],
    limit: pageSize,
    offset: (page - 1) * pageSize,
  });
  
  return {
    list: rows,
    pagination: {
      total: count,
      page,
      pageSize,
      totalPages: Math.ceil(count / pageSize),
    },
  };
};

export const getEmployeeById = async (id: number) => {
  const employee = await Employee.findByPk(id, {
    include: [
      {
        model: Department,
        as: 'department',
        attributes: ['id', 'name', 'code'],
      },
    ],
  });
  
  if (!employee) {
    throw new NotFoundException('员工不存在');
  }
  
  return employee;
};

export const getEmployeeHistory = async (employeeId: number, params?: {
  page?: number;
  pageSize?: number;
}) => {
  const { page = 1, pageSize = 20 } = params || {};
  
  const employee = await Employee.findByPk(employeeId);
  
  if (!employee) {
    throw new NotFoundException('员工不存在');
  }
  
  const { count, rows } = await EmployeeHistory.findAndCountAll({
    where: { employeeId },
    order: [['createdAt', 'DESC']],
    limit: pageSize,
    offset: (page - 1) * pageSize,
  });
  
  return {
    list: rows,
    pagination: {
      total: count,
      page,
      pageSize,
      totalPages: Math.ceil(count / pageSize),
    },
  };
};

export const createEmployee = async (data: CreateEmployeeData, operatorId?: number) => {
  const transaction = await sequelize.transaction();
  
  try {
    const existingEmployeeNo = await Employee.findOne({ 
      where: { employeeNo: data.employeeNo },
      transaction,
    });
    
    if (existingEmployeeNo) {
      throw new ConflictException('员工编号已存在');
    }
    
    await validateDepartmentActive(data.departmentId, transaction);
    
    if (data.status === EmployeeStatus.REGULAR && !data.confirmationDate) {
      data.confirmationDate = new Date();
    }
    
    const employee = await Employee.create(data, { transaction });
    
    if (operatorId) {
      await recordHistory(employee.id, null, data, operatorId, transaction, OperationType.CREATE, '创建员工档案');
    }
    
    await transaction.commit();
    
    return employee;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const updateEmployee = async (
  id: number,
  data: UpdateEmployeeData,
  operatorId: number
) => {
  const transaction = await sequelize.transaction();
  
  try {
    const employee = await Employee.findByPk(id, { transaction });
    
    if (!employee) {
      throw new NotFoundException('员工不存在');
    }
    
    if (data.employeeNo) {
      const existingEmployeeNo = await Employee.findOne({
        where: {
          employeeNo: data.employeeNo,
          id: { [Op.ne]: id },
        },
        transaction,
      });
      
      if (existingEmployeeNo) {
        throw new ConflictException('员工编号已存在');
      }
    }
    
    if (data.departmentId) {
      await validateDepartmentActive(data.departmentId, transaction);
    }
    
    if (data.status && data.status !== employee.status) {
      const isValidTransition = validateStatusTransition(employee.status, data.status);
      
      if (!isValidTransition) {
        throw new BadRequestException(`无法从 ${employee.status} 状态变更为 ${data.status} 状态`);
      }
      
      if (data.status === EmployeeStatus.REGULAR && !data.confirmationDate) {
        data.confirmationDate = new Date();
      }
      
      if (data.status === EmployeeStatus.RESIGNED && !data.resignationDate) {
        data.resignationDate = new Date();
      }
    }
    
    await recordHistory(id, employee, data, operatorId, transaction);
    
    await employee.update(data, { transaction });
    
    await transaction.commit();
    
    return employee;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const deleteEmployee = async (id: number, operatorId?: number) => {
  const transaction = await sequelize.transaction();
  
  try {
    const employee = await Employee.findByPk(id, { transaction });
    
    if (!employee) {
      throw new NotFoundException('员工不存在');
    }
    
    if (employee.status !== EmployeeStatus.RESIGNED && employee.status !== EmployeeStatus.TERMINATED) {
      throw new BadRequestException('仅已离职或已解雇的员工可以被删除');
    }
    
    if (operatorId) {
      await recordHistory(id, employee, null, operatorId, transaction, OperationType.DELETE, '删除员工档案');
    }
    
    await employee.destroy({ transaction });
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const confirmEmployee = async (id: number, operatorId: number, confirmationDate?: Date) => {
  const employee = await getEmployeeById(id);
  
  if (employee.status !== EmployeeStatus.PROBATION) {
    throw new BadRequestException('仅试用期员工可以转正');
  }
  
  return updateEmployee(
    id,
    {
      status: EmployeeStatus.REGULAR,
      confirmationDate: confirmationDate || new Date(),
    },
    operatorId
  );
};

export const resignEmployee = async (
  id: number,
  resignationDate: Date,
  operatorId: number,
  remark?: string
) => {
  const employee = await getEmployeeById(id);
  
  if (employee.status === EmployeeStatus.RESIGNED || employee.status === EmployeeStatus.TERMINATED) {
    throw new BadRequestException('该员工已离职或已被解雇');
  }
  
  return updateEmployee(
    id,
    {
      status: EmployeeStatus.RESIGNED,
      resignationDate,
      remark,
    },
    operatorId
  );
};

export const terminateEmployee = async (
  id: number,
  terminationDate: Date,
  operatorId: number,
  remark?: string
) => {
  const employee = await getEmployeeById(id);
  
  if (employee.status === EmployeeStatus.RESIGNED || employee.status === EmployeeStatus.TERMINATED) {
    throw new BadRequestException('该员工已离职或已被解雇');
  }
  
  return updateEmployee(
    id,
    {
      status: EmployeeStatus.TERMINATED,
      resignationDate: terminationDate,
      remark,
    },
    operatorId
  );
};

export const getEmployeeStats = async () => {
  const totalEmployees = await Employee.count();
  const regularEmployees = await Employee.count({ where: { status: EmployeeStatus.REGULAR } });
  const probationEmployees = await Employee.count({ where: { status: EmployeeStatus.PROBATION } });
  const resignedEmployees = await Employee.count({ where: { status: EmployeeStatus.RESIGNED } });
  const terminatedEmployees = await Employee.count({ where: { status: EmployeeStatus.TERMINATED } });
  
  const employeesByDepartment = await Employee.findAll({
    attributes: ['departmentId', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
    include: [
      {
        model: Department,
        as: 'department',
        attributes: ['id', 'name'],
      },
    ],
    group: ['departmentId'],
  });
  
  return {
    totalEmployees,
    regularEmployees,
    probationEmployees,
    resignedEmployees,
    terminatedEmployees,
    employeesByDepartment: employeesByDepartment.map((item: any) => ({
      departmentId: item.departmentId,
      departmentName: item.department?.name,
      count: parseInt(item.get('count')),
    })),
  };
};
