import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '../database'
import { StockLockType, StockLockStatus } from '../types'

interface StockLockAttributes {
  id: number
  productId: number
  orderId?: number
  lockType: StockLockType
  lockQuantity: number
  lockStatus: StockLockStatus
  operatorId?: number
  expiredAt?: Date
  lockedAt: Date
  unlockedAt?: Date
  createdAt: Date
  updatedAt: Date
}

interface StockLockCreationAttributes extends Optional<StockLockAttributes, 'id' | 'createdAt' | 'updatedAt' | 'lockedAt'> {}

class StockLock extends Model<StockLockAttributes, StockLockCreationAttributes> implements StockLockAttributes {
  public id!: number
  public productId!: number
  public orderId?: number
  public lockType!: StockLockType
  public lockQuantity!: number
  public lockStatus!: StockLockStatus
  public operatorId?: number
  public expiredAt?: Date
  public lockedAt!: Date
  public unlockedAt?: Date
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

StockLock.init(
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
    orderId: {
      type: DataTypes.INTEGER,
      comment: '订单ID'
    },
    lockType: {
      type: DataTypes.ENUM(...Object.values(StockLockType)),
      allowNull: false,
      defaultValue: StockLockType.ORDER,
      comment: '锁定类型'
    },
    lockQuantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '锁定数量'
    },
    lockStatus: {
      type: DataTypes.ENUM(...Object.values(StockLockStatus)),
      allowNull: false,
      defaultValue: StockLockStatus.LOCKED,
      comment: '锁定状态'
    },
    operatorId: {
      type: DataTypes.INTEGER,
      comment: '操作人ID'
    },
    expiredAt: {
      type: DataTypes.DATE,
      comment: '过期时间'
    },
    lockedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: '锁定时间'
    },
    unlockedAt: {
      type: DataTypes.DATE,
      comment: '解锁时间'
    }
  },
  {
    sequelize,
    modelName: 'StockLock',
    tableName: 'stock_locks',
    timestamps: true,
    indexes: [
      { fields: ['productId'] },
      { fields: ['orderId'] },
      { fields: ['lockStatus'] },
      { fields: ['expiredAt'] }
    ]
  }
)

export default StockLock
