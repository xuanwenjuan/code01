import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../index';

interface FinancialReportAttributes {
  id: number;
  reportDate: string;
  reportType: 'daily' | 'monthly' | 'yearly';
  totalRentIncome: number;
  totalDepositIncome: number;
  totalDepositRefund: number;
  totalOverdueIncome: number;
  totalDamageIncome: number;
  totalMaintenanceCost: number;
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  orderCount: number;
  equipmentCount: number;
  customerCount: number;
  remark?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface FinancialReportCreationAttributes extends Optional<FinancialReportAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class FinancialReport extends Model<FinancialReportAttributes, FinancialReportCreationAttributes> implements FinancialReportAttributes {
  public id!: number;
  public reportDate!: string;
  public reportType!: 'daily' | 'monthly' | 'yearly';
  public totalRentIncome!: number;
  public totalDepositIncome!: number;
  public totalDepositRefund!: number;
  public totalOverdueIncome!: number;
  public totalDamageIncome!: number;
  public totalMaintenanceCost!: number;
  public totalIncome!: number;
  public totalExpense!: number;
  public netProfit!: number;
  public orderCount!: number;
  public equipmentCount!: number;
  public customerCount!: number;
  public remark?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

FinancialReport.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    reportDate: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: '报表日期'
    },
    reportType: {
      type: DataTypes.ENUM('daily', 'monthly', 'yearly'),
      allowNull: false,
      comment: '报表类型'
    },
    totalRentIncome: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
      comment: '租金收入总额'
    },
    totalDepositIncome: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
      comment: '押金收入总额'
    },
    totalDepositRefund: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
      comment: '押金退还总额'
    },
    totalOverdueIncome: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
      comment: '逾期罚金总额'
    },
    totalDamageIncome: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
      comment: '破损赔偿总额'
    },
    totalMaintenanceCost: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
      comment: '维保成本总额'
    },
    totalIncome: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
      comment: '总收入'
    },
    totalExpense: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
      comment: '总支出'
    },
    netProfit: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
      comment: '净利润'
    },
    orderCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '订单数'
    },
    equipmentCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '设备数'
    },
    customerCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '客户数'
    },
    remark: {
      type: DataTypes.TEXT,
      comment: '备注'
    }
  },
  {
    sequelize,
    modelName: 'FinancialReport',
    tableName: 'financial_reports',
    timestamps: true,
    indexes: [
      { fields: ['reportDate', 'reportType'], unique: true },
      { fields: ['reportType'] }
    ]
  }
);

export default FinancialReport;
