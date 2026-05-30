import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import Employee from './Employee';

export enum AttendanceStatus {
  NORMAL = 'normal',
  LATE = 'late',
  EARLY_LEAVE = 'early_leave',
  ABSENT = 'absent',
  LEAVE = 'leave',
}

export enum AttendanceType {
  CLOCK_IN = 'clock_in',
  CLOCK_OUT = 'clock_out',
}

export interface AttendanceAttributes {
  id?: number;
  employeeId: number;
  date: Date;
  type: AttendanceType;
  time: Date;
  status: AttendanceStatus;
  latitude?: number;
  longitude?: number;
  location?: string;
  device?: string;
  ip?: string;
  remark?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

class Attendance extends Model<AttendanceAttributes> implements AttendanceAttributes {
  public id!: number;
  public employeeId!: number;
  public date!: Date;
  public type!: AttendanceType;
  public time!: Date;
  public status!: AttendanceStatus;
  public latitude?: number;
  public longitude?: number;
  public location?: string;
  public device?: string;
  public ip?: string;
  public remark?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public readonly employee?: Employee;
}

Attendance.init(
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
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM(...Object.values(AttendanceType)),
      allowNull: false,
    },
    time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(AttendanceStatus)),
      allowNull: false,
      defaultValue: AttendanceStatus.NORMAL,
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 6),
      allowNull: true,
    },
    longitude: {
      type: DataTypes.DECIMAL(10, 6),
      allowNull: true,
    },
    location: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    device: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    ip: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    remark: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'attendances',
    timestamps: true,
  }
);

Attendance.belongsTo(Employee, {
  as: 'employee',
  foreignKey: 'employeeId',
});

Employee.hasMany(Attendance, {
  as: 'attendances',
  foreignKey: 'employeeId',
});

export default Attendance;
