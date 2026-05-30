import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database';

export interface CategoryAttributes {
  id: number;
  name: string;
  parentId: number | null;
  level: number;
  icon?: string;
  sort: number;
  status: number;
}

export interface CategoryCreationAttributes extends Optional<CategoryAttributes, 'id'> {}

class Category extends Model<CategoryAttributes, CategoryCreationAttributes> implements CategoryAttributes {
  public id!: number;
  public name!: string;
  public parentId!: number | null;
  public level!: number;
  public icon?: string;
  public sort!: number;
  public status!: number;

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
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    parentId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      defaultValue: null,
      field: 'parent_id',
    },
    level: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
    },
    icon: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    sort: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
      comment: '1: 上架, 0: 下架',
    },
  },
  {
    sequelize,
    tableName: 'categories',
  }
);

Category.hasMany(Category, { as: 'children', foreignKey: 'parentId' });
Category.belongsTo(Category, { as: 'parent', foreignKey: 'parentId' });

export default Category;
