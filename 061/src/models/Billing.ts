import { DataTypes, Model } from 'sequelize';
import sequelize from '../database';
import { BillingStatus } from '../types';
import Patient from './Patient';
import Staff from './Staff';
import Appointment from './Appointment';
import TreatmentRecord from './TreatmentRecord';

export interface BillingAttributes {
  id?: number;
  billNo: string;
  patientId: number;
  appointmentId?: number;
  treatmentRecordId?: number;
  doctorId?: number;
  totalAmount: number;
  discountAmount?: number;
  actualAmount: number;
  paidAmount?: number;
  status: BillingStatus;
  paymentMethod?: string;
  paymentTime?: Date;
  remark?: string;
  createdBy?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

class Billing extends Model<BillingAttributes> implements BillingAttributes {
  public id!: number;
  public billNo!: string;
  public patientId!: number;
  public appointmentId?: number;
  public treatmentRecordId?: number;
  public doctorId?: number;
  public totalAmount!: number;
  public discountAmount?: number;
  public actualAmount!: number;
  public paidAmount?: number;
  public status!: BillingStatus;
  public paymentMethod?: string;
  public paymentTime?: Date;
  public remark?: string;
  public createdBy?: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Billing.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    billNo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '账单编号',
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
    treatmentRecordId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: '诊疗记录ID',
    },
    doctorId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: '医生ID',
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '总金额',
    },
    discountAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      comment: '优惠金额',
    },
    actualAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '应收金额',
    },
    paidAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      comment: '已付金额',
    },
    status: {
      type: DataTypes.ENUM(...Object.values(BillingStatus)),
      allowNull: false,
      defaultValue: BillingStatus.PENDING,
      comment: '状态',
    },
    paymentMethod: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '支付方式',
    },
    paymentTime: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '支付时间',
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
    modelName: 'Billing',
    tableName: 'billings',
  }
);

Billing.belongsTo(Patient, {
  foreignKey: 'patientId',
  as: 'patient',
});

Billing.belongsTo(Staff, {
  foreignKey: 'doctorId',
  as: 'doctor',
});

Billing.belongsTo(Appointment, {
  foreignKey: 'appointmentId',
  as: 'appointment',
});

Billing.belongsTo(TreatmentRecord, {
  foreignKey: 'treatmentRecordId',
  as: 'treatmentRecord',
});

Patient.hasMany(Billing, {
  foreignKey: 'patientId',
  as: 'billings',
});

export default Billing;
