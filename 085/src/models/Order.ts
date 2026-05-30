import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database';
import { OrderStatus } from '../types';
import { User } from './User';
import { Product } from './Product';
import { Artist } from './Artist';

interface OrderAttributes {
  id: number;
  orderNo: string;
  userId: number;
  totalAmount: number;
  status: OrderStatus;
  paymentMethod?: string;
  paymentTime?: Date;
  shippingAddress?: string;
  shippingTime?: Date;
  receiveTime?: Date;
  customNote?: string;
  cancelReason?: string;
  cancelTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface OrderCreationAttributes extends Optional<OrderAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Order extends Model<OrderAttributes, OrderCreationAttributes> implements OrderAttributes {
  public id!: number;
  public orderNo!: string;
  public userId!: number;
  public totalAmount!: number;
  public status!: OrderStatus;
  public paymentMethod?: string;
  public paymentTime?: Date;
  public shippingAddress?: string;
  public shippingTime?: Date;
  public receiveTime?: Date;
  public customNote?: string;
  public cancelReason?: string;
  public cancelTime?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public readonly user?: User;
  public readonly items?: OrderItem[];
}

Order.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    orderNo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '订单号'
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM(...Object.values(OrderStatus)),
      allowNull: false,
      defaultValue: OrderStatus.PENDING_PAYMENT
    },
    paymentMethod: {
      type: DataTypes.STRING(50)
    },
    paymentTime: {
      type: DataTypes.DATE
    },
    shippingAddress: {
      type: DataTypes.TEXT
    },
    shippingTime: {
      type: DataTypes.DATE
    },
    receiveTime: {
      type: DataTypes.DATE
    },
    customNote: {
      type: DataTypes.TEXT,
      comment: '定制需求备注'
    },
    cancelReason: {
      type: DataTypes.STRING(255)
    },
    cancelTime: {
      type: DataTypes.DATE
    }
  },
  {
    sequelize,
    modelName: 'Order',
    tableName: 'orders',
    indexes: [
      { fields: ['orderNo'], unique: true },
      { fields: ['userId'] },
      { fields: ['status'] },
      { fields: ['createdAt'] }
    ]
  }
);

Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });

interface OrderItemAttributes {
  id: number;
  orderId: number;
  productId: number;
  artistId: number;
  productName: string;
  productPrice: number;
  quantity: number;
  subtotal: number;
  createdAt: Date;
  updatedAt: Date;
}

interface OrderItemCreationAttributes extends Optional<OrderItemAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class OrderItem extends Model<OrderItemAttributes, OrderItemCreationAttributes> implements OrderItemAttributes {
  public id!: number;
  public orderId!: number;
  public productId!: number;
  public artistId!: number;
  public productName!: string;
  public productPrice!: number;
  public quantity!: number;
  public subtotal!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public readonly product?: Product;
  public readonly artist?: Artist;
}

OrderItem.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    orderId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    productId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    artistId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    productName: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    productPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    quantity: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    }
  },
  {
    sequelize,
    modelName: 'OrderItem',
    tableName: 'order_items',
    indexes: [
      { fields: ['orderId'] },
      { fields: ['productId'] },
      { fields: ['artistId'] }
    ]
  }
);

Order.hasMany(OrderItem, { as: 'items', foreignKey: 'orderId' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });
OrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
OrderItem.belongsTo(Artist, { foreignKey: 'artistId', as: 'artist' });

export { Order, OrderAttributes, OrderCreationAttributes, OrderItem, OrderItemAttributes, OrderItemCreationAttributes };
