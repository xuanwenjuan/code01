import { DataTypes, Model } from 'sequelize';
import sequelize from '../database';
import { InventoryOperationType } from '../types';
import Product from './Product';
import User from './User';

class InventoryLog extends Model {
  public id!: number;
  public productId!: number;
  public operationType!: InventoryOperationType;
  public quantity!: number;
  public beforeQuantity!: number;
  public afterQuantity!: number;
  public relatedOrderId?: number;
  public relatedOrderType?: string;
  public operatorId!: number;
  public remark?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

InventoryLog.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '商品ID'
    },
    operationType: {
      type: DataTypes.ENUM(...Object.values(InventoryOperationType)),
      allowNull: false,
      comment: '操作类型'
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '变动数量（正数增加，负数减少）'
    },
    beforeQuantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '变动前库存'
    },
    afterQuantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '变动后库存'
    },
    relatedOrderId: {
      type: DataTypes.INTEGER,
      comment: '关联单据ID'
    },
    relatedOrderType: {
      type: DataTypes.STRING(50),
      comment: '关联单据类型'
    },
    operatorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '操作员ID'
    },
    remark: {
      type: DataTypes.TEXT,
      comment: '备注'
    }
  },
  {
    sequelize,
    modelName: 'InventoryLog',
    tableName: 'inventory_logs'
  }
);

InventoryLog.belongsTo(Product, { as: 'product', foreignKey: 'productId' });
InventoryLog.belongsTo(User, { as: 'operator', foreignKey: 'operatorId' });

export default InventoryLog;
