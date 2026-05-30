import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { SeasonType } from '../constants';

interface RevenueReportAttributes {
  id: number;
  reportDate: Date;
  building?: string;
  categoryId?: number;
  seasonType?: SeasonType;
  totalOrders: number;
  checkInCount: number;
  checkOutCount: number;
  occupancyRate: number;
  totalRevenue: number;
  maintenanceCost: number;
  netProfit: number;
  avgDailyRate: number;
}

interface RevenueReportCreationAttributes extends Optional<RevenueReportAttributes, 'id' | 'building' | 'categoryId' | 'seasonType'> {}

class RevenueReport extends Model<RevenueReportAttributes, RevenueReportCreationAttributes> implements RevenueReportAttributes {
  public id!: number;
  public reportDate!: Date;
  public building?: string;
  public categoryId?: number;
  public seasonType?: SeasonType;
  public totalOrders!: number;
  public checkInCount!: number;
  public checkOutCount!: number;
  public occupancyRate!: number;
  public totalRevenue!: number;
  public maintenanceCost!: number;
  public netProfit!: number;
  public avgDailyRate!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

RevenueReport.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      comment: '报表ID'
    },
    reportDate: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: '报表日期'
    },
    building: {
      type: DataTypes.STRING(50),
      comment: '楼栋'
    },
    categoryId: {
      type: DataTypes.INTEGER.UNSIGNED,
      comment: '房型分类ID'
    },
    seasonType: {
      type: DataTypes.ENUM(...Object.values(SeasonType)),
      comment: '季节类型'
    },
    totalOrders: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: '总订单数'
    },
    checkInCount: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: '入住数'
    },
    checkOutCount: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: '离店数'
    },
    occupancyRate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
      comment: '入住率(%)'
    },
    totalRevenue: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      comment: '总营收'
    },
    maintenanceCost: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      comment: '运维成本'
    },
    netProfit: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      comment: '净利润'
    },
    avgDailyRate: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      comment: '平均房价'
    }
  },
  {
    sequelize,
    tableName: 'revenue_reports',
    modelName: 'RevenueReport',
    comment: '营收报表表'
  }
);

export default RevenueReport;
