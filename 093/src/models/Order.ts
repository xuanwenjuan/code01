import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { OrderStatus } from '../types';
import Category from './Category';
import Material from './Material';
import User from './User';

interface OrderAttributes {
  id: number;
  orderNo: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  categoryId: number;
  materialId?: number;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  drawingUrl?: string;
  requirements?: string;
  status: OrderStatus;
  paidAt?: Date;
  estimatedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
  completedAt?: Date;
  trackingNumber?: string;
  remark?: string;
  createdBy?: number;
  assignedTo?: number;
  scheduledQuantity?: number;
  actualMaterialUsed?: number;
  laborHours?: number;
  machineHours?: number;
  materialCost?: number;
  laborCost?: number;
  machineCost?: number;
  additionalCosts?: number;
  totalProductionCost?: number;
  materialWastage?: number;
  wastageRate?: number;
}

interface OrderCreationAttributes extends Optional<OrderAttributes, 'id' | 'status'> {}

class Order extends Model<OrderAttributes, OrderCreationAttributes> implements OrderAttributes {
  public id!: number;
  public orderNo!: string;
  public customerName!: string;
  public customerPhone!: string;
  public customerEmail?: string;
  public categoryId!: number;
  public materialId?: number;
  public quantity!: number;
  public unitPrice!: number;
  public totalAmount!: number;
  public drawingUrl?: string;
  public requirements?: string;
  public status!: OrderStatus;
  public paidAt?: Date;
  public estimatedDeliveryDate?: Date;
  public actualDeliveryDate?: Date;
  public completedAt?: Date;
  public trackingNumber?: string;
  public remark?: string;
  public createdBy?: number;
  public assignedTo?: number;
  public scheduledQuantity?: number;
  public actualMaterialUsed?: number;
  public laborHours?: number;
  public machineHours?: number;
  public materialCost?: number;
  public laborCost?: number;
  public machineCost?: number;
  public additionalCosts?: number;
  public totalProductionCost?: number;
  public materialWastage?: number;
  public wastageRate?: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt?: Date;

  public readonly category?: Category;
  public readonly material?: Material;
  public readonly creator?: User;
  public readonly assignee?: User;
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
    },
    customerName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    customerPhone: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    customerEmail: {
      type: DataTypes.STRING(100),
    },
    categoryId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'categories',
        key: 'id',
      },
    },
    materialId: {
      type: DataTypes.INTEGER.UNSIGNED,
      references: {
        model: 'materials',
        key: 'id',
      },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    drawingUrl: {
      type: DataTypes.STRING(255),
    },
    requirements: {
      type: DataTypes.TEXT,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(OrderStatus)),
      allowNull: false,
      defaultValue: OrderStatus.PENDING_PAYMENT,
    },
    paidAt: {
      type: DataTypes.DATE,
    },
    estimatedDeliveryDate: {
      type: DataTypes.DATE,
    },
    actualDeliveryDate: {
      type: DataTypes.DATE,
    },
    trackingNumber: {
      type: DataTypes.STRING(100),
    },
    remark: {
      type: DataTypes.TEXT,
    },
    createdBy: {
      type: DataTypes.INTEGER.UNSIGNED,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    assignedTo: {
      type: DataTypes.INTEGER.UNSIGNED,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    completedAt: {
      type: DataTypes.DATE,
    },
    scheduledQuantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    actualMaterialUsed: {
      type: DataTypes.DECIMAL(10, 2),
    },
    laborHours: {
      type: DataTypes.DECIMAL(10, 2),
    },
    machineHours: {
      type: DataTypes.DECIMAL(10, 2),
    },
    materialCost: {
      type: DataTypes.DECIMAL(12, 2),
    },
    laborCost: {
      type: DataTypes.DECIMAL(12, 2),
    },
    machineCost: {
      type: DataTypes.DECIMAL(12, 2),
    },
    additionalCosts: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
    },
    totalProductionCost: {
      type: DataTypes.DECIMAL(12, 2),
    },
    materialWastage: {
      type: DataTypes.DECIMAL(10, 2),
    },
    wastageRate: {
      type: DataTypes.DECIMAL(5, 2),
    },
  },
  {
    sequelize,
    modelName: 'Order',
    tableName: 'orders',
  }
);

Order.belongsTo(Category, { as: 'category', foreignKey: 'categoryId' });
Order.belongsTo(Material, { as: 'material', foreignKey: 'materialId' });
Order.belongsTo(User, { as: 'creator', foreignKey: 'createdBy' });
Order.belongsTo(User, { as: 'assignee', foreignKey: 'assignedTo' });

export default Order;
