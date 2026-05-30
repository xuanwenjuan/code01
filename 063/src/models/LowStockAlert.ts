import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import Material from './Material';
import Warehouse from './Warehouse';
import Category from './Category';

export enum AlertStatus {
  PENDING = 1,
  PROCESSED = 2,
  IGNORED = 3
}

class LowStockAlert extends Model {
  public id!: number;
  public materialId!: number;
  public materialName!: string;
  public materialCode!: string;
  public currentStock!: number;
  public minThreshold!: number;
  public warehouseId!: number;
  public warehouseName!: string;
  public categoryId!: number;
  public categoryName!: string;
  public status!: AlertStatus;
  public processedBy?: number;
  public processedAt?: Date;
  public remark?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

LowStockAlert.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    materialId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '物资ID'
    },
    materialName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '物资名称'
    },
    materialCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '物资编码'
    },
    currentStock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '当前库存'
    },
    minThreshold: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '最低库存阈值'
    },
    warehouseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '仓库ID'
    },
    warehouseName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '仓库名称'
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '类目ID'
    },
    categoryName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '类目名称'
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: AlertStatus.PENDING,
      comment: '状态：1-待处理，2-已处理，3-已忽略'
    },
    processedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '处理人ID'
    },
    processedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '处理时间'
    },
    remark: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '备注'
    }
  },
  {
    sequelize,
    modelName: 'LowStockAlert',
    tableName: 'low_stock_alerts',
    comment: '低库存预警表',
    indexes: [
      {
        fields: ['materialId']
      },
      {
        fields: ['status']
      },
      {
        fields: ['createdAt']
      }
    ]
  }
);

LowStockAlert.belongsTo(Material, { foreignKey: 'materialId', as: 'material' });
LowStockAlert.belongsTo(Warehouse, { foreignKey: 'warehouseId', as: 'warehouse' });
LowStockAlert.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

export default LowStockAlert;
