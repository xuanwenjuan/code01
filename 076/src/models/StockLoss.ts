import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface StockLossAttributes {
  id: number;
  ingredientId: number;
  ingredientName: string;
  quantity: number;
  unit: string;
  lossType: string;
  reason?: string;
  operatorId?: number;
  operatorName?: string;
  storeId?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface StockLossCreationAttributes extends Optional<StockLossAttributes, 'id'> {}

class StockLoss extends Model<StockLossAttributes, StockLossCreationAttributes> implements StockLossAttributes {
  public id!: number;
  public ingredientId!: number;
  public ingredientName!: string;
  public quantity!: number;
  public unit!: string;
  public lossType!: string;
  public reason?: string;
  public operatorId?: number;
  public operatorName?: string;
  public storeId?: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

StockLoss.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    ingredientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '原料ID'
    },
    ingredientName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '原料名称'
    },
    quantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '损耗数量'
    },
    unit: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: '单位'
    },
    lossType: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '损耗类型'
    },
    reason: {
      type: DataTypes.TEXT,
      comment: '损耗原因'
    },
    operatorId: {
      type: DataTypes.INTEGER,
      comment: '操作人ID'
    },
    operatorName: {
      type: DataTypes.STRING(50),
      comment: '操作人姓名'
    },
    storeId: {
      type: DataTypes.INTEGER,
      comment: '门店ID'
    }
  },
  {
    sequelize,
    tableName: 'stock_losses',
    modelName: 'StockLoss',
    timestamps: true
  }
);

export default StockLoss;
