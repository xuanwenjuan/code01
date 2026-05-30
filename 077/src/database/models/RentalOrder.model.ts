import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../index';
import { OrderStatus, PaymentStatus } from '../../types';

interface RentalOrderAttributes {
  id: number;
  orderNo: string;
  customerId: number;
  equipmentId: number;
  rentalType: 'daily' | 'monthly';
  rentalDays?: number;
  rentalMonths?: number;
  startDate: Date;
  endDate: Date;
  actualEndDate?: Date;
  unitPrice: number;
  totalAmount: number;
  deposit: number;
  depositStatus: PaymentStatus;
  rentStatus: PaymentStatus;
  overdueDays: number;
  overdueAmount: number;
  damageAmount: number;
  status: OrderStatus;
  operatorId?: number;
  remark?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface RentalOrderCreationAttributes extends Optional<RentalOrderAttributes, 'id' | 'createdAt' | 'updatedAt' | 'overdueDays' | 'overdueAmount' | 'damageAmount'> {}

class RentalOrder extends Model<RentalOrderAttributes, RentalOrderCreationAttributes> implements RentalOrderAttributes {
  public id!: number;
  public orderNo!: string;
  public customerId!: number;
  public equipmentId!: number;
  public rentalType!: 'daily' | 'monthly';
  public rentalDays?: number;
  public rentalMonths?: number;
  public startDate!: Date;
  public endDate!: Date;
  public actualEndDate?: Date;
  public unitPrice!: number;
  public totalAmount!: number;
  public deposit!: number;
  public depositStatus!: PaymentStatus;
  public rentStatus!: PaymentStatus;
  public overdueDays!: number;
  public overdueAmount!: number;
  public damageAmount!: number;
  public status!: OrderStatus;
  public operatorId?: number;
  public remark?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

RentalOrder.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    orderNo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '订单编号'
    },
    customerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '客户ID'
    },
    equipmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '设备ID'
    },
    rentalType: {
      type: DataTypes.ENUM('daily', 'monthly'),
      allowNull: false,
      comment: '租赁类型 daily-日租 monthly-月租'
    },
    rentalDays: {
      type: DataTypes.INTEGER,
      comment: '租赁天数'
    },
    rentalMonths: {
      type: DataTypes.INTEGER,
      comment: '租赁月数'
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: '租赁开始日期'
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: '租赁结束日期'
    },
    actualEndDate: {
      type: DataTypes.DATE,
      comment: '实际归还日期'
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '单价'
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '租金总额'
    },
    deposit: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '押金'
    },
    depositStatus: {
      type: DataTypes.ENUM(...Object.values(PaymentStatus)),
      allowNull: false,
      defaultValue: PaymentStatus.UNPAID,
      comment: '押金支付状态'
    },
    rentStatus: {
      type: DataTypes.ENUM(...Object.values(PaymentStatus)),
      allowNull: false,
      defaultValue: PaymentStatus.UNPAID,
      comment: '租金支付状态'
    },
    overdueDays: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '逾期天数'
    },
    overdueAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      comment: '逾期罚金'
    },
    damageAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      comment: '破损赔偿'
    },
    status: {
      type: DataTypes.ENUM(...Object.values(OrderStatus)),
      allowNull: false,
      defaultValue: OrderStatus.PENDING_PAYMENT,
      comment: '订单状态'
    },
    operatorId: {
      type: DataTypes.INTEGER,
      comment: '操作员ID'
    },
    remark: {
      type: DataTypes.TEXT,
      comment: '备注'
    }
  },
  {
    sequelize,
    modelName: 'RentalOrder',
    tableName: 'rental_orders',
    timestamps: true,
    indexes: [
      { fields: ['orderNo'], unique: true },
      { fields: ['customerId'] },
      { fields: ['equipmentId'] },
      { fields: ['status'] },
      { fields: ['startDate'] },
      { fields: ['endDate'] }
    ]
  }
);

export default RentalOrder;
