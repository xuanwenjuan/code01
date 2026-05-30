import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { StockStatus } from '../types';

export interface IngredientAttributes {
  id: number;
  name: string;
  category?: string;
  unit: string;
  currentStock: number;
  safetyStock: number;
  warningThreshold?: number;
  unitPrice: number;
  supplierId?: number;
  status: StockStatus;
  storeId?: number;
  batchNo?: string;
  productionDate?: Date;
  expiryDate?: Date;
  alertDaysBeforeExpiry?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface IngredientCreationAttributes extends Optional<IngredientAttributes, 'id'> {}

class Ingredient extends Model<IngredientAttributes, IngredientCreationAttributes> implements IngredientAttributes {
  public id!: number;
  public name!: string;
  public category?: string;
  public unit!: string;
  public currentStock!: number;
  public safetyStock!: number;
  public warningThreshold?: number;
  public unitPrice!: number;
  public supplierId?: number;
  public status!: StockStatus;
  public storeId?: number;
  public batchNo?: string;
  public productionDate?: Date;
  public expiryDate?: Date;
  public alertDaysBeforeExpiry?: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Ingredient.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '原料名称'
    },
    category: {
      type: DataTypes.STRING(50),
      comment: '原料分类'
    },
    unit: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: '计量单位'
    },
    currentStock: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      comment: '当前库存'
    },
    safetyStock: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      comment: '安全库存'
    },
    warningThreshold: {
      type: DataTypes.DECIMAL(10, 2),
      comment: '库存预警阈值'
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '单价'
    },
    supplierId: {
      type: DataTypes.INTEGER,
      comment: '供应商ID'
    },
    status: {
      type: DataTypes.ENUM(...Object.values(StockStatus)),
      allowNull: false,
      defaultValue: StockStatus.IN_STOCK,
      comment: '库存状态'
    },
    storeId: {
      type: DataTypes.INTEGER,
      comment: '门店ID'
    },
    batchNo: {
      type: DataTypes.STRING(50),
      comment: '批次号'
    },
    productionDate: {
      type: DataTypes.DATE,
      comment: '生产日期'
    },
    expiryDate: {
      type: DataTypes.DATE,
      comment: '保质期截止日期'
    },
    alertDaysBeforeExpiry: {
      type: DataTypes.INTEGER,
      defaultValue: 7,
      comment: '到期前预警天数'
    }
  },
  {
    sequelize,
    tableName: 'ingredients',
    modelName: 'Ingredient',
    timestamps: true
  }
);

export default Ingredient;
