import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { OrderStatus } from '../types';
import Order from './Order';
import User from './User';

interface OrderProcessLogAttributes {
  id: number;
  orderId: number;
  previousStatus?: OrderStatus;
  newStatus: OrderStatus;
  operatorId?: number;
  remark?: string;
}

interface OrderProcessLogCreationAttributes extends Optional<OrderProcessLogAttributes, 'id'> {}

class OrderProcessLog extends Model<OrderProcessLogAttributes, OrderProcessLogCreationAttributes> implements OrderProcessLogAttributes {
  public id!: number;
  public orderId!: number;
  public previousStatus?: OrderStatus;
  public newStatus!: OrderStatus;
  public operatorId?: number;
  public remark?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public readonly order?: Order;
  public readonly operator?: User;
}

OrderProcessLog.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    orderId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'orders',
        key: 'id',
      },
    },
    previousStatus: {
      type: DataTypes.ENUM(...Object.values(OrderStatus)),
    },
    newStatus: {
      type: DataTypes.ENUM(...Object.values(OrderStatus)),
      allowNull: false,
    },
    operatorId: {
      type: DataTypes.INTEGER.UNSIGNED,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    remark: {
      type: DataTypes.TEXT,
    },
  },
  {
    sequelize,
    modelName: 'OrderProcessLog',
    tableName: 'order_process_logs',
    timestamps: true,
    updatedAt: false,
  }
);

OrderProcessLog.belongsTo(Order, { as: 'order', foreignKey: 'orderId' });
OrderProcessLog.belongsTo(User, { as: 'operator', foreignKey: 'operatorId' });
Order.hasMany(OrderProcessLog, { as: 'processLogs', foreignKey: 'orderId' });

export default OrderProcessLog;
