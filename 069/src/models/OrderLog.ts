import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Order from './Order';
import User from './User';

export interface OrderLogAttributes {
  id: number;
  orderId: number;
  status: string;
  operatorId?: number;
  operatorName?: string;
  description: string;
  location?: string;
  remark?: string;
}

export interface OrderLogCreationAttributes extends Optional<OrderLogAttributes, 'id'> {}

class OrderLog extends Model<OrderLogAttributes, OrderLogCreationAttributes> implements OrderLogAttributes {
  public id!: number;
  public orderId!: number;
  public status!: string;
  public operatorId?: number;
  public operatorName?: string;
  public description!: string;
  public location?: string;
  public remark?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public readonly order?: Order;
  public readonly operator?: User;
}

OrderLog.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    orderId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '订单ID'
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '订单状态'
    },
    operatorId: {
      type: DataTypes.INTEGER.UNSIGNED,
      comment: '操作人ID'
    },
    operatorName: {
      type: DataTypes.STRING(50),
      comment: '操作人姓名'
    },
    description: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: '操作描述'
    },
    location: {
      type: DataTypes.STRING(200),
      comment: '操作地点'
    },
    remark: {
      type: DataTypes.TEXT,
      comment: '备注'
    }
  },
  {
    sequelize,
    tableName: 'order_logs',
    modelName: 'OrderLog'
  }
);

OrderLog.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });
Order.hasMany(OrderLog, { foreignKey: 'orderId', as: 'logs' });
OrderLog.belongsTo(User, { foreignKey: 'operatorId', as: 'operator' });
User.hasMany(OrderLog, { foreignKey: 'operatorId' });

export default OrderLog;
