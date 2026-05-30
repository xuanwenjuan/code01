import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import Category from './Category';

class RevenueReport extends Model {
  public id!: number;
  public reportDate!: Date;
  public categoryId!: number | null;
  public totalOrders!: number;
  public totalQuantity!: number;
  public totalAmount!: number;
  public materialCost!: number;
  public processingFee!: number;
  public grossProfit!: number;
  public grossProfitRate!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

RevenueReport.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    reportDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Category,
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
    totalAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    materialCost: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    processingFee: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    grossProfit: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    grossProfitRate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: 'RevenueReport',
    tableName: 'revenue_reports',
  }
);

RevenueReport.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });
Category.hasMany(RevenueReport, { foreignKey: 'categoryId', as: 'revenueReports' });

export default RevenueReport;