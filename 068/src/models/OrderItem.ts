import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database';
import Order from './Order';
import Product from './Product';

export interface OrderItemAttributes {
  id: number;
  orderId: number;
  productId: number;
  productName: string;
  productImage?: string;
  price: number;
  quantity: number;
  totalPrice: number;
}

export interface OrderItemCreationAttributes extends Optional<OrderItemAttributes, 'id'> {}

class OrderItem extends Model<OrderItemAttributes, OrderItemCreationAttributes> implements OrderItemAttributes {
  public id!: number;
  public orderId!: number;
  public productId!: number;
  public productName!: string;
  public productImage?: string;
  public price!: number;
  public quantity!: number;
  public totalPrice!: number;

  public readonly order?: Order;
  public readonly product?: Product;
}

OrderItem.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    orderId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: 'order_id',
    },
    productId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: 'product_id',
    },
    productName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'product_name',
    },
    productImage: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'product_image',
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 1,
    },
    totalPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'total_price',
    },
  },
  {
    sequelize,
    tableName: 'order_items',
  }
);

OrderItem.belongsTo(Order, { as: 'order', foreignKey: 'orderId' });
OrderItem.belongsTo(Product, { as: 'product', foreignKey: 'productId' });
Order.hasMany(OrderItem, { as: 'items', foreignKey: 'orderId' });
Product.hasMany(OrderItem, { as: 'orderItems', foreignKey: 'productId' });

export default OrderItem;
