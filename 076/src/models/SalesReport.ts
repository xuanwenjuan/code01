import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface SalesReportAttributes {
  id: number;
  storeId: number;
  reportDate: Date;
  orderCount: number;
  totalSales: number;
  materialCost: number;
  laborCost?: number;
  otherCost?: number;
  netProfit: number;
  topProducts?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface SalesReportCreationAttributes extends Optional<SalesReportAttributes, 'id'> {}

class SalesReport extends Model<SalesReportAttributes, SalesReportCreationAttributes> implements SalesReportAttributes {
  public id!: number;
  public storeId!: number;
  public reportDate!: Date;
  public orderCount!: number;
  public totalSales!: number;
  public materialCost!: number;
  public laborCost?: number;
  public otherCost?: number;
  public netProfit!: number;
  public topProducts?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

SalesReport.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    storeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '门店ID'
    },
    reportDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: '报表日期'
    },
    orderCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '订单数量'
    },
    totalSales: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      comment: '总销售额'
    },
    materialCost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      comment: '原料成本'
    },
    laborCost: {
      type: DataTypes.DECIMAL(10, 2),
      comment: '人工成本'
    },
    otherCost: {
      type: DataTypes.DECIMAL(10, 2),
      comment: '其他成本'
    },
    netProfit: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      comment: '净利润'
    },
    topProducts: {
      type: DataTypes.JSON,
      comment: '热销产品'
    }
  },
  {
    sequelize,
    tableName: 'sales_reports',
    modelName: 'SalesReport',
    timestamps: true
  }
);

export default SalesReport;
