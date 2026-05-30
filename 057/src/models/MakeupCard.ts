import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import Employee from './Employee';
import User from './User';

export enum MakeupCardStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export interface MakeupCardAttributes {
  id?: number;
  employeeId: number;
  attendanceDate: Date;
  type: 'clock_in' | 'clock_out';
  makeupTime: Date;
  reason: string;
  status: MakeupCardStatus;
  approverId?: number;
  approvalRemark?: string;
  approvalTime?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

class MakeupCard extends Model<MakeupCardAttributes> implements MakeupCardAttributes {
  public id!: number;
  public employeeId!: number;
  public attendanceDate!: Date;
  public type!: 'clock_in' | 'clock_out';
  public makeupTime!: Date;
  public reason!: string;
  public status!: MakeupCardStatus;
  public approverId?: number;
  public approvalRemark?: string;
  public approvalTime?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public readonly employee?: Employee;
  public readonly approver?: User;
}

MakeupCard.init(
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
    attendanceDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'attendance_date',
    },
    type: {
      type: DataTypes.ENUM('clock_in', 'clock_out'),
      allowNull: false,
    },
    makeupTime: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'makeup_time',
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(MakeupCardStatus)),
      allowNull: false,
      defaultValue: MakeupCardStatus.PENDING,
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
    tableName: 'makeup_cards',
    timestamps: true,
  }
);

MakeupCard.belongsTo(Employee, {
  as: 'employee',
  foreignKey: 'employeeId',
});

MakeupCard.belongsTo(User, {
  as: 'approver',
  foreignKey: 'approverId',
});

Employee.hasMany(MakeupCard, {
  as: 'makeupCards',
  foreignKey: 'employeeId',
});

export default MakeupCard;
