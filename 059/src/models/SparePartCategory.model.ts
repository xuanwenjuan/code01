import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class SparePartCategory extends Model {
  public id!: number;
  public name!: string;
  public code!: string;
  public parentId!: number | null;
  public level!: number;
  public path!: string;
  public sort!: number;
  public description!: string;
  public isEnabled!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly children?: SparePartCategory[];
}

SparePartCategory.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
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
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '父分类ID'
    },
    level: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: '层级'
    },
    path: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: '路径'
    },
    sort: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '排序'
    },
    description: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: '描述'
    },
    isEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: '是否启用'
    }
  },
  {
    sequelize,
    tableName: 'spare_part_categories',
    modelName: 'SparePartCategory'
  }
);

SparePartCategory.hasMany(SparePartCategory, { as: 'children', foreignKey: 'parentId' });
SparePartCategory.belongsTo(SparePartCategory, { as: 'parent', foreignKey: 'parentId' });

export default SparePartCategory;
