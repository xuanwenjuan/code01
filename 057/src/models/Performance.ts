import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import Employee from './Employee';

export enum PerformanceLevel {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  QUALIFIED = 'qualified',
  NEEDS_IMPROVEMENT = 'needs_improvement',
  UNQUALIFIED = 'unqualified',
}

export interface PerformanceAttributes {
  id?: number;
  employeeId: number;
  year: number;
  month: number;
  level: PerformanceLevel;
  score?: number;
  bonusAmount?: number;
  evaluatorId?: number;
  comment?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

class Performance extends Model<PerformanceAttributes> implements PerformanceAttributes {
  public id!: number;
  public employeeId!: number;
  public year!: number;
  public month!: number;
  public level!: PerformanceLevel;
  public score?: number;
  public bonusAmount?: number;
  public evaluatorId?: number;
  public comment?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public readonly employee?: Employee;
}

Performance.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    employeeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'employee_id',
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    month: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    level: {
      type: DataTypes.ENUM(...Object.values(PerformanceLevel)),
      allowNull: false,
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    bonusAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: 'bonus_amount',
      defaultValue: 0,
    },
    evaluatorId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'evaluator_id',
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'performances',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['employee_id', 'year', 'month'],
      },
    ],
  }
);

Performance.belongsTo(Employee, {
  as: 'employee',
  foreignKey: 'employeeId',
});

Employee.hasMany(Performance, {
  as: 'performances',
  foreignKey: 'employeeId',
});

export default Performance;
