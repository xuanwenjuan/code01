import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { StockLockReason } from '../types';

interface StockLockAttributes {
  id: number;
  materialId: number;
  orderId?: number;
  orderItemId?: number;
  lockQuantity: number;
  lockReason: StockLockReason;
  lockedBy: number;
  lockedByName?: string;
  unlockedAt?: Date;
  unlockedBy?: number;
  isActive: boolean;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface StockLockCreationAttributes extends Optional<StockLockAttributes, 'id' | 'createdAt' | 'updatedAt' | 'isActive'> {}

class StockLock extends Model<StockLockAttributes, StockLockCreationAttributes> implements StockLockAttributes {
  public id!: number;
  public materialId!: number;
  public orderId?: number;
  public orderItemId?: number;
  public lockQuantity!: number;
  public lockReason!: StockLockReason;
  public lockedBy!: number;
  public lockedByName?: string;
  public unlockedAt?: Date;
  public unlockedBy?: number;
  public isActive!: boolean;
  public remarks?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

StockLock.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    materialId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'materials',
        key: 'id',
      },
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'orders',
        key: 'id',
      },
    },
    orderItemId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'order_items',
        key: 'id',
      },
    },
    lockQuantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    lockReason: {
      type: DataTypes.ENUM(...Object.values(StockLockReason)),
      allowNull: false,
    },
    lockedBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    lockedByName: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    unlockedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    unlockedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'StockLock',
    tableName: 'stock_locks',
    indexes: [
      { fields: ['materialId'] },
      { fields: ['orderId'] },
      { fields: ['orderItemId'] },
      { fields: ['isActive'] },
      { fields: ['lockedBy'] },
    ],
  }
);

export default StockLock;
