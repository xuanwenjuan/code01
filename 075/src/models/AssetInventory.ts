
import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import { InventoryResult } from '../types';
import Asset from './Asset';
import User from './User';

class AssetInventory extends Model {
  public id!: number;
  public inventoryNo!: string;
  public inventoryDate!: Date;
  public assetId!: number;
  public bookStatus!: string;
  public actualStatus!: string;
  public result!: InventoryResult;
  public remark!: string;
  public operatorId!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

AssetInventory.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    inventoryNo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '盘点单号'
    },
    inventoryDate: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: '盘点日期'
    },
    assetId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '资产ID'
    },
    bookStatus: {
      type: DataTypes.STRING(50),
      comment: '账面状态'
    },
    actualStatus: {
      type: DataTypes.STRING(50),
      comment: '实际状态'
    },
    result: {
      type: DataTypes.ENUM(...Object.values(InventoryResult)),
      allowNull: false,
      defaultValue: InventoryResult.NORMAL,
      comment: '盘点结果'
    },
    remark: {
      type: DataTypes.TEXT,
      comment: '备注'
    },
    operatorId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '操作人ID'
    }
  },
  {
    sequelize,
    tableName: 'asset_inventories',
    modelName: 'AssetInventory',
    timestamps: true
  }
);

AssetInventory.belongsTo(Asset, { as: 'asset', foreignKey: 'assetId' });
AssetInventory.belongsTo(User, { as: 'operator', foreignKey: 'operatorId' });

export default AssetInventory;
