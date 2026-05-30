import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { CategoryStatus } from '../types';

export interface CategoryAttributes {
  id: number;
  name: string;
  parentId?: number;
  level: number;
  icon?: string;
  sort: number;
  status: CategoryStatus;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface CategoryCreationAttributes extends Optional<CategoryAttributes, 'id'> {}

class Category extends Model<CategoryAttributes, CategoryCreationAttributes> implements CategoryAttributes {
  public id!: number;
  public name!: string;
  public parentId?: number;
  public level!: number;
  public icon?: string;
  public sort!: number;
  public status!: CategoryStatus;
  public description?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Category.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '分类名称'
    },
    parentId: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '父分类ID'
    },
    level: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: '层级'
    },
    icon: {
      type: DataTypes.STRING(255),
      comment: '分类图标'
    },
    sort: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '排序'
    },
    status: {
      type: DataTypes.ENUM(...Object.values(CategoryStatus)),
      allowNull: false,
      defaultValue: CategoryStatus.ACTIVE,
      comment: '状态'
    },
    description: {
      type: DataTypes.TEXT,
      comment: '描述'
    }
  },
  {
    sequelize,
    tableName: 'categories',
    modelName: 'Category',
    timestamps: true
  }
);

export default Category;
