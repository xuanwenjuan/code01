import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database';
import User from './User';
import Address from './Address';
import OrderItem from './OrderItem';

export enum OrderStatus {
  UNPAID = 'unpaid',
  PAID = 'paid',
  PACKING = 'packing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REFUNDING = 'refunding',
  REFUNDED = 'refunded',
}

export interface OrderAttributes {
  id: number;
  orderNo: string;
  userId: number;
  addressId: number;
  totalAmount: number;
  discountAmount?: number;
  payAmount: number;
  status: OrderStatus;
  payTime?: Date;
  remark?: string;
  cancelReason?: string;
  cancelTime?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface OrderCreationAttributes extends Optional<OrderAttributes, 'id'> {}

class Order extends Model<OrderAttributes, OrderCreationAttributes> implements OrderAttributes {
  public id!: number;
  public orderNo!: string;
  public userId!: number;
  public addressId!: number;
  public totalAmount!: number;
  public discountAmount?: number;
  public payAmount!: number;
  public status!: OrderStatus;
  public payTime?: Date;
  public remark?: string;
  public cancelReason?: string;
  public cancelTime?: Date;

  public readonly user?: User;
  public readonly address?: Address;
  public readonly items?: OrderItem[];
}

Order.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    orderNo: {
      type: DataTypes.STRING(32),
      allowNull: false,
      unique: true,
      field: 'order_no',
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: 'user_id',
    },
    addressId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: 'address_id',
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'total_amount',
    },
    discountAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
      field: 'discount_amount',
    },
    payAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'pay_amount',
    },
    status: {
      type: DataTypes.ENUM(...Object.values(OrderStatus)),
      allowNull: false,
      defaultValue: OrderStatus.UNPAID,
    },
    payTime: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'pay_time',
    },
    remark: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    cancelReason: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'cancel_reason',
    },
    cancelTime: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'cancel_time',
    },
  },
  {
    sequelize,
    tableName: 'orders',
  }
);

Order.belongsTo(User, { as: 'user', foreignKey: 'userId' });
Order.belongsTo(Address, { as: 'address', foreignKey: 'addressId' });
User.hasMany(Order, { as: 'orders', foreignKey: 'userId' });

export default Order;
