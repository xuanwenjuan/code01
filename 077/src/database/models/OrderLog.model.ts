import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../index';

interface OrderLogAttributes {
  id: number;
  orderId: number;
  operatorId?: number;
  action: string;
  oldStatus?: string;
  newStatus?: string;
  description?: string;
  createdAt: Date;
}

interface OrderLogCreationAttributes extends Optional<OrderLogAttributes, 'id' | 'createdAt'> {}

class OrderLog extends Model<OrderLogAttributes, OrderLogCreationAttributes> implements OrderLogAttributes {
  public id!: number;
  public orderId!: number;
  public operatorId?: number;
  public action!: string;
  public oldStatus?: string;
  public newStatus?: string;
  public description?: string;
  public readonly createdAt!: Date;
}

OrderLog.init(
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
    operatorId: {
      type: DataTypes.INTEGER,
      comment: '操作员ID'
    },
    action: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '操作类型'
    },
    oldStatus: {
      type: DataTypes.STRING(50),
      comment: '旧状态'
    },
    newStatus: {
      type: DataTypes.STRING(50),
      comment: '新状态'
    },
    description: {
      type: DataTypes.TEXT,
      comment: '描述'
    }
  },
  {
    sequelize,
    modelName: 'OrderLog',
    tableName: 'order_logs',
    timestamps: true,
    updatedAt: false,
    indexes: [
      { fields: ['orderId'] },
      { fields: ['operatorId'] },
      { fields: ['createdAt'] }
    ]
  }
);

export default OrderLog;
