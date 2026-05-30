import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../database';
import { EnrollmentStatus, PaymentStatus } from '../types';

export class Enrollment extends Model {
  public id!: number;
  public studentId!: number;
  public majorId!: number;
  public classId!: number | null;
  public status!: EnrollmentStatus;
  public paymentStatus!: PaymentStatus;
  public amount!: number;
  public paidAt!: Date | null;
  public auditorId!: number | null;
  public auditRemark!: string;
  public auditTime!: Date | null;
  public remark!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Enrollment.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    studentId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '学员ID'
    },
    majorId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '专业ID'
    },
    classId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: '班级ID'
    },
    status: {
      type: DataTypes.ENUM(...Object.values(EnrollmentStatus)),
      allowNull: false,
      defaultValue: EnrollmentStatus.PENDING,
      comment: '报名状态'
    },
    paymentStatus: {
      type: DataTypes.ENUM(...Object.values(PaymentStatus)),
      allowNull: false,
      defaultValue: PaymentStatus.PENDING,
      comment: '缴费状态'
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      comment: '缴费金额'
    },
    paidAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '缴费时间'
    },
    auditorId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: '审核人ID'
    },
    auditRemark: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '审核备注'
    },
    auditTime: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '审核时间'
    },
    remark: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '备注'
    }
  },
  {
    sequelize,
    tableName: 'enrollments',
    modelName: 'Enrollment',
    timestamps: true,
    indexes: [
      { fields: ['studentId'] },
      { fields: ['majorId'] },
      { fields: ['classId'] },
      { fields: ['status'] }
    ]
  }
);
