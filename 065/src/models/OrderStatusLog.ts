import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database';
import { OrderStatus } from '../types';
import Order from './Order';

interface OrderStatusLogAttributes {
  id: number;
  orderId: number;
  oldStatus?: OrderStatus;
  newStatus: OrderStatus;
  operatorId?: number;
  operatorRole?: string;
  remark?: string;
}

interface OrderStatusLogCreationAttributes extends Optional<OrderStatusLogAttributes, 'id' | 'oldStatus' | 'operatorId' | 'operatorRole' | 'remark'> {}

class OrderStatusLog extends Model<OrderStatusLogAttributes, OrderStatusLogCreationAttributes> implements OrderStatusLogAttributes {
  public id!: number;
  public orderId!: number;
  public oldStatus?: OrderStatus;
  public newStatus!: OrderStatus;
  public operatorId?: number;
  public operatorRole?: string;
  public remark?: string;
  public readonly createdAt!: Date;
}

OrderStatusLog.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'order_id',
    },
    oldStatus: {
      type: DataTypes.ENUM(...Object.values(OrderStatus)),
      allowNull: true,
      field: 'old_status',
    },
    newStatus: {
      type: DataTypes.ENUM(...Object.values(OrderStatus)),
      allowNull: false,
      field: 'new_status',
    },
    operatorId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'operator_id',
    },
    operatorRole: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'operator_role',
    },
    remark: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'OrderStatusLog',
    tableName: 'order_status_logs',
    timestamps: true,
    updatedAt: false,
  }
);

OrderStatusLog.belongsTo(Order, {
  as: 'order',
  foreignKey: 'orderId',
});

Order.hasMany(OrderStatusLog, {
  as: 'statusLogs',
  foreignKey: 'orderId',
});

export default OrderStatusLog;
