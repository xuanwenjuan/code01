
import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class AssetCategory extends Model {
  public id!: number;
  public name!: string;
  public code!: string;
  public parentId!: number | null;
  public level!: number;
  public sort!: number;
  public description!: string;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

AssetCategory.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '分类名称'
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '分类编码'
    },
    parentId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: '父分类ID'
    },
    level: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 1,
      comment: '层级'
    },
    sort: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: '排序'
    },
    description: {
      type: DataTypes.TEXT,
      comment: '描述'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: '是否启用'
    }
  },
  {
    sequelize,
    tableName: 'asset_categories',
    modelName: 'AssetCategory',
    timestamps: true
  }
);

AssetCategory.hasMany(AssetCategory, { as: 'children', foreignKey: 'parentId' });
AssetCategory.belongsTo(AssetCategory, { as: 'parent', foreignKey: 'parentId' });

export default AssetCategory;
