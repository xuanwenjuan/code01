import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import SparePart from './SparePart.model';

class SafetyStockAlert extends Model {
  public id!: number;
  public sparePartId!: number;
  public currentStock!: number;
  public safetyStock!: number;
  public shortage!: number;
  public isHandled!: boolean;
  public handledBy!: number;
  public handledAt!: Date;
  public handleRemark!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly sparePart?: SparePart;
}

SafetyStockAlert.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    sparePartId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '备件ID'
    },
    currentStock: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '当前库存'
    },
    safetyStock: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '安全库存'
    },
    shortage: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '缺口数量'
    },
    isHandled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: '是否已处理'
    },
    handledBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '处理人ID'
    },
    handledAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '处理时间'
    },
    handleRemark: {
      type: DataTypes.STRING(1000),
      allowNull: true,
      comment: '处理备注'
    }
  },
  {
    sequelize,
    tableName: 'safety_stock_alerts',
    modelName: 'SafetyStockAlert'
  }
);

SafetyStockAlert.belongsTo(SparePart, { as: 'sparePart', foreignKey: 'sparePartId' });
SparePart.hasMany(SafetyStockAlert, { as: 'alerts', foreignKey: 'sparePartId' });

export default SafetyStockAlert;
