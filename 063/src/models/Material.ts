import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import Category from './Category';
import Warehouse from './Warehouse';

class Material extends Model {
  public id!: number;
  public name!: string;
  public code!: string;
  public specification?: string;
  public model?: string;
  public unit!: string;
  public unitPrice!: number;
  public categoryId!: number;
  public warehouseId!: number;
  public stockQuantity!: number;
  public minStockThreshold!: number;
  public location?: string;
  public description?: string;
  public status!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Material.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '物资名称'
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '物资编码'
    },
    specification: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '规格'
    },
    model: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '型号'
    },
    unit: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: '计量单位'
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      comment: '单价'
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '类目ID'
    },
    warehouseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '仓库ID'
    },
    stockQuantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '库存数量'
    },
    minStockThreshold: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '最低库存阈值'
    },
    location: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '存放位置'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '描述'
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
      comment: '状态：1-正常，0-停用'
    }
  },
  {
    sequelize,
    modelName: 'Material',
    tableName: 'materials',
    comment: '物资库存档案表'
  }
);

Material.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });
Material.belongsTo(Warehouse, { foreignKey: 'warehouseId', as: 'warehouse' });

export default Material;