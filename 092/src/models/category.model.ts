import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { CategoryStatus } from '../common/enums';

interface CategoryAttributes {
  id: number;
  name: string;
  code: string;
  parentId: number | null;
  level: number;
  sort: number;
  icon?: string;
  description?: string;
  status: CategoryStatus;
  createdAt: Date;
  updatedAt: Date;
}

interface CategoryCreationAttributes extends Optional<CategoryAttributes, 'id' | 'createdAt' | 'updatedAt' | 'icon' | 'description' | 'parentId' | 'level'> {}

class Category extends Model<CategoryAttributes, CategoryCreationAttributes> implements CategoryAttributes {
  public id!: number;
  public name!: string;
  public code!: string;
  public parentId!: number | null;
  public level!: number;
  public sort!: number;
  public icon?: string;
  public description?: string;
  public status!: CategoryStatus;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public readonly children?: Category[];
}

Category.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '分类名称',
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '分类编码',
    },
    parentId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      defaultValue: null,
      comment: '父分类ID',
    },
    level: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 1,
      comment: '层级',
    },
    sort: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: '排序',
    },
    icon: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '图标',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '描述',
    },
    status: {
      type: DataTypes.ENUM(...Object.values(CategoryStatus)),
      allowNull: false,
      defaultValue: CategoryStatus.ACTIVE,
      comment: '状态',
    },
  },
  {
    sequelize,
    tableName: 'categories',
    comment: '设备分类表',
  }
);

Category.hasMany(Category, { as: 'children', foreignKey: 'parentId' });
Category.belongsTo(Category, { as: 'parent', foreignKey: 'parentId' });

export default Category;