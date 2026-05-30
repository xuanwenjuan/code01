import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import Employee from './Employee';
import Department from './Department';

export interface SalaryAttributes {
  id?: number;
  employeeId: number;
  departmentId: number;
  year: number;
  month: number;
  baseSalary: number;
  performanceBonus: number;
  attendanceBonus: number;
  otherAllowance: number;
  lateDeduction: number;
  earlyLeaveDeduction: number;
  absentDeduction: number;
  socialSecurity: number;
  housingFund: number;
  personalIncomeTax: number;
  otherDeduction: number;
  totalEarnings: number;
  totalDeductions: number;
  netSalary: number;
  remark?: string;
  isPaid: boolean;
  paidAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

class Salary extends Model<SalaryAttributes> implements SalaryAttributes {
  public id!: number;
  public employeeId!: number;
  public departmentId!: number;
  public year!: number;
  public month!: number;
  public baseSalary!: number;
  public performanceBonus!: number;
  public attendanceBonus!: number;
  public otherAllowance!: number;
  public lateDeduction!: number;
  public earlyLeaveDeduction!: number;
  public absentDeduction!: number;
  public socialSecurity!: number;
  public housingFund!: number;
  public personalIncomeTax!: number;
  public otherDeduction!: number;
  public totalEarnings!: number;
  public totalDeductions!: number;
  public netSalary!: number;
  public remark?: string;
  public isPaid!: boolean;
  public paidAt?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public readonly employee?: Employee;
  public readonly department?: Department;
}

Salary.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    employeeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'employee_id',
    },
    departmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'department_id',
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    month: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    baseSalary: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      field: 'base_salary',
    },
    performanceBonus: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      field: 'performance_bonus',
    },
    attendanceBonus: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      field: 'attendance_bonus',
    },
    otherAllowance: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      field: 'other_allowance',
    },
    lateDeduction: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      field: 'late_deduction',
    },
    earlyLeaveDeduction: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      field: 'early_leave_deduction',
    },
    absentDeduction: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      field: 'absent_deduction',
    },
    socialSecurity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      field: 'social_security',
    },
    housingFund: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      field: 'housing_fund',
    },
    personalIncomeTax: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      field: 'personal_income_tax',
    },
    otherDeduction: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      field: 'other_deduction',
    },
    totalEarnings: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      field: 'total_earnings',
    },
    totalDeductions: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      field: 'total_deductions',
    },
    netSalary: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      field: 'net_salary',
    },
    remark: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isPaid: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_paid',
    },
    paidAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'paid_at',
    },
  },
  {
    sequelize,
    tableName: 'salaries',
    timestamps: true,
  }
);

Salary.belongsTo(Employee, {
  as: 'employee',
  foreignKey: 'employeeId',
});

Salary.belongsTo(Department, {
  as: 'department',
  foreignKey: 'departmentId',
});

Employee.hasMany(Salary, {
  as: 'salaries',
  foreignKey: 'employeeId',
});

Department.hasMany(Salary, {
  as: 'salaries',
  foreignKey: 'departmentId',
});

export default Salary;
