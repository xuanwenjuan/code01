import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import MaterialCategory from './material-category.model';
import Material from './material.model';
import User from './user.model';

export enum LedgerType {
  INBOUND = 'inbound',
  OUTBOUND = 'outbound',
  PROCESS_LOSS = 'process_loss',
  ADJUSTMENT = 'adjustment',
  AGING_COMPLETE = 'aging_complete',
}

export interface IInventoryLedgerAttributes {
  id?: number;
  categoryId: number;
  materialId?: number;
  batchNo?: string;
  type: LedgerType;
  quantity: number;
  beforeQuantity: number;
  afterQuantity: number;
  operatorId: number;
  sourceOrderNo?: string;
  remarks?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

class InventoryLedger extends Model<IInventoryLedgerAttributes> implements IInventoryLedgerAttributes {
  public id!: number;
  public categoryId!: number;
  public materialId?: number;
  public batchNo?: string;
  public type!: LedgerType;
  public quantity!: number;
  public beforeQuantity!: number;
  public afterQuantity!: number;
  public operatorId!: number;
  public sourceOrderNo?: string;
  public remarks?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

InventoryLedger.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    categoryId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '类目ID',
    },
    materialId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: '原料ID',
    },
    batchNo: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '批次编号',
    },
    type: {
      type: DataTypes.ENUM(...Object.values(LedgerType)),
      allowNull: false,
      comment: '台账类型',
    },
    quantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '变动数量',
    },
    beforeQuantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '变动前数量',
    },
    afterQuantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '变动后数量',
    },
    operatorId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '操作人ID',
    },
    sourceOrderNo: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '来源单号',
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '备注',
    },
  },
  {
    sequelize,
    tableName: 'inventory_ledgers',
    timestamps: true,
    indexes: [
      { fields: ['categoryId'] },
      { fields: ['materialId'] },
      { fields: ['batchNo'] },
      { fields: ['type'] },
      { fields: ['operatorId'] },
    ],
  }
);

InventoryLedger.belongsTo(MaterialCategory, {
  as: 'category',
  foreignKey: 'categoryId',
});

InventoryLedger.belongsTo(Material, {
  as: 'material',
  foreignKey: 'materialId',
});

InventoryLedger.belongsTo(User, {
  as: 'operator',
  foreignKey: 'operatorId',
});

export default InventoryLedger;
