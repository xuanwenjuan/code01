import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { OrderStatus } from '../constants';

interface OrderStatusLogAttributes {
  id: number;
  orderId: number;
  orderNo: string;
  previousStatus?: OrderStatus;
  currentStatus: OrderStatus;
  operatorId?: number;
  operatorName?: string;
  remark?: string;
}

interface OrderStatusLogCreationAttributes extends Optional<OrderStatusLogAttributes, 'id' | 'previousStatus' | 'operatorId' | 'operatorName' | 'remark'> {}

class OrderStatusLog extends Model<OrderStatusLogAttributes, OrderStatusLogCreationAttributes> implements OrderStatusLogAttributes {
  public id!: number;
  public orderId!: number;
  public orderNo!: string;
  public previousStatus?: OrderStatus;
  public currentStatus!: OrderStatus;
  public operatorId?: number;
  public operatorName?: string;
  public remark?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

OrderStatusLog.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      comment: '日志ID'
    },
    orderId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '订单ID'
    },
    orderNo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '订单编号'
    },
    previousStatus: {
      type: DataTypes.ENUM(...Object.values(OrderStatus)),
      comment: '之前状态'
    },
    currentStatus: {
      type: DataTypes.ENUM(...Object.values(OrderStatus)),
      allowNull: false,
      comment: '当前状态'
    },
    operatorId: {
      type: DataTypes.INTEGER.UNSIGNED,
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
    comment: '订单状态流转记录表'
  }
);

export default OrderStatusLog;
