import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Ledger from './Ledger';

interface LedgerItemAttributes {
  id: number;
  ledgerId: number;
  orderItemId: number;
  productId: number;
  productName: string;
  productCode?: string;
  categoryId?: number;
  categoryName?: string;
  quantity: number;
  unitPrice: number;
  unitMaterialCost: number;
  unitCustomFee: number;
  unitProcessingCost: number;
  unitTotalCost: number;
  unitProfit: number;
  totalMaterialCost: number;
  totalCustomFee: number;
  totalProcessingCost: number;
  totalCost: number;
  totalRevenue: number;
  totalProfit: number;
  sizeDetails?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface LedgerItemCreationAttributes extends Optional<LedgerItemAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class LedgerItem extends Model<LedgerItemAttributes, LedgerItemCreationAttributes> implements LedgerItemAttributes {
  public id!: number;
  public ledgerId!: number;
  public orderItemId!: number;
  public productId!: number;
  public productName!: string;
  public productCode?: string;
  public categoryId?: number;
  public categoryName?: string;
  public quantity!: number;
  public unitPrice!: number;
  public unitMaterialCost!: number;
  public unitCustomFee!: number;
  public unitProcessingCost!: number;
  public unitTotalCost!: number;
  public unitProfit!: number;
  public totalMaterialCost!: number;
  public totalCustomFee!: number;
  public totalProcessingCost!: number;
  public totalCost!: number;
  public totalRevenue!: number;
  public totalProfit!: number;
  public sizeDetails?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

LedgerItem.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    ledgerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'ledgers',
        key: 'id',
      },
    },
    orderItemId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'order_items',
        key: 'id',
      },
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id',
      },
    },
    productName: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    productCode: {
      type: DataTypes.STRING(100),
    },
    categoryId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'categories',
        key: 'id',
      },
    },
    categoryName: {
      type: DataTypes.STRING(100),
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    unitPrice: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    unitMaterialCost: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    unitCustomFee: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    unitProcessingCost: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    unitTotalCost: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    unitProfit: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    totalMaterialCost: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    totalCustomFee: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    totalProcessingCost: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    totalCost: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    totalRevenue: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    totalProfit: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    sizeDetails: {
      type: DataTypes.TEXT,
    },
  },
  {
    sequelize,
    modelName: 'LedgerItem',
    tableName: 'ledger_items',
    indexes: [
      { fields: ['ledgerId'] },
      { fields: ['orderItemId'] },
      { fields: ['productId'] },
      { fields: ['categoryId'] },
    ],
  }
);

Ledger.hasMany(LedgerItem, { as: 'items', foreignKey: 'ledgerId' });
LedgerItem.belongsTo(Ledger, { as: 'ledger', foreignKey: 'ledgerId' });

export default LedgerItem;
