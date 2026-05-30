import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Category from './Category';

interface CostReportAttributes {
  id: number;
  reportDate: Date;
  categoryId?: number;
  totalOrders: number;
  totalQuantity: number;
  materialCost: number;
  processingCost: number;
  laborCost: number;
  otherCost: number;
  totalCost: number;
  totalRevenue: number;
  netProfit: number;
  profitMargin: number;
  remark?: string;
}

interface CostReportCreationAttributes extends Optional<CostReportAttributes, 'id'> {}

class CostReport extends Model<CostReportAttributes, CostReportCreationAttributes> implements CostReportAttributes {
  public id!: number;
  public reportDate!: Date;
  public categoryId?: number;
  public totalOrders!: number;
  public totalQuantity!: number;
  public materialCost!: number;
  public processingCost!: number;
  public laborCost!: number;
  public otherCost!: number;
  public totalCost!: number;
  public totalRevenue!: number;
  public netProfit!: number;
  public profitMargin!: number;
  public remark?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public readonly category?: Category;
}

CostReport.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    reportDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    categoryId: {
      type: DataTypes.INTEGER.UNSIGNED,
      references: {
        model: 'categories',
        key: 'id',
      },
    },
    totalOrders: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    totalQuantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    materialCost: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    processingCost: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    laborCost: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    otherCost: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    totalCost: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    totalRevenue: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    netProfit: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    profitMargin: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
    },
    remark: {
      type: DataTypes.TEXT,
    },
  },
  {
    sequelize,
    modelName: 'CostReport',
    tableName: 'cost_reports',
  }
);

CostReport.belongsTo(Category, { as: 'category', foreignKey: 'categoryId' });

export default CostReport;
