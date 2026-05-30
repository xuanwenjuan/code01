import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { OrderStatus } from '../types';
import Order from './Order';

interface OrderStatusHistoryAttributes {
  id: string;
  orderId: string;
  fromStatus?: OrderStatus;
  toStatus: OrderStatus;
  operatorId?: string;
  operatorName?: string;
  remark?: string;
  createdAt: Date;
}

interface OrderStatusHistoryCreationAttributes extends Optional<OrderStatusHistoryAttributes, 'id' | 'createdAt'> {}

class OrderStatusHistory extends Model<OrderStatusHistoryAttributes, OrderStatusHistoryCreationAttributes> implements OrderStatusHistoryAttributes {
  public id!: string;
  public orderId!: string;
  public fromStatus?: OrderStatus;
  public toStatus!: OrderStatus;
  public operatorId?: string;
  public operatorName?: string;
  public remark?: string;
  public readonly createdAt!: Date;

  public readonly order?: Order;
}

OrderStatusHistory.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    orderId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'order_id',
      references: {
        model: 'orders',
        key: 'id'
      }
    },
    fromStatus: {
      type: DataTypes.ENUM(...Object.values(OrderStatus)),
      allowNull: true,
      field: 'from_status'
    },
    toStatus: {
      type: DataTypes.ENUM(...Object.values(OrderStatus)),
      allowNull: false,
      field: 'to_status'
    },
    operatorId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'operator_id'
    },
    operatorName: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'operator_name'
    },
    remark: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: 'order_status_history',
    timestamps: true,
    updatedAt: false
  }
);

OrderStatusHistory.belongsTo(Order, {
  foreignKey: 'order_id',
  as: 'order'
});

export default OrderStatusHistory;
