import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface RecipeAttributes {
  id: number;
  productId: number;
  name: string;
  description?: string;
  version?: string;
  storeId?: number;
  status: 'active' | 'inactive';
  createdAt?: Date;
  updatedAt?: Date;
}

interface RecipeCreationAttributes extends Optional<RecipeAttributes, 'id'> {}

class Recipe extends Model<RecipeAttributes, RecipeCreationAttributes> implements RecipeAttributes {
  public id!: number;
  public productId!: number;
  public name!: string;
  public description?: string;
  public version?: string;
  public storeId?: number;
  public status!: 'active' | 'inactive';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Recipe.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '产品ID'
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '配方名称'
    },
    description: {
      type: DataTypes.TEXT,
      comment: '配方描述'
    },
    version: {
      type: DataTypes.STRING(20),
      comment: '版本号'
    },
    storeId: {
      type: DataTypes.INTEGER,
      comment: '门店ID'
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      allowNull: false,
      defaultValue: 'active',
      comment: '状态'
    }
  },
  {
    sequelize,
    tableName: 'recipes',
    modelName: 'Recipe',
    timestamps: true
  }
);

export default Recipe;
