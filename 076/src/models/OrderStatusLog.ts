import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { OrderStatus } from '../types';

export interface OrderStatusLogAttributes {
  id: number;
  orderId: number;
  orderNo: string;
  fromStatus?: OrderStatus;
  toStatus: OrderStatus;
  operatorId?: number;
  operatorName?: string;
  remark?: string;
  createdAt?: Date;
}

interface OrderStatusLogCreationAttributes extends Optional<OrderStatusLogAttributes, 'id'> {}

class OrderStatusLog extends Model<OrderStatusLogAttributes, OrderStatusLogCreationAttributes> implements OrderStatusLogAttributes {
  public id!: number;
  public orderId!: number;
  public orderNo!: string;
  public fromStatus?: OrderStatus;
  public toStatus!: OrderStatus;
  public operatorId?: number;
  public operatorName?: string;
  public remark?: string;
  public readonly createdAt!: Date;
}

OrderStatusLog.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '订单ID'
    },
    orderNo: {
      type: DataTypes.STRING(32),
      allowNull: false,
      comment: '订单号'
    },
    fromStatus: {
      type: DataTypes.ENUM(...Object.values(OrderStatus)),
      comment: '原状态'
    },
    toStatus: {
      type: DataTypes.ENUM(...Object.values(OrderStatus)),
      allowNull: false,
      comment: '新状态'
    },
    operatorId: {
      type: DataTypes.INTEGER,
      comment: '操作人ID'
    },
    operatorName: {
      type: DataTypes.STRING(50),
      comment: '操作人姓名'
    },
    remark: {
      type: DataTypes.TEXT,
      comment: '备注'
    }
  },
  {
    sequelize,
    tableName: 'order_status_logs',
    modelName: 'OrderStatusLog',
    timestamps: true,
    updatedAt: false
  }
);

export default OrderStatusLog;
