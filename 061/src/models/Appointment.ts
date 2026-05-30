import { DataTypes, Model } from 'sequelize';
import sequelize from '../database';
import { AppointmentStatus } from '../types';
import Patient from './Patient';
import Staff from './Staff';

export interface AppointmentAttributes {
  id?: number;
  appointmentNo: string;
  patientId: number;
  doctorId: number;
  nurseId?: number;
  appointmentDate: Date;
  timeSlot?: string;
  status: AppointmentStatus;
  chiefComplaint?: string;
  queueNumber?: number;
  checkInTime?: Date;
  startTime?: Date;
  endTime?: Date;
  cancelReason?: string;
  remark?: string;
  createdBy?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

class Appointment extends Model<AppointmentAttributes> implements AppointmentAttributes {
  public id!: number;
  public appointmentNo!: string;
  public patientId!: number;
  public doctorId!: number;
  public nurseId?: number;
  public appointmentDate!: Date;
  public timeSlot?: string;
  public status!: AppointmentStatus;
  public chiefComplaint?: string;
  public queueNumber?: number;
  public checkInTime?: Date;
  public startTime?: Date;
  public endTime?: Date;
  public cancelReason?: string;
  public remark?: string;
  public createdBy?: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Appointment.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    appointmentNo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '预约编号',
    },
    patientId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '患者ID',
    },
    doctorId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '医生ID',
    },
    nurseId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: '护士ID',
    },
    appointmentDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: '预约日期',
    },
    timeSlot: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '时间段',
    },
    status: {
      type: DataTypes.ENUM(...Object.values(AppointmentStatus)),
      allowNull: false,
      defaultValue: AppointmentStatus.PENDING,
      comment: '状态',
    },
    chiefComplaint: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '主诉',
    },
    queueNumber: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '排队号',
    },
    checkInTime: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '签到时间',
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '开始诊疗时间',
    },
    endTime: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '结束诊疗时间',
    },
    cancelReason: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '取消原因',
    },
    remark: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '备注',
    },
    createdBy: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: '创建人ID',
    },
  },
  {
    sequelize,
    modelName: 'Appointment',
    tableName: 'appointments',
  }
);

Appointment.belongsTo(Patient, {
  foreignKey: 'patientId',
  as: 'patient',
});

Appointment.belongsTo(Staff, {
  foreignKey: 'doctorId',
  as: 'doctor',
});

Appointment.belongsTo(Staff, {
  foreignKey: 'nurseId',
  as: 'nurse',
});

Patient.hasMany(Appointment, {
  foreignKey: 'patientId',
  as: 'appointments',
});

export default Appointment;
