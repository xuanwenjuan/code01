import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../database';
import { ApplicationStatus } from '../constants';

export interface ForageApplicationAttributes {
  id?: number;
  applicationNo: string;
  stableId: number;
  trainerId: number;
  status: ApplicationStatus;
  feedingTime?: Date;
  totalAmount?: number;
  remainingAmount?: number;
  returnedAmount?: number;
  damagedAmount?: number;
  approvedBy?: number;
  approvedAt?: Date;
  deliveredBy?: number;
  deliveredAt?: Date;
  completedAt?: Date;
  expireAt?: Date;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

class ForageApplication extends Model<ForageApplicationAttributes> implements ForageApplicationAttributes {
  public id!: number;
  public applicationNo!: string;
  public stableId!: number;
  public trainerId!: number;
  public status!: ApplicationStatus;
  public feedingTime?: Date;
  public totalAmount?: number;
  public remainingAmount?: number;
  public returnedAmount?: number;
  public damagedAmount?: number;
  public approvedBy?: number;
  public approvedAt?: Date;
  public deliveredBy?: number;
  public deliveredAt?: Date;
  public completedAt?: Date;
  public expireAt?: Date;
  public notes?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ForageApplication.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    applicationNo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '申领单号'
    },
    stableId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '马舍ID'
    },
    trainerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '驯养员ID'
    },
    status: {
      type: DataTypes.ENUM(...Object.values(ApplicationStatus)),
      defaultValue: ApplicationStatus.PENDING,
      comment: '状态'
    },
    feedingTime: {
      type: DataTypes.DATE,
      comment: '投放时间'
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      comment: '申领总数量'
    },
    remainingAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      comment: '剩余数量'
    },
    returnedAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      comment: '退回数量'
    },
    damagedAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      comment: '报损数量'
    },
    approvedBy: {
      type: DataTypes.INTEGER,
      comment: '审批人ID'
    },
    approvedAt: {
      type: DataTypes.DATE,
      comment: '审批时间'
    },
    deliveredBy: {
      type: DataTypes.INTEGER,
      comment: '发货人ID'
    },
    deliveredAt: {
      type: DataTypes.DATE,
      comment: '发货时间'
    },
    completedAt: {
      type: DataTypes.DATE,
      comment: '完成时间'
    },
    expireAt: {
      type: DataTypes.DATE,
      comment: '过期时间'
    },
    notes: {
      type: DataTypes.TEXT,
      comment: '备注'
    }
  },
  {
    sequelize,
    modelName: 'ForageApplication',
    tableName: 'forage_applications',
    indexes: [
      { fields: ['applicationNo'], unique: true },
      { fields: ['status'] },
      { fields: ['stableId'] },
      { fields: ['trainerId'] },
      { fields: ['expireAt'] }
    ]
  }
);

export default ForageApplication;
