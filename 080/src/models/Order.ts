import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Auction from './Auction';
import Equipment from './Equipment';
import User from './User';

export enum OrderStatus {
  PENDING_PAYMENT = 'pending_payment',
  PAID = 'paid',
  PENDING_DELIVERY = 'pending_delivery',
  DELIVERED = 'delivered',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export interface OrderAttributes {
  id: number;
  orderNo: string;
  auctionId: number;
  equipmentId: number;
  buyerId: number;
  sellerId: number;
  finalPrice: number;
  depositAmount: number;
  commissionAmount: number;
  sellerReceivable: number;
  status: OrderStatus;
  paymentTime?: Date;
  deliveryTime?: Date;
  completedTime?: Date;
  remark?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderCreationAttributes extends Optional<OrderAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Order extends Model<OrderAttributes, OrderCreationAttributes> implements OrderAttributes {
  public id!: number;
  public orderNo!: string;
  public auctionId!: number;
  public equipmentId!: number;
  public buyerId!: number;
  public sellerId!: number;
  public finalPrice!: number;
  public depositAmount!: number;
  public commissionAmount!: number;
  public sellerReceivable!: number;
  public status!: OrderStatus;
  public paymentTime?: Date;
  public deliveryTime?: Date;
  public completedTime?: Date;
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
    },
    orderNo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      field: 'order_no',
    },
    auctionId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: 'auction_id',
    },
    equipmentId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: 'equipment_id',
    },
    buyerId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: 'buyer_id',
    },
    sellerId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: 'seller_id',
    },
    finalPrice: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      field: 'final_price',
    },
    depositAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      field: 'deposit_amount',
    },
    commissionAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      field: 'commission_amount',
    },
    sellerReceivable: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      field: 'seller_receivable',
    },
    status: {
      type: DataTypes.ENUM(...Object.values(OrderStatus)),
      allowNull: false,
      defaultValue: OrderStatus.PENDING_PAYMENT,
    },
    paymentTime: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'payment_time',
    },
    deliveryTime: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'delivery_time',
    },
    completedTime: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'completed_time',
    },
    remark: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'orders',
    timestamps: true,
  }
);

Order.belongsTo(Auction, { foreignKey: 'auctionId', as: 'auction' });
Order.belongsTo(Equipment, { foreignKey: 'equipmentId', as: 'equipment' });
Order.belongsTo(User, { foreignKey: 'buyerId', as: 'buyer' });
Order.belongsTo(User, { foreignKey: 'sellerId', as: 'seller' });

export default Order;
