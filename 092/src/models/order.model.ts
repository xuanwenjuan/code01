import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { OrderStatus, PaymentStatus } from '../common/enums';
import User from './user.model';

interface OrderAttributes {
  id: number;
  orderNo: string;
  eventName: string;
  eventLocation: string;
  startTime: Date;
  endTime: Date;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  totalAmount: number;
  depositAmount: number;
  paidAmount: number;
  damageAmount?: number;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  remarks?: string;
  createdBy: number;
  confirmedBy?: number;
  confirmedAt?: Date;
  outboundBy?: number;
  outboundAt?: Date;
  returnedBy?: number;
  returnedAt?: Date;
  completedBy?: number;
  completedAt?: Date;
  cancelledBy?: number;
  cancelledAt?: Date;
  cancelReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface OrderCreationAttributes extends Optional<OrderAttributes, 'id' | 'createdAt' | 'updatedAt' | 'paidAmount' | 'customerEmail' | 'remarks' | 'confirmedBy' | 'confirmedAt' | 'outboundBy' | 'outboundAt' | 'returnedBy' | 'returnedAt' | 'completedBy' | 'completedAt' | 'cancelledBy' | 'cancelledAt' | 'cancelReason'> {}

class Order extends Model<OrderAttributes, OrderCreationAttributes> implements OrderAttributes {
  public id!: number;
  public orderNo!: string;
  public eventName!: string;
  public eventLocation!: string;
  public startTime!: Date;
  public endTime!: Date;
  public customerName!: string;
  public customerPhone!: string;
  public customerEmail?: string;
  public totalAmount!: number;
  public depositAmount!: number;
  public paidAmount!: number;
  public damageAmount!: number;
  public paymentStatus!: PaymentStatus;
  public status!: OrderStatus;
  public remarks?: string;
  public createdBy!: number;
  public confirmedBy?: number;
  public confirmedAt?: Date;
  public outboundBy?: number;
  public outboundAt?: Date;
  public returnedBy?: number;
  public returnedAt?: Date;
  public completedBy?: number;
  public completedAt?: Date;
  public cancelledBy?: number;
  public cancelledAt?: Date;
  public cancelReason?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public readonly creator?: User;
}

Order.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    orderNo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '订单编号',
    },
    eventName: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: '活动名称',
    },
    eventLocation: {
      type: DataTypes.STRING(500),
      allowNull: false,
      comment: '活动地点',
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: '开始时间',
    },
    endTime: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: '结束时间',
    },
    customerName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '客户姓名',
    },
    customerPhone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: '客户电话',
    },
    customerEmail: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '客户邮箱',
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '总金额',
    },
    depositAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '定金金额',
    },
    paidAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      comment: '已付金额',
    },
    damageAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      comment: '破损赔偿总金额',
    },
    paymentStatus: {
      type: DataTypes.ENUM(...Object.values(PaymentStatus)),
      allowNull: false,
      defaultValue: PaymentStatus.UNPAID,
      comment: '支付状态',
    },
    status: {
      type: DataTypes.ENUM(...Object.values(OrderStatus)),
      allowNull: false,
      defaultValue: OrderStatus.PENDING_DEPOSIT,
      comment: '订单状态',
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '备注',
    },
    createdBy: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '创建人',
    },
    confirmedBy: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: '确认人',
    },
    confirmedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '确认时间',
    },
    outboundBy: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: '出库人',
    },
    outboundAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '出库时间',
    },
    returnedBy: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: '归还人',
    },
    returnedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '归还时间',
    },
    completedBy: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: '完成人',
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '完成时间',
    },
    cancelledBy: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: '取消人',
    },
    cancelledAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '取消时间',
    },
    cancelReason: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '取消原因',
    },
  },
  {
    sequelize,
    tableName: 'orders',
    comment: '订单表',
  }
);

Order.belongsTo(User, { as: 'creator', foreignKey: 'createdBy' });
User.hasMany(Order, { as: 'orders', foreignKey: 'createdBy' });

export default Order;