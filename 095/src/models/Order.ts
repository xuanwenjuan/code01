import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import { OrderStatus } from '../types';
import User from './User';
import OrderItem from './OrderItem';

class Order extends Model {
  public items?: OrderItem[];
  public id!: number;
  public orderNo!: string;
  public companyName!: string;
  public contactPerson!: string;
  public contactPhone!: string;
  public totalAmount!: number;
  public depositAmount!: number;
  public status!: OrderStatus;
  public logoDesign!: string;
  public customRequirements!: string;
  public sizeStatistics!: string;
  public productionStartDate!: Date | null;
  public productionEndDate!: Date | null;
  public qualityCheckDate!: Date | null;
  public shipDate!: Date | null;
  public trackingNumber!: string;
  public shippingAddress!: string;
  public remarks!: string;
  public createdBy!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
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
    },
    companyName: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    contactPerson: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    contactPhone: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    totalAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    depositAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(OrderStatus)),
      allowNull: false,
      defaultValue: OrderStatus.PENDING_PAYMENT,
    },
    logoDesign: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const rawValue = this.getDataValue('logoDesign');
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(value: string[]) {
        this.setDataValue('logoDesign', JSON.stringify(value));
      },
    },
    customRequirements: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    sizeStatistics: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const rawValue = this.getDataValue('sizeStatistics');
        return rawValue ? JSON.parse(rawValue) : {};
      },
      set(value: object) {
        this.setDataValue('sizeStatistics', JSON.stringify(value));
      },
    },
    productionStartDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    productionEndDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    qualityCheckDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    shipDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    trackingNumber: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    shippingAddress: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
  },
  {
    sequelize,
    modelName: 'Order',
    tableName: 'orders',
  }
);

Order.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
User.hasMany(Order, { foreignKey: 'createdBy', as: 'orders' });

Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

export default Order;