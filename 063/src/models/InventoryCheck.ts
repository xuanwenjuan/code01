import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import Warehouse from './Warehouse';
import User from './User';

export enum InventoryCheckStatus {
  DRAFT = 1,
  CONFIRMED = 2,
  COMPLETED = 3
}

class InventoryCheck extends Model {
  public id!: number;
  public checkNo!: string;
  public warehouseId!: number;
  public checkDate!: Date;
  public operatorId!: number;
  public status!: InventoryCheckStatus;
  public remark?: string;
  public totalProfitQuantity!: number;
  public totalLossQuantity!: number;
  public totalProfitAmount!: number;
  public totalLossAmount!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

InventoryCheck.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    checkNo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '盘点单号'
    },
    warehouseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '仓库ID'
    },
    checkDate: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: '盘点日期'
    },
    operatorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '操作人ID'
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: InventoryCheckStatus.DRAFT,
      comment: '状态：1-草稿，2-已确认，3-已完成'
    },
    remark: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '备注'
    },
    totalProfitQuantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '盘盈总数量'
    },
    totalLossQuantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '盘亏总数量'
    },
    totalProfitAmount: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
      comment: '盘盈总金额'
    },
    totalLossAmount: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
      comment: '盘亏总金额'
    }
  },
  {
    sequelize,
    modelName: 'InventoryCheck',
    tableName: 'inventory_checks',
    comment: '库存盘点单表'
  }
);

InventoryCheck.belongsTo(Warehouse, { foreignKey: 'warehouseId', as: 'warehouse' });
InventoryCheck.belongsTo(User, { foreignKey: 'operatorId', as: 'operator' });

export default InventoryCheck;