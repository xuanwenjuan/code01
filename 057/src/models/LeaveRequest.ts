import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import Employee from './Employee';
import User from './User';

export enum LeaveType {
  ANNUAL = 'annual',
  SICK = 'sick',
  PERSONAL = 'personal',
  MARRIAGE = 'marriage',
  MATERNITY = 'maternity',
  PATERNITY = 'paternity',
  OTHER = 'other',
}

export enum LeaveStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

export interface LeaveRequestAttributes {
  id?: number;
  employeeId: number;
  type: LeaveType;
  startDate: Date;
  endDate: Date;
  days: number;
  reason: string;
  status: LeaveStatus;
  approverId?: number;
  approvalRemark?: string;
  approvalTime?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

class LeaveRequest extends Model<LeaveRequestAttributes> implements LeaveRequestAttributes {
  public id!: number;
  public employeeId!: number;
  public type!: LeaveType;
  public startDate!: Date;
  public endDate!: Date;
  public days!: number;
  public reason!: string;
  public status!: LeaveStatus;
  public approverId?: number;
  public approvalRemark?: string;
  public approvalTime?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public readonly employee?: Employee;
  public readonly approver?: User;
}

LeaveRequest.init(
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
    type: {
      type: DataTypes.ENUM(...Object.values(LeaveType)),
      allowNull: false,
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'start_date',
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'end_date',
    },
    days: {
      type: DataTypes.DECIMAL(4, 1),
      allowNull: false,
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(LeaveStatus)),
      allowNull: false,
      defaultValue: LeaveStatus.PENDING,
    },
    approverId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'approver_id',
    },
    approvalRemark: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'approval_remark',
    },
    approvalTime: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'approval_time',
    },
  },
  {
    sequelize,
    tableName: 'leave_requests',
    timestamps: true,
  }
);

LeaveRequest.belongsTo(Employee, {
  as: 'employee',
  foreignKey: 'employeeId',
});

LeaveRequest.belongsTo(User, {
  as: 'approver',
  foreignKey: 'approverId',
});

Employee.hasMany(LeaveRequest, {
  as: 'leaveRequests',
  foreignKey: 'employeeId',
});

export default LeaveRequest;
