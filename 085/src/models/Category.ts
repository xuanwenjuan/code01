import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database';
import { CategoryStatus } from '../types';

interface CategoryAttributes {
  id: number;
  name: string;
  parentId?: number;
  icon?: string;
  sortOrder: number;
  status: CategoryStatus;
  level: number;
  path: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface CategoryCreationAttributes extends Optional<CategoryAttributes, 'id' | 'createdAt' | 'updatedAt' | 'sortOrder' | 'level' | 'path' | 'status'> {}

class Category extends Model<CategoryAttributes, CategoryCreationAttributes> implements CategoryAttributes {
  public id!: number;
  public name!: string;
  public parentId?: number;
  public icon?: string;
  public sortOrder!: number;
  public status!: CategoryStatus;
  public level!: number;
  public path!: string;
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
    parentId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      defaultValue: null
    },
    icon: {
      type: DataTypes.STRING(255)
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    status: {
      type: DataTypes.ENUM(...Object.values(CategoryStatus)),
      allowNull: false,
      defaultValue: CategoryStatus.ACTIVE
    },
    level: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    path: {
      type: DataTypes.STRING(500),
      defaultValue: ''
    },
    description: {
      type: DataTypes.TEXT
    }
  },
  {
    sequelize,
    modelName: 'Category',
    tableName: 'categories',
    indexes: [
      { fields: ['parentId'] },
      { fields: ['status'] },
      { fields: ['sortOrder'] }
    ]
  }
);

Category.hasMany(Category, { as: 'children', foreignKey: 'parentId' });
Category.belongsTo(Category, { as: 'parent', foreignKey: 'parentId' });

export { Category, CategoryAttributes, CategoryCreationAttributes };
