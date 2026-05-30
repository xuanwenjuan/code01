import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { OrderStatus } from '../types';

export interface OrderAttributes {
  id: number;
  orderNo: string;
  userId: number;
  storeId: number;
  productId: number;
  productName: string;
  productImage?: string;
  size?: string;
  flavor?: string;
  customization?: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  deliveryAddress: string;
  deliveryPhone: string;
  deliveryName: string;
  deliveryTime?: Date;
  riderId?: number;
  status: OrderStatus;
  remark?: string;
  paidAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface OrderCreationAttributes extends Optional<OrderAttributes, 'id'> {}

class Order extends Model<OrderAttributes, OrderCreationAttributes> implements OrderAttributes {
  public id!: number;
  public orderNo!: string;
  public userId!: number;
  public storeId!: number;
  public productId!: number;
  public productName!: string;
  public productImage?: string;
  public size?: string;
  public flavor?: string;
  public customization?: string;
  public quantity!: number;
  public unitPrice!: number;
  public totalAmount!: number;
  public deliveryAddress!: string;
  public deliveryPhone!: string;
  public deliveryName!: string;
  public deliveryTime?: Date;
  public riderId?: number;
  public status!: OrderStatus;
  public remark?: string;
  public paidAt?: Date;
  public startedAt?: Date;
  public completedAt?: Date;
  public cancelledAt?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Order.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    orderNo: {
      type: DataTypes.STRING(32),
      allowNull: false,
      unique: true,
      comment: '订单号'
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '用户ID'
    },
    storeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '门店ID'
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '产品ID'
    },
    productName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '产品名称'
    },
    productImage: {
      type: DataTypes.STRING(255),
      comment: '产品图片'
    },
    size: {
      type: DataTypes.STRING(50),
      comment: '尺寸'
    },
    flavor: {
      type: DataTypes.STRING(50),
      comment: '口味'
    },
    customization: {
      type: DataTypes.TEXT,
      comment: '定制要求'
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
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
    deliveryAddress: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: '配送地址'
    },
    deliveryPhone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: '配送电话'
    },
    deliveryName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '收货人'
    },
    deliveryTime: {
      type: DataTypes.DATE,
      comment: '期望配送时间'
    },
    riderId: {
      type: DataTypes.INTEGER,
      comment: '骑手ID'
    },
    status: {
      type: DataTypes.ENUM(...Object.values(OrderStatus)),
      allowNull: false,
      defaultValue: OrderStatus.PENDING_PAYMENT,
      comment: '订单状态'
    },
    remark: {
      type: DataTypes.TEXT,
      comment: '备注'
    },
    paidAt: {
      type: DataTypes.DATE,
      comment: '支付时间'
    },
    startedAt: {
      type: DataTypes.DATE,
      comment: '开始制作时间'
    },
    completedAt: {
      type: DataTypes.DATE,
      comment: '完成时间'
    },
    cancelledAt: {
      type: DataTypes.DATE,
      comment: '取消时间'
    }
  },
  {
    sequelize,
    tableName: 'orders',
    modelName: 'Order',
    timestamps: true
  }
);

export default Order;
