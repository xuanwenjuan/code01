import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import { CategoryStatus } from '../types';

class Category extends Model {
  public id!: number;
  public name!: string;
  public parentId!: number | null;
  public level!: number;
  public sortOrder!: number;
  public description!: string;
  public status!: CategoryStatus;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly children?: Category[];
}

Category.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
      references: {
        model: 'categories',
        key: 'id',
      },
    },
    level: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(CategoryStatus)),
      allowNull: false,
      defaultValue: CategoryStatus.ACTIVE,
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