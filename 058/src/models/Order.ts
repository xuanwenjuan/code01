import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { OrderStatus, OrderType } from '../types';

interface OrderAttributes {
  id: number;
  orderNo: string;
  userId: number;
  riderId?: number;
  type: OrderType;
  categoryId: number;
  title: string;
  description?: string;
  pickupAddress: string;
  pickupLat?: number;
  pickupLng?: number;
  pickupContact: string;
  pickupPhone: string;
  deliveryAddress: string;
  deliveryLat?: number;
  deliveryLng?: number;
  deliveryContact: string;
  deliveryPhone: string;
  distance: number;
  weight?: number;
  goodsValue?: number;
  baseAmount: number;
  premiumAmount: number;
  totalAmount: number;
  riderCommission: number;
  platformFee: number;
  status: OrderStatus;
  remark?: string;
  cancelReason?: string;
  cancelledAt?: Date;
  acceptedAt?: Date;
  pickedUpAt?: Date;
  deliveredAt?: Date;
  completedAt?: Date;
}

interface OrderCreationAttributes extends Optional<OrderAttributes, 'id' | 'riderId' | 'description' | 'pickupLat' | 'pickupLng' | 'deliveryLat' | 'deliveryLng' | 'weight' | 'goodsValue' | 'remark' | 'cancelReason' | 'cancelledAt' | 'acceptedAt' | 'pickedUpAt' | 'deliveredAt' | 'completedAt'> {}

class Order extends Model<OrderAttributes, OrderCreationAttributes> implements OrderAttributes {
  public id!: number;
  public orderNo!: string;
  public userId!: number;
  public riderId?: number;
  public type!: OrderType;
  public categoryId!: number;
  public title!: string;
  public description?: string;
  public pickupAddress!: string;
  public pickupLat?: number;
  public pickupLng?: number;
  public pickupContact!: string;
  public pickupPhone!: string;
  public deliveryAddress!: string;
  public deliveryLat?: number;
  public deliveryLng?: number;
  public deliveryContact!: string;
  public deliveryPhone!: string;
  public distance!: number;
  public weight?: number;
  public goodsValue?: number;
  public baseAmount!: number;
  public premiumAmount!: number;
  public totalAmount!: number;
  public riderCommission!: number;
  public platformFee!: number;
  public status!: OrderStatus;
  public remark?: string;
  public cancelReason?: string;
  public cancelledAt?: Date;
  public acceptedAt?: Date;
  public pickedUpAt?: Date;
  public deliveredAt?: Date;
  public completedAt?: Date;
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
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'user',
        key: 'id'
      }
    },
    riderId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'rider',
        key: 'id'
      }
    },
    type: {
      type: DataTypes.ENUM(...Object.values(OrderType)),
      allowNull: false
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'category',
        key: 'id'
      }
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    pickupAddress: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    pickupLat: {
      type: DataTypes.DECIMAL(10, 7)
    },
    pickupLng: {
      type: DataTypes.DECIMAL(10, 7)
    },
    pickupContact: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    pickupPhone: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    deliveryAddress: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    deliveryLat: {
      type: DataTypes.DECIMAL(10, 7)
    },
    deliveryLng: {
      type: DataTypes.DECIMAL(10, 7)
    },
    deliveryContact: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    deliveryPhone: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    distance: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    weight: {
      type: DataTypes.DECIMAL(10, 2)
    },
    goodsValue: {
      type: DataTypes.DECIMAL(10, 2)
    },
    baseAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    premiumAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    riderCommission: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    platformFee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    status: {
      type: DataTypes.ENUM(...Object.values(OrderStatus)),
      allowNull: false,
      defaultValue: OrderStatus.PENDING
    },
    remark: {
      type: DataTypes.TEXT
    },
    cancelReason: {
      type: DataTypes.STRING(500)
    },
    cancelledAt: {
      type: DataTypes.DATE
    },
    acceptedAt: {
      type: DataTypes.DATE
    },
    pickedUpAt: {
      type: DataTypes.DATE
    },
    deliveredAt: {
      type: DataTypes.DATE
    },
    completedAt: {
      type: DataTypes.DATE
    }
  },
  {
    sequelize,
    tableName: 'order',
    modelName: 'Order'
  }
);

export default Order;
