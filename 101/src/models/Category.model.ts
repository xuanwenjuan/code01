import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import { CategoryStatus } from '../constants/enum';

export interface CategoryAttributes {
  id?: number;
  name: string;
  code: string;
  parentId: number | null;
  level: number;
  sort: number;
  status: CategoryStatus;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

class Category extends Model<CategoryAttributes> implements CategoryAttributes {
  public id!: number;
  public name!: string;
  public code!: string;
  public parentId!: number | null;
  public level!: number;
  public sort!: number;
  public status!: CategoryStatus;
  public description?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
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
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    parentId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      defaultValue: null
    },
    level: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 1
    },
    sort: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0
    },
    status: {
      type: DataTypes.ENUM(...Object.values(CategoryStatus)),
      allowNull: false,
      defaultValue: CategoryStatus.ACTIVE
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
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
