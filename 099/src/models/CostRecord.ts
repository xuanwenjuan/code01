import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../database';

export interface CostRecordAttributes {
  id?: number;
  recordDate: Date;
  categoryId?: number;
  stableId?: number;
  consumptionQuantity?: number;
  avgUnitPrice?: number;
  totalCost?: number;
  lossQuantity?: number;
  lossCost?: number;
  type: 'daily' | 'monthly' | 'yearly';
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

class CostRecord extends Model<CostRecordAttributes> implements CostRecordAttributes {
  public id!: number;
  public recordDate!: Date;
  public categoryId?: number;
  public stableId?: number;
  public consumptionQuantity?: number;
  public avgUnitPrice?: number;
  public totalCost?: number;
  public lossQuantity?: number;
  public lossCost?: number;
  public type!: 'daily' | 'monthly' | 'yearly';
  public notes?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

CostRecord.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    recordDate: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: '记录日期'
    },
    categoryId: {
      type: DataTypes.INTEGER,
      comment: '饲草料类目ID'
    },
    stableId: {
      type: DataTypes.INTEGER,
      comment: '马舍ID'
    },
    consumptionQuantity: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      comment: '消耗量'
    },
    avgUnitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      comment: '平均单价'
    },
    totalCost: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
      comment: '总成本'
    },
    lossQuantity: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      comment: '损耗量'
    },
    lossCost: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
      comment: '损耗成本'
    },
    type: {
      type: DataTypes.ENUM('daily', 'monthly', 'yearly'),
      allowNull: false,
      comment: '类型'
    },
    notes: {
      type: DataTypes.TEXT,
      comment: '备注'
    }
  },
  {
    sequelize,
    modelName: 'CostRecord',
    tableName: 'cost_records',
    indexes: [
      { fields: ['recordDate'] },
      { fields: ['categoryId'] },
      { fields: ['stableId'] },
      { fields: ['type'] }
    ]
  }
);

export default CostRecord;
