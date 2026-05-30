import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import { SettlementStatus, SettlementType } from '../utils/constants';
import User from './User';
import Order from './Order';

export interface ISettlementAttributes {
  id?: number;
  settlementNo: string;
  orderId: number;
  userId: number;
  type: SettlementType;
  amount: number;
  rate: number;
  status: SettlementStatus;
  transactionId?: string;
  settlementTime?: Date;
  failureReason?: string;
  remark?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

class Settlement extends Model<ISettlementAttributes> implements ISettlementAttributes {
  public id!: number;
  public settlementNo!: string;
  public orderId!: number;
  public userId!: number;
  public type!: SettlementType;
  public amount!: number;
  public rate!: number;
  public status!: SettlementStatus;
  public transactionId?: string;
  public settlementTime?: Date;
  public failureReason?: string;
  public remark?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Settlement.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    settlementNo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '结算单号',
    },
    orderId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '订单ID',
      references: {
        model: 'orders',
        key: 'id',
      },
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: '用户ID',
      references: {
        model: 'users',
        key: 'id',
      },
    },
    type: {
      type: DataTypes.ENUM(...Object.values(SettlementType)),
      allowNull: false,
      comment: '结算类型',
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '结算金额',
    },
    rate: {
      type: DataTypes.DECIMAL(5, 4),
      allowNull: false,
      comment: '费率',
    },
    status: {
      type: DataTypes.ENUM(...Object.values(SettlementStatus)),
      allowNull: false,
      defaultValue: SettlementStatus.PENDING,
      comment: '结算状态',
    },
    transactionId: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '交易流水号',
    },
    settlementTime: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '结算时间',
    },
    failureReason: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '失败原因',
    },
    remark: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '备注',
    },
  },
  {
    sequelize,
    tableName: 'settlements',
    modelName: 'Settlement',
    indexes: [
      { fields: ['orderId'] },
      { fields: ['userId'] },
      { fields: ['status'] },
      { fields: ['type'] },
    ],
  }
);

Settlement.belongsTo(Order, { as: 'order', foreignKey: 'orderId' });
Settlement.belongsTo(User, { as: 'user', foreignKey: 'userId' });
Order.hasMany(Settlement, { as: 'settlements', foreignKey: 'orderId' });

export default Settlement;
