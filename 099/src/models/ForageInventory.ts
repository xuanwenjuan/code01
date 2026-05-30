import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../database';

export interface ForageInventoryAttributes {
  id?: number;
  categoryId: number;
  quantity: number;
  reservedQuantity?: number;
  unitPrice?: number;
  totalValue?: number;
  warehouseLocation?: string;
  lastInboundDate?: Date;
  lastOutboundDate?: Date;
  warningThreshold?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

class ForageInventory extends Model<ForageInventoryAttributes> implements ForageInventoryAttributes {
  public id!: number;
  public categoryId!: number;
  public quantity!: number;
  public reservedQuantity?: number;
  public unitPrice?: number;
  public totalValue?: number;
  public warehouseLocation?: string;
  public lastInboundDate?: Date;
  public lastOutboundDate?: Date;
  public warningThreshold?: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ForageInventory.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      comment: '饲草料类目ID'
    },
    quantity: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      comment: '库存数量'
    },
    reservedQuantity: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      comment: '预留数量'
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      comment: '单价'
    },
    totalValue: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
      comment: '总价值'
    },
    warehouseLocation: {
      type: DataTypes.STRING(100),
      comment: '库位'
    },
    lastInboundDate: {
      type: DataTypes.DATE,
      comment: '最后入库时间'
    },
    lastOutboundDate: {
      type: DataTypes.DATE,
      comment: '最后出库时间'
    },
    warningThreshold: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 10,
      comment: '预警阈值'
    }
  },
  {
    sequelize,
    modelName: 'ForageInventory',
    tableName: 'forage_inventories',
    indexes: [
      { fields: ['categoryId'], unique: true }
    ]
  }
);

export default ForageInventory;
