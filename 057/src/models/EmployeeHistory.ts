import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import Employee from './Employee';
import User from './User';

export interface EmployeeHistoryAttributes {
  id?: number;
  employeeId: number;
  fieldName: string;
  oldValue?: string;
  newValue?: string;
  operatorId: number;
  remark?: string;
  createdAt?: Date;
}

class EmployeeHistory extends Model<EmployeeHistoryAttributes> implements EmployeeHistoryAttributes {
  public id!: number;
  public employeeId!: number;
  public fieldName!: string;
  public oldValue?: string;
  public newValue?: string;
  public operatorId!: number;
  public remark?: string;
  public readonly createdAt!: Date;

  public readonly employee?: Employee;
  public readonly operator?: User;
}

EmployeeHistory.init(
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
    fieldName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'field_name',
    },
    oldValue: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'old_value',
    },
    newValue: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'new_value',
    },
    operatorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'operator_id',
    },
    remark: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'employee_history',
    timestamps: true,
    updatedAt: false,
  }
);

EmployeeHistory.belongsTo(Employee, {
  as: 'employee',
  foreignKey: 'employeeId',
});

EmployeeHistory.belongsTo(User, {
  as: 'operator',
  foreignKey: 'operatorId',
});

Employee.hasMany(EmployeeHistory, {
  as: 'history',
  foreignKey: 'employeeId',
});

export default EmployeeHistory;
