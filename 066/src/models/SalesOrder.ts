import { DataTypes, Model } from 'sequelize';
import sequelize from '../database';
import { SalesOrderStatus } from '../types';
import User from './User';

class SalesOrder extends Model {
  public id!: number;
  public orderNo!: string;
  public customerName!: string;
  public customerPhone?: string;
  public customerAddress?: string;
  public totalAmount!: number;
  public paidAmount!: number;
  public debtAmount!: number;
  public status!: SalesOrderStatus;
  public shipDate?: Date;
  public deliveryDate?: Date;
  public operatorId!: number;
  public remark?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

SalesOrder.init(
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
      comment: '销售单号'
    },
    customerName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '客户名称'
    },
    customerPhone: {
      type: DataTypes.STRING(20),
      comment: '客户电话'
    },
    customerAddress: {
      type: DataTypes.STRING(500),
      comment: '客户地址'
    },
    totalAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      comment: '总金额'
    },
    paidAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      comment: '已付金额'
    },
    debtAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      comment: '欠款金额'
    },
    status: {
      type: DataTypes.ENUM(...Object.values(SalesOrderStatus)),
      allowNull: false,
      defaultValue: SalesOrderStatus.DRAFT,
      comment: '单据状态'
    },
    shipDate: {
      type: DataTypes.DATE,
      comment: '发货日期'
    },
    deliveryDate: {
      type: DataTypes.DATE,
      comment: '送达日期'
    },
    operatorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '操作员ID'
    },
    remark: {
      type: DataTypes.TEXT,
      comment: '备注'
    }
  },
  {
    sequelize,
    modelName: 'SalesOrder',
    tableName: 'sales_orders'
  }
);

SalesOrder.belongsTo(User, { as: 'operator', foreignKey: 'operatorId' });

export default SalesOrder;
