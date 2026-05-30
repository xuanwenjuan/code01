import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import Order from './Order';
import User from './User';
import { OrderStatus } from '../types';

class OrderLog extends Model {
  public id!: number;
  public orderId!: number;
  public operatorId!: number;
  public operatorName!: string;
  public previousStatus!: OrderStatus | null;
  public newStatus!: OrderStatus;
  public action!: string;
  public remarks!: string;
  public readonly createdAt!: Date;
}

OrderLog.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Order,
        key: 'id',
      },
    },
    operatorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    operatorName: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    previousStatus: {
      type: DataTypes.ENUM(...Object.values(OrderStatus)),
      allowNull: true,
    },
    newStatus: {
      type: DataTypes.ENUM(...Object.values(OrderStatus)),
      allowNull: false,
    },
    action: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'OrderLog',
    tableName: 'order_logs',
    timestamps: true,
    updatedAt: false,
  }
);

OrderLog.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });
Order.hasMany(OrderLog, { foreignKey: 'orderId', as: 'logs' });
OrderLog.belongsTo(User, { foreignKey: 'operatorId', as: 'operator' });
User.hasMany(OrderLog, { foreignKey: 'operatorId', as: 'orderLogs' });

export default OrderLog;