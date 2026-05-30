import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Branch from './Branch';
import Vehicle from './Vehicle';

export enum OrderStatus {
  PENDING = 'pending',
  PICKED_UP = 'picked_up',
  IN_TRANSIT = 'in_transit',
  TRANSFERRING = 'transferring',
  DELIVERING = 'delivering',
  DELIVERED = 'delivered',
  SIGNED = 'signed',
  ABNORMAL = 'abnormal',
  CANCELLED = 'cancelled'
}

export interface OrderAttributes {
  id: number;
  orderNo: string;
  shipperName: string;
  shipperPhone: string;
  shipperAddress: string;
  shipperBranchId?: number;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  receiverBranchId?: number;
  goodsName: string;
  goodsWeight: number;
  goodsVolume?: number;
  goodsQuantity: number;
  freightAmount: number;
  insuranceAmount?: number;
  totalAmount: number;
  paymentMethod: string;
  vehicleId?: number;
  currentBranchId?: number;
  status: OrderStatus;
  remark?: string;
  operatorId?: number;
}

export interface OrderCreationAttributes extends Optional<OrderAttributes, 'id' | 'status'> {}

class Order extends Model<OrderAttributes, OrderCreationAttributes> implements OrderAttributes {
  public id!: number;
  public orderNo!: string;
  public shipperName!: string;
  public shipperPhone!: string;
  public shipperAddress!: string;
  public shipperBranchId?: number;
  public receiverName!: string;
  public receiverPhone!: string;
  public receiverAddress!: string;
  public receiverBranchId?: number;
  public goodsName!: string;
  public goodsWeight!: number;
  public goodsVolume?: number;
  public goodsQuantity!: number;
  public freightAmount!: number;
  public insuranceAmount?: number;
  public totalAmount!: number;
  public paymentMethod!: string;
  public vehicleId?: number;
  public currentBranchId?: number;
  public status!: OrderStatus;
  public remark?: string;
  public operatorId?: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public readonly shipperBranch?: Branch;
  public readonly receiverBranch?: Branch;
  public readonly currentBranch?: Branch;
  public readonly vehicle?: Vehicle;
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
    shipperName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '发货人姓名'
    },
    shipperPhone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: '发货人电话'
    },
    shipperAddress: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: '发货人地址'
    },
    shipperBranchId: {
      type: DataTypes.INTEGER.UNSIGNED,
      comment: '发货网点ID'
    },
    receiverName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '收货人姓名'
    },
    receiverPhone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: '收货人电话'
    },
    receiverAddress: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: '收货人地址'
    },
    receiverBranchId: {
      type: DataTypes.INTEGER.UNSIGNED,
      comment: '收货网点ID'
    },
    goodsName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '货物名称'
    },
    goodsWeight: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '货物重量(kg)'
    },
    goodsVolume: {
      type: DataTypes.DECIMAL(10, 2),
      comment: '货物体积(立方米)'
    },
    goodsQuantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '货物数量'
    },
    freightAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '运费金额'
    },
    insuranceAmount: {
      type: DataTypes.DECIMAL(10, 2),
      comment: '保险金额'
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '总金额'
    },
    paymentMethod: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: '付款方式'
    },
    vehicleId: {
      type: DataTypes.INTEGER.UNSIGNED,
      comment: '运输车辆ID'
    },
    currentBranchId: {
      type: DataTypes.INTEGER.UNSIGNED,
      comment: '当前所在网点ID'
    },
    status: {
      type: DataTypes.ENUM(...Object.values(OrderStatus)),
      defaultValue: OrderStatus.PENDING,
      comment: '订单状态'
    },
    remark: {
      type: DataTypes.TEXT,
      comment: '备注'
    },
    operatorId: {
      type: DataTypes.INTEGER.UNSIGNED,
      comment: '操作人ID'
    }
  },
  {
    sequelize,
    tableName: 'orders',
    modelName: 'Order'
  }
);

Order.belongsTo(Branch, { foreignKey: 'shipperBranchId', as: 'shipperBranch' });
Order.belongsTo(Branch, { foreignKey: 'receiverBranchId', as: 'receiverBranch' });
Order.belongsTo(Branch, { foreignKey: 'currentBranchId', as: 'currentBranch' });
Order.belongsTo(Vehicle, { foreignKey: 'vehicleId', as: 'vehicle' });
Branch.hasMany(Order, { foreignKey: 'shipperBranchId', as: 'shipperOrders' });
Branch.hasMany(Order, { foreignKey: 'receiverBranchId', as: 'receiverOrders' });
Vehicle.hasMany(Order, { foreignKey: 'vehicleId' });

export default Order;
