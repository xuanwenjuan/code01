import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { OrderStatus, SeasonType } from '../constants';
import { v4 as uuidv4 } from 'uuid';

interface OrderAttributes {
  id: number;
  orderNo: string;
  userId: number;
  roomId: number;
  customerName: string;
  customerPhone: string;
  customerIdCard: string;
  checkInDate: Date;
  checkOutDate: Date;
  guestCount: number;
  seasonType: SeasonType;
  dailyPrice: number;
  totalDays: number;
  totalAmount: number;
  depositAmount: number;
  paidAmount: number;
  extraAmount: number;
  extraCharges?: string;
  status: OrderStatus;
  paidTime?: Date;
  checkInTime?: Date;
  checkOutTime?: Date;
  cancelTime?: Date;
  remark?: string;
}

interface OrderCreationAttributes extends Optional<OrderAttributes, 'id' | 'orderNo' | 'paidAmount' | 'paidTime' | 'checkInTime' | 'checkOutTime' | 'cancelTime' | 'remark'> {}

class Order extends Model<OrderAttributes, OrderCreationAttributes> implements OrderAttributes {
  public id!: number;
  public orderNo!: string;
  public userId!: number;
  public roomId!: number;
  public customerName!: string;
  public customerPhone!: string;
  public customerIdCard!: string;
  public checkInDate!: Date;
  public checkOutDate!: Date;
  public guestCount!: number;
  public seasonType!: SeasonType;
  public dailyPrice!: number;
  public totalDays!: number;
  public totalAmount!: number;
  public depositAmount!: number;
  public paidAmount!: number;
  public extraAmount!: number;
  public extraCharges?: string;
  public status!: OrderStatus;
  public paidTime?: Date;
  public checkInTime?: Date;
  public checkOutTime?: Date;
  public cancelTime?: Date;
  public remark?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Order.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      comment: '订单ID'
    },
    orderNo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      defaultValue: () => `HS${Date.now()}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
      comment: '订单编号'
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '用户ID'
    },
    roomId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '房源ID'
    },
    customerName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '客户姓名'
    },
    customerPhone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: '客户电话'
    },
    customerIdCard: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '客户身份证号'
    },
    checkInDate: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: '入住日期'
    },
    checkOutDate: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: '离店日期'
    },
    guestCount: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '入住人数'
    },
    seasonType: {
      type: DataTypes.ENUM(...Object.values(SeasonType)),
      allowNull: false,
      comment: '季节类型'
    },
    dailyPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '每日价格'
    },
    totalDays: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '总天数'
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '总金额'
    },
    depositAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '定金金额'
    },
    paidAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      comment: '已付金额'
    },
    extraAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      comment: '额外消费金额'
    },
    extraCharges: {
      type: DataTypes.TEXT,
      comment: '额外消费明细(JSON)'
    },
    status: {
      type: DataTypes.ENUM(...Object.values(OrderStatus)),
      allowNull: false,
      defaultValue: OrderStatus.PENDING_PAYMENT,
      comment: '订单状态'
    },
    paidTime: {
      type: DataTypes.DATE,
      comment: '支付时间'
    },
    checkInTime: {
      type: DataTypes.DATE,
      comment: '入住时间'
    },
    checkOutTime: {
      type: DataTypes.DATE,
      comment: '离店时间'
    },
    cancelTime: {
      type: DataTypes.DATE,
      comment: '取消时间'
    },
    remark: {
      type: DataTypes.TEXT,
      comment: '备注'
    }
  },
  {
    sequelize,
    tableName: 'orders',
    modelName: 'Order',
    comment: '订单表'
  }
);

export default Order;
