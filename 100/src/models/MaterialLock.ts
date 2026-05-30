import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import { MaterialLockStatus } from '../types';

class MaterialLock extends Model {
  public id!: number;
  public lockNo!: string;
  public workOrderId!: number;
  public materialStockId!: number;
  public quantity!: number;
  public unit!: string;
  public status!: MaterialLockStatus;
  public lockedById!: number;
  public lockedAt!: Date;
  public releasedAt?: Date;
  public remark?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

MaterialLock.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    lockNo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '锁定单号'
    },
    workOrderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '工单ID'
    },
    materialStockId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '原料库存ID'
    },
    quantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '锁定数量'
    },
    unit: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: '单位'
    },
    status: {
      type: DataTypes.ENUM(...Object.values(MaterialLockStatus)),
      defaultValue: MaterialLockStatus.LOCKED,
      comment: '锁定状态'
    },
    lockedById: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '锁定人ID'
    },
    lockedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: '锁定时间'
    },
    releasedAt: {
      type: DataTypes.DATE,
      comment: '释放时间'
    },
    remark: {
      type: DataTypes.TEXT,
      comment: '备注'
    }
  },
  {
    sequelize,
    modelName: 'MaterialLock',
    tableName: 'material_locks',
    comment: '原料锁定记录表'
  }
);

export default MaterialLock;
