import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import InventoryCheck from './InventoryCheck';
import Material from './Material';

export enum CheckResultType {
  NORMAL = 1,
  PROFIT = 2,
  LOSS = 3
}

class InventoryCheckItem extends Model {
  public id!: number;
  public inventoryCheckId!: number;
  public materialId!: number;
  public systemQuantity!: number;
  public actualQuantity!: number;
  public differenceQuantity!: number;
  public resultType!: CheckResultType;
  public unitPrice!: number;
  public differenceAmount!: number;
  public remark?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

InventoryCheckItem.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    inventoryCheckId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '盘点单ID'
    },
    materialId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '物资ID'
    },
    systemQuantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '系统库存数量'
    },
    actualQuantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '实际盘点数量'
    },
    differenceQuantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '差异数量'
    },
    resultType: {
      type: DataTypes.TINYINT,
      allowNull: false,
      comment: '结果类型：1-正常，2-盘盈，3-盘亏'
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '单价'
    },
    differenceAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      comment: '差异金额'
    },
    remark: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '备注'
    }
  },
  {
    sequelize,
    modelName: 'InventoryCheckItem',
    tableName: 'inventory_check_items',
    comment: '盘点单明细表'
  }
);

InventoryCheckItem.belongsTo(InventoryCheck, { foreignKey: 'inventoryCheckId', as: 'inventoryCheck' });
InventoryCheckItem.belongsTo(Material, { foreignKey: 'materialId', as: 'material' });
InventoryCheck.hasMany(InventoryCheckItem, { foreignKey: 'inventoryCheckId', as: 'items' });

export default InventoryCheckItem;