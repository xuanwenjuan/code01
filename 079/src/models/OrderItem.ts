import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '../database'

interface OrderItemAttributes {
  id: number
  orderId: number
  productId: number
  productName: string
  productCode: string
  productImage?: string
  specification?: string
  unit: string
  unitPrice: number
  quantity: number
  totalPrice: number
  createdAt: Date
  updatedAt: Date
}

interface OrderItemCreationAttributes extends Optional<OrderItemAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class OrderItem extends Model<OrderItemAttributes, OrderItemCreationAttributes> implements OrderItemAttributes {
  public id!: number
  public orderId!: number
  public productId!: number
  public productName!: string
  public productCode!: string
  public productImage?: string
  public specification?: string
  public unit!: string
  public unitPrice!: number
  public quantity!: number
  public totalPrice!: number
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

OrderItem.init(
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
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '商品ID'
    },
    productName: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: '商品名称'
    },
    productCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '商品编码'
    },
    productImage: {
      type: DataTypes.STRING(255),
      comment: '商品图片'
    },
    specification: {
      type: DataTypes.STRING(200),
      comment: '规格'
    },
    unit: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: '单位'
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '单价'
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '数量'
    },
    totalPrice: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      comment: '总价'
    }
  },
  {
    sequelize,
    modelName: 'OrderItem',
    tableName: 'order_items',
    timestamps: true,
    indexes: [
      { fields: ['orderId'] },
      { fields: ['productId'] }
    ]
  }
)

export default OrderItem
