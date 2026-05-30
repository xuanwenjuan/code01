import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database';
import Order from './Order';
import User from './User';

export enum RefundStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  REFUNDING = 'refunding',
  COMPLETED = 'completed',
}

export enum RefundType {
  CANCEL_UNSHIPPED = 'cancel_unshipped',
  RETURN_AFTER_DELIVERY = 'return_after_delivery',
}

export interface RefundAttributes {
  id: number;
  orderId: number;
  userId: number;
  refundNo: string;
  type: RefundType;
  amount: number;
  reason: string;
  images?: string;
  status: RefundStatus;
  auditRemark?: string;
  auditTime?: Date;
  refundTime?: Date;
}

export interface RefundCreationAttributes extends Optional<RefundAttributes, 'id'> {}

class Refund extends Model<RefundAttributes, RefundCreationAttributes> implements RefundAttributes {
  public id!: number;
  public orderId!: number;
  public userId!: number;
  public refundNo!: string;
  public type!: RefundType;
  public amount!: number;
  public reason!: string;
  public images?: string;
  public status!: RefundStatus;
  public auditRemark?: string;
  public auditTime?: Date;
  public refundTime?: Date;

  public readonly order?: Order;
  public readonly user?: User;
}

Refund.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    orderId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: 'order_id',
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: 'user_id',
    },
    refundNo: {
      type: DataTypes.STRING(32),
      allowNull: false,
      unique: true,
      field: 'refund_no',
    },
    type: {
      type: DataTypes.ENUM(...Object.values(RefundType)),
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    reason: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    images: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '退款凭证图片，JSON 数组',
    },
    status: {
      type: DataTypes.ENUM(...Object.values(RefundStatus)),
      allowNull: false,
      defaultValue: RefundStatus.PENDING,
    },
    auditRemark: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'audit_remark',
    },
    auditTime: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'audit_time',
    },
    refundTime: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'refund_time',
    },
  },
  {
    sequelize,
    tableName: 'refunds',
  }
);

Refund.belongsTo(Order, { as: 'order', foreignKey: 'orderId' });
Refund.belongsTo(User, { as: 'user', foreignKey: 'userId' });
Order.hasMany(Refund, { as: 'refunds', foreignKey: 'orderId' });
User.hasMany(Refund, { as: 'refunds', foreignKey: 'userId' });

export default Refund;
