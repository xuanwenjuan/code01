import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database';
import { OrderStatus } from '../types';
import User from './User';
import AuntProfile from './AuntProfile';
import ServiceCategory from './ServiceCategory';

interface OrderAttributes {
  id: number;
  orderNo: string;
  userId: number;
  auntId?: number;
  categoryId: number;
  serviceAddress: string;
  servicePhone: string;
  serviceTime: Date;
  serviceDuration: number;
  contactName: string;
  totalAmount: number;
  actualAmount?: number;
  platformCommission?: number;
  auntIncome?: number;
  status: OrderStatus;
  requirement?: string;
  remark?: string;
  cancelReason?: string;
  expireTime?: Date;
  acceptTime?: Date;
  startTime?: Date;
  completeTime?: Date;
}

interface OrderCreationAttributes extends Optional<OrderAttributes, 'id' | 'auntId' | 'actualAmount' | 'platformCommission' | 'auntIncome' | 'requirement' | 'remark' | 'cancelReason' | 'expireTime' | 'acceptTime' | 'startTime' | 'completeTime'> {}

class Order extends Model<OrderAttributes, OrderCreationAttributes> implements OrderAttributes {
  public id!: number;
  public orderNo!: string;
  public userId!: number;
  public auntId?: number;
  public categoryId!: number;
  public serviceAddress!: string;
  public servicePhone!: string;
  public serviceTime!: Date;
  public serviceDuration!: number;
  public contactName!: string;
  public totalAmount!: number;
  public actualAmount?: number;
  public platformCommission?: number;
  public auntIncome?: number;
  public status!: OrderStatus;
  public requirement?: string;
  public remark?: string;
  public cancelReason?: string;
  public expireTime?: Date;
  public acceptTime?: Date;
  public startTime?: Date;
  public completeTime?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly user?: User;
  public readonly aunt?: AuntProfile;
  public readonly category?: ServiceCategory;
  public readonly statusLogs?: OrderStatusLog[];
  public readonly review?: OrderReview;
}

Order.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    orderNo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      field: 'order_no',
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'user_id',
    },
    auntId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'aunt_id',
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'category_id',
    },
    serviceAddress: {
      type: DataTypes.STRING(500),
      allowNull: false,
      field: 'service_address',
    },
    servicePhone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: 'service_phone',
    },
    serviceTime: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'service_time',
    },
    serviceDuration: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      field: 'service_duration',
    },
    contactName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'contact_name',
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'total_amount',
    },
    actualAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: 'actual_amount',
    },
    platformCommission: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: 'platform_commission',
    },
    auntIncome: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: 'aunt_income',
    },
    status: {
      type: DataTypes.ENUM(...Object.values(OrderStatus)),
      allowNull: false,
      defaultValue: OrderStatus.PENDING_PAYMENT,
    },
    requirement: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    remark: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    cancelReason: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'cancel_reason',
    },
    expireTime: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'expire_time',
    },
    acceptTime: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'accept_time',
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'start_time',
    },
    completeTime: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'complete_time',
    },
  },
  {
    sequelize,
    modelName: 'Order',
    tableName: 'orders',
    timestamps: true,
  }
);

Order.belongsTo(User, {
  as: 'user',
  foreignKey: 'userId',
});

Order.belongsTo(AuntProfile, {
  as: 'aunt',
  foreignKey: 'auntId',
});

Order.belongsTo(ServiceCategory, {
  as: 'category',
  foreignKey: 'categoryId',
});

User.hasMany(Order, {
  as: 'orders',
  foreignKey: 'userId',
});

AuntProfile.hasMany(Order, {
  as: 'orders',
  foreignKey: 'auntId',
});

ServiceCategory.hasMany(Order, {
  as: 'orders',
  foreignKey: 'categoryId',
});

export default Order;