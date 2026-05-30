import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import { ConsumableInventoryAttributes } from '../types';

class ConsumableInventory extends Model<ConsumableInventoryAttributes> implements ConsumableInventoryAttributes {
  public id!: number;
  public name!: string;
  public specification?: string;
  public unit!: string;
  public quantity!: number;
  public minStock!: number;
  public maxStock?: number;
  public unitPrice!: number;
  public totalValue!: number;
  public equipmentCategoryId?: number;
  public lastInboundAt?: Date;
  public lastOutboundAt?: Date;
  public createdBy?: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ConsumableInventory.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '耗材名称'
    },
    specification: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '规格型号'
    },
    unit: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: '单位'
    },
    quantity: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: '库存数量'
    },
    minStock: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 10,
      comment: '最小库存预警值'
    },
    maxStock: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: '最大库存限制'
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '单价'
    },
    totalValue: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      comment: '库存总价值'
    },
    equipmentCategoryId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: '设备类目ID'
    },
    lastInboundAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '最后入库时间'
    },
    lastOutboundAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '最后出库时间'
    },
    createdBy: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: '创建人'
    }
  },
  {
    sequelize,
    tableName: 'consumable_inventories',
    modelName: 'ConsumableInventory',
    indexes: [
      { fields: ['name', 'specification'], unique: true }
    ]
  }
);

export default ConsumableInventory;
