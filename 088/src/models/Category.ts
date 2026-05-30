import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import { CategoryType } from '../types';

class Category extends Model {
  public id!: number;
  public name!: string;
  public type!: CategoryType;
  public parentId?: number;
  public sortOrder!: number;
  public isArchived!: boolean;
  public description?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly children?: Category[];
}

Category.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM(...Object.values(CategoryType)),
      allowNull: false
    },
    parentId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      defaultValue: null
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    isArchived: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    description: {
      type: DataTypes.TEXT
    }
  },
  {
    sequelize,
    modelName: 'Category',
    tableName: 'categories'
  }
);

Category.hasMany(Category, {
  as: 'children',
  foreignKey: 'parentId'
});

Category.belongsTo(Category, {
  as: 'parent',
  foreignKey: 'parentId'
});

export default Category;
