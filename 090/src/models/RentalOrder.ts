import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { OrderStatus } from '../types';

interface RentalOrderAttributes {
  id: number;
  orderNo: string;
  customerName: string;
  customerPhone: string;
  customerIdCard: string;
  equipmentId: number;
  storeId: number;
  startDate: Date;
  endDate: Date;
  actualReturnDate?: Date;
  rentDays: number;
  dailyRent: number;
  totalRent: number;
  deposit: number;
  damageCompensation?: number;
  totalAmount: number;
  status: OrderStatus;
  createdBy: number;
  outboundBy?: number;
  returnBy?: number;
  remark?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface RentalOrderCreationAttributes extends Optional<RentalOrderAttributes, 'id' | 'createdAt' | 'updatedAt' | 'actualReturnDate' | 'damageCompensation' | 'outboundBy' | 'returnBy' | 'remark'> {}

class RentalOrder extends Model<RentalOrderAttributes, RentalOrderCreationAttributes> implements RentalOrderAttributes {
  public id!: number;
  public orderNo!: string;
  public customerName!: string;
  public customerPhone!: string;
  public customerIdCard!: string;
  public equipmentId!: number;
  public storeId!: number;
  public startDate!: Date;
  public endDate!: Date;
  public actualReturnDate?: Date;
  public rentDays!: number;
  public dailyRent!: number;
  public totalRent!: number;
  public deposit!: number;
  public damageCompensation?: number;
  public totalAmount!: number;
  public status!: OrderStatus;
  public createdBy!: number;
  public outboundBy?: number;
  public returnBy?: number;
  public remark?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

RentalOrder.init(
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
      comment: '订单编号'
    },
    customerName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '客户姓名'
    },
    customerPhone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: '客户电话'
    },
    customerIdCard: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: '客户身份证号'
    },
    equipmentId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '装备ID'
    },
    storeId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '门店ID'
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: '租借开始日期'
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: '预计归还日期'
    },
    actualReturnDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '实际归还日期'
    },
    rentDays: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '租借天数'
    },
    dailyRent: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '日租金'
    },
    totalRent: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '总租金'
    },
    deposit: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '押金'
    },
    damageCompensation: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: '损坏赔偿'
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '总金额'
    },
    status: {
      type: DataTypes.ENUM(...Object.values(OrderStatus)),
      allowNull: false,
      defaultValue: OrderStatus.PENDING,
      comment: '订单状态'
    },
    createdBy: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '创建人ID'
    },
    outboundBy: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: '出库人ID'
    },
    returnBy: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: '归还处理人ID'
    },
    remark: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '备注'
    }
  },
  {
    sequelize,
    tableName: 'rental_orders',
    modelName: 'RentalOrder',
    timestamps: true
  }
);

export default RentalOrder;
