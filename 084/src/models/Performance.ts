import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import Cleaner from './Cleaner';
import WorkArea from './WorkArea';

interface PerformanceAttributes {
  id: number;
  cleanerId: number;
  workAreaId: number;
  year: number;
  month: number;
  totalOrders: number;
  completedOrders: number;
  reviewedOrders: number;
  cancelledOrders: number;
  timeoutOrders: number;
  completionRate: number;
  attendanceDays: number;
  violationPoints: number;
  performanceBonus: number;
  finalScore: number;
  calculatedAt?: Date;
  remarks?: string;
}

class Performance extends Model<PerformanceAttributes> implements PerformanceAttributes {
  public id!: number;
  public cleanerId!: number;
  public workAreaId!: number;
  public year!: number;
  public month!: number;
  public totalOrders!: number;
  public completedOrders!: number;
  public reviewedOrders!: number;
  public cancelledOrders!: number;
  public timeoutOrders!: number;
  public completionRate!: number;
  public attendanceDays!: number;
  public violationPoints!: number;
  public performanceBonus!: number;
  public finalScore!: number;
  public calculatedAt?: Date;
  public remarks?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Performance.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    cleanerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Cleaner,
        key: 'id'
      }
    },
    workAreaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: WorkArea,
        key: 'id'
      }
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    month: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    totalOrders: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    completedOrders: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    reviewedOrders: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    cancelledOrders: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    timeoutOrders: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    completionRate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0
    },
    attendanceDays: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    violationPoints: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    performanceBonus: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    finalScore: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    calculatedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'Performance',
    tableName: 'performances',
    timestamps: true
  }
);

Performance.belongsTo(Cleaner, { foreignKey: 'cleanerId', as: 'cleaner' });
Performance.belongsTo(WorkArea, { foreignKey: 'workAreaId', as: 'workArea' });

export default Performance;