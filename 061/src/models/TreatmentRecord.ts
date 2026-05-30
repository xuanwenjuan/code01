import { DataTypes, Model } from 'sequelize';
import sequelize from '../database';
import Patient from './Patient';
import Staff from './Staff';
import Appointment from './Appointment';

export interface TreatmentRecordAttributes {
  id?: number;
  recordNo: string;
  patientId: number;
  appointmentId?: number;
  doctorId: number;
  nurseId?: number;
  chiefComplaint?: string;
  presentIllness?: string;
  pastHistory?: string;
  examination?: string;
  diagnosis?: string;
  treatmentPlan?: string;
  treatmentNotes?: string;
  prescription?: string;
  nextVisitDate?: Date;
  remark?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

class TreatmentRecord extends Model<TreatmentRecordAttributes> implements TreatmentRecordAttributes {
  public id!: number;
  public recordNo!: string;
  public patientId!: number;
  public appointmentId?: number;
  public doctorId!: number;
  public nurseId?: number;
  public chiefComplaint?: string;
  public presentIllness?: string;
  public pastHistory?: string;
  public examination?: string;
  public diagnosis?: string;
  public treatmentPlan?: string;
  public treatmentNotes?: string;
  public prescription?: string;
  public nextVisitDate?: Date;
  public remark?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

TreatmentRecord.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    recordNo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '病历编号',
    },
    patientId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '患者ID',
    },
    appointmentId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: '预约ID',
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
    chiefComplaint: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '主诉',
    },
    presentIllness: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '现病史',
    },
    pastHistory: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '既往史',
    },
    examination: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '检查情况',
    },
    diagnosis: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '诊断',
    },
    treatmentPlan: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '治疗方案',
    },
    treatmentNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '治疗记录',
    },
    prescription: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '处方',
    },
    nextVisitDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '下次复诊日期',
    },
    remark: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '备注',
    },
  },
  {
    sequelize,
    modelName: 'TreatmentRecord',
    tableName: 'treatment_records',
  }
);

TreatmentRecord.belongsTo(Patient, {
  foreignKey: 'patientId',
  as: 'patient',
});

TreatmentRecord.belongsTo(Staff, {
  foreignKey: 'doctorId',
  as: 'doctor',
});

TreatmentRecord.belongsTo(Staff, {
  foreignKey: 'nurseId',
  as: 'nurse',
});

TreatmentRecord.belongsTo(Appointment, {
  foreignKey: 'appointmentId',
  as: 'appointment',
});

Patient.hasMany(TreatmentRecord, {
  foreignKey: 'patientId',
  as: 'treatmentRecords',
});

export default TreatmentRecord;
