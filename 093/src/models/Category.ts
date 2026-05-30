import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface CategoryAttributes {
  id: number;
  name: string;
  code: string;
  parentId?: number;
  description?: string;
  sortOrder: number;
  isActive: boolean;
  level: number;
  icon?: string;
}

interface CategoryCreationAttributes extends Optional<CategoryAttributes, 'id' | 'sortOrder' | 'isActive' | 'level'> {}

class Category extends Model<CategoryAttributes, CategoryCreationAttributes> implements CategoryAttributes {
  public id!: number;
  public name!: string;
  public code!: string;
  public parentId?: number;
  public description?: string;
  public sortOrder!: number;
  public isActive!: boolean;
  public level!: number;
  public icon?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt?: Date;

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
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    parentId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: 'categories',
        key: 'id',
      },
    },
    description: {
      type: DataTypes.TEXT,
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    level: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    icon: {
      type: DataTypes.STRING(255),
    },
  },
  {
    sequelize,
    modelName: 'Category',
    tableName: 'categories',
  }
);

Category.hasMany(Category, { as: 'children', foreignKey: 'parentId' });
Category.belongsTo(Category, { as: 'parent', foreignKey: 'parentId' });

export default Category;
