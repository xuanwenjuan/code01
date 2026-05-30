import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import Material from './Material';
import Warehouse from './Warehouse';
import User from './User';

export enum StockLogType {
  IN = 1,
  OUT = 2,
  CHECK_IN = 3,
  CHECK_OUT = 4,
  LOSS = 5
}

class StockLog extends Model {
  public id!: number;
  public logNo!: string;
  public materialId!: number;
  public warehouseId!: number;
  public type!: StockLogType;
  public quantity!: number;
  public beforeQuantity!: number;
  public afterQuantity!: number;
  public operatorId!: number;
  public remark?: string;
  public relatedId?: number;
  public relatedType?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

StockLog.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    logNo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '流水号'
    },
    materialId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '物资ID'
    },
    warehouseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '仓库ID'
    },
    type: {
      type: DataTypes.TINYINT,
      allowNull: false,
      comment: '类型：1-入库，2-出库，3-盘盈，4-盘亏，5-损耗'
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '变动数量'
    },
    beforeQuantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '变动前数量'
    },
    afterQuantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '变动后数量'
    },
    operatorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '操作人ID'
    },
    remark: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '备注'
    },
    relatedId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '关联业务ID'
    },
    relatedType: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '关联业务类型'
    }
  },
  {
    sequelize,
    modelName: 'StockLog',
    tableName: 'stock_logs',
    comment: '库存变动记录表'
  }
);

StockLog.belongsTo(Material, { foreignKey: 'materialId', as: 'material' });
StockLog.belongsTo(Warehouse, { foreignKey: 'warehouseId', as: 'warehouse' });
StockLog.belongsTo(User, { foreignKey: 'operatorId', as: 'operator' });

export default StockLog;