import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

export enum CommissionStatus {
  PENDING = 'pending',
  SETTLED = 'settled',
  WITHDRAWN = 'withdrawn'
}

export interface CommissionAttributes {
  id?: number;
  orderId: number;
  orderNo: string;
  leaderId: number;
  orderAmount: number;
  commissionRate: number;
  commissionAmount: number;
  platformFee: number;
  settlementPeriod: string;
  status: CommissionStatus;
  settledAt?: Date;
  withdrawnAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

class Commission extends Model<CommissionAttributes> implements CommissionAttributes {
  public id!: number;
  public orderId!: number;
  public orderNo!: string;
  public leaderId!: number;
  public orderAmount!: number;
  public commissionRate!: number;
  public commissionAmount!: number;
  public platformFee!: number;
  public settlementPeriod!: string;
  public status!: CommissionStatus;
  public settledAt?: Date;
  public withdrawnAt?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Commission.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '订单ID'
    },
    orderNo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '订单号'
    },
    leaderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '团长ID'
    },
    orderAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '订单金额'
    },
    commissionRate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      comment: '佣金比例%'
    },
    commissionAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '佣金金额'
    },
    platformFee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '平台抽成'
    },
    settlementPeriod: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: '结算周期 YYYY-MM'
    },
    status: {
      type: DataTypes.ENUM(...Object.values(CommissionStatus)),
      allowNull: false,
      defaultValue: CommissionStatus.PENDING,
      comment: '状态 pending:待结算 settled:已结算 withdrawn:已提现'
    },
    settledAt: {
      type: DataTypes.DATE,
      comment: '结算时间'
    },
    withdrawnAt: {
      type: DataTypes.DATE,
      comment: '提现时间'
    }
  },
  {
    sequelize,
    modelName: 'Commission',
    tableName: 'commissions',
    timestamps: true
  }
);

export default Commission;
