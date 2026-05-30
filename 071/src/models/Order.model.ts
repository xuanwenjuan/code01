import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

export enum OrderStatus {
  PENDING_PAYMENT = 'pending_payment',
  PENDING_CONFIRM = 'pending_confirm',
  PAID = 'paid',
  DELIVERED = 'delivered',
  PICKED_UP = 'picked_up',
  COMPLETED = 'completed',
  REFUNDING = 'refunding',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled'
}

export interface OrderAttributes {
  id?: number;
  orderNo: string;
  userId: number;
  leaderId: number;
  groupBuyId: number;
  productId: number;
  productName: string;
  productImage?: string;
  specs?: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  commissionRate: number;
  commissionAmount: number;
  platformFee: number;
  receiverName: string;
  receiverPhone: string;
  pickupAddress: string;
  remark?: string;
  status: OrderStatus;
  payTime?: Date;
  deliveryTime?: Date;
  pickupTime?: Date;
  completeTime?: Date;
  cancelTime?: Date;
  cancelReason?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

class Order extends Model<OrderAttributes> implements OrderAttributes {
  public id!: number;
  public orderNo!: string;
  public userId!: number;
  public leaderId!: number;
  public groupBuyId!: number;
  public productId!: number;
  public productName!: string;
  public productImage?: string;
  public specs?: string;
  public quantity!: number;
  public unitPrice!: number;
  public totalAmount!: number;
  public commissionRate!: number;
  public commissionAmount!: number;
  public platformFee!: number;
  public receiverName!: string;
  public receiverPhone!: string;
  public pickupAddress!: string;
  public remark?: string;
  public status!: OrderStatus;
  public payTime?: Date;
  public deliveryTime?: Date;
  public pickupTime?: Date;
  public completeTime?: Date;
  public cancelTime?: Date;
  public cancelReason?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Order.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    orderNo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '订单号'
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '用户ID'
    },
    leaderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '团长ID'
    },
    groupBuyId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '拼团ID'
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '商品ID'
    },
    productName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '商品名称'
    },
    productImage: {
      type: DataTypes.STRING(255),
      comment: '商品图片'
    },
    specs: {
      type: DataTypes.STRING(100),
      comment: '规格'
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '数量'
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '单价'
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '总金额'
    },
    commissionRate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      comment: '佣金比例%'
    },
    commissionAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '佣金金额'
    },
    platformFee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '平台抽成'
    },
    receiverName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '收货人姓名'
    },
    receiverPhone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: '收货人电话'
    },
    pickupAddress: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: '自提地址'
    },
    remark: {
      type: DataTypes.TEXT,
      comment: '备注'
    },
    status: {
      type: DataTypes.ENUM(...Object.values(OrderStatus)),
      allowNull: false,
      defaultValue: OrderStatus.PENDING_PAYMENT,
      comment: '订单状态'
    },
    payTime: {
      type: DataTypes.DATE,
      comment: '支付时间'
    },
    deliveryTime: {
      type: DataTypes.DATE,
      comment: '配送时间'
    },
    pickupTime: {
      type: DataTypes.DATE,
      comment: '提货时间'
    },
    completeTime: {
      type: DataTypes.DATE,
      comment: '完成时间'
    },
    cancelTime: {
      type: DataTypes.DATE,
      comment: '取消时间'
    },
    cancelReason: {
      type: DataTypes.STRING(255),
      comment: '取消原因'
    }
  },
  {
    sequelize,
    modelName: 'Order',
    tableName: 'orders',
    timestamps: true
  }
);

export default Order;
