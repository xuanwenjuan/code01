import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import Department from './Department';

export enum EmployeeStatus {
  PROBATION = 'probation',
  REGULAR = 'regular',
  RESIGNED = 'resigned',
  TERMINATED = 'terminated',
}

export interface EmployeeAttributes {
  id?: number;
  employeeNo: string;
  name: string;
  gender: 'male' | 'female';
  birthDate?: Date;
  idCardNo?: string;
  phone: string;
  email?: string;
  address?: string;
  departmentId: number;
  position: string;
  baseSalary: number;
  hireDate: Date;
  confirmationDate?: Date;
  resignationDate?: Date;
  status: EmployeeStatus;
  remark?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

class Employee extends Model<EmployeeAttributes> implements EmployeeAttributes {
  public id!: number;
  public employeeNo!: string;
  public name!: string;
  public gender!: 'male' | 'female';
  public birthDate?: Date;
  public idCardNo?: string;
  public phone!: string;
  public email?: string;
  public address?: string;
  public departmentId!: number;
  public position!: string;
  public baseSalary!: number;
  public hireDate!: Date;
  public confirmationDate?: Date;
  public resignationDate?: Date;
  public status!: EmployeeStatus;
  public remark?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public readonly department?: Department;
}

Employee.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    employeeNo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      field: 'employee_no',
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    gender: {
      type: DataTypes.ENUM('male', 'female'),
      allowNull: false,
    },
    birthDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'birth_date',
    },
    idCardNo: {
      type: DataTypes.STRING(18),
      allowNull: true,
      field: 'id_card_no',
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        isEmail: true,
      },
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    departmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'department_id',
    },
    position: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    baseSalary: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      field: 'base_salary',
    },
    hireDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'hire_date',
    },
    confirmationDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'confirmation_date',
    },
    resignationDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'resignation_date',
    },
    status: {
      type: DataTypes.ENUM(...Object.values(EmployeeStatus)),
      allowNull: false,
      defaultValue: EmployeeStatus.PROBATION,
    },
    remark: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'employees',
    timestamps: true,
  }
);

Employee.belongsTo(Department, {
  as: 'department',
  foreignKey: 'departmentId',
});

Department.hasMany(Employee, {
  as: 'employees',
  foreignKey: 'departmentId',
});

export default Employee;
