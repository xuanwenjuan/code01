import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { SettlementStatus } from '../types';

interface SettlementAttributes {
  id: number;
  settlementNo: string;
  riderId: number;
  orderCount: number;
  totalAmount: number;
  riderCommission: number;
  platformFee: number;
  status: SettlementStatus;
  settledAt?: Date;
  remark?: string;
  startDate: Date;
  endDate: Date;
}

interface SettlementCreationAttributes extends Optional<SettlementAttributes, 'id' | 'settledAt' | 'remark'> {}

class Settlement extends Model<SettlementAttributes, SettlementCreationAttributes> implements SettlementAttributes {
  public id!: number;
  public settlementNo!: string;
  public riderId!: number;
  public orderCount!: number;
  public totalAmount!: number;
  public riderCommission!: number;
  public platformFee!: number;
  public status!: SettlementStatus;
  public settledAt?: Date;
  public remark?: string;
  public startDate!: Date;
  public endDate!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Settlement.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    settlementNo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    riderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'rider',
        key: 'id'
      }
    },
    orderCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    riderCommission: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    platformFee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    status: {
      type: DataTypes.ENUM(...Object.values(SettlementStatus)),
      allowNull: false,
      defaultValue: SettlementStatus.PENDING
    },
    settledAt: {
      type: DataTypes.DATE
    },
    remark: {
      type: DataTypes.TEXT
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false
    }
  },
  {
    sequelize,
    tableName: 'settlement',
    modelName: 'Settlement'
  }
);

export default Settlement;
