import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '../database'
import { OrderStatus } from '../types'

interface OrderAttributes {
  id: number
  orderNo: string
  dealerId: number
  totalAmount: number
  productAmount: number
  discountAmount: number
  shippingFee: number
  paidAmount: number
  status: OrderStatus
  paymentMethod?: string
  paymentTime?: Date
  shippingAddress: string
  shippingContact: string
  shippingPhone: string
  trackingNumber?: string
  shippingTime?: Date
  signedTime?: Date
  cancelledTime?: Date
  cancelledReason?: string
  operatorId?: number
  remarks?: string
  createdAt: Date
  updatedAt: Date
}

interface OrderCreationAttributes extends Optional<OrderAttributes, 'id' | 'createdAt' | 'updatedAt' | 'discountAmount' | 'shippingFee' | 'paidAmount' | 'status'> {}

class Order extends Model<OrderAttributes, OrderCreationAttributes> implements OrderAttributes {
  public id!: number
  public orderNo!: string
  public dealerId!: number
  public totalAmount!: number
  public productAmount!: number
  public discountAmount!: number
  public shippingFee!: number
  public paidAmount!: number
  public status!: OrderStatus
  public paymentMethod?: string
  public paymentTime?: Date
  public shippingAddress!: string
  public shippingContact!: string
  public shippingPhone!: string
  public trackingNumber?: string
  public shippingTime?: Date
  public signedTime?: Date
  public cancelledTime?: Date
  public cancelledReason?: string
  public operatorId?: number
  public remarks?: string
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
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
    dealerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '经销商ID'
    },
    totalAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      comment: '订单总金额'
    },
    productAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      comment: '商品金额'
    },
    discountAmount: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
      comment: '优惠金额'
    },
    shippingFee: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      comment: '运费'
    },
    paidAmount: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
      comment: '已付金额'
    },
    status: {
      type: DataTypes.ENUM(...Object.values(OrderStatus)),
      allowNull: false,
      defaultValue: OrderStatus.PENDING_PAYMENT,
      comment: '订单状态'
    },
    paymentMethod: {
      type: DataTypes.STRING(50),
      comment: '支付方式'
    },
    paymentTime: {
      type: DataTypes.DATE,
      comment: '支付时间'
    },
    shippingAddress: {
      type: DataTypes.STRING(500),
      allowNull: false,
      comment: '收货地址'
    },
    shippingContact: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '收货人'
    },
    shippingPhone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: '收货电话'
    },
    trackingNumber: {
      type: DataTypes.STRING(100),
      comment: '物流单号'
    },
    shippingTime: {
      type: DataTypes.DATE,
      comment: '发货时间'
    },
    signedTime: {
      type: DataTypes.DATE,
      comment: '签收时间'
    },
    cancelledTime: {
      type: DataTypes.DATE,
      comment: '取消时间'
    },
    cancelledReason: {
      type: DataTypes.STRING(500),
      comment: '取消原因'
    },
    operatorId: {
      type: DataTypes.INTEGER,
      comment: '操作人ID'
    },
    remarks: {
      type: DataTypes.TEXT,
      comment: '备注'
    }
  },
  {
    sequelize,
    modelName: 'Order',
    tableName: 'orders',
    timestamps: true,
    indexes: [
      { fields: ['orderNo'] },
      { fields: ['dealerId'] },
      { fields: ['status'] },
      { fields: ['createdAt'] }
    ]
  }
)

export default Order
