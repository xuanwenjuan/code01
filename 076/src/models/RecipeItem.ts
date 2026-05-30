import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface RecipeItemAttributes {
  id: number;
  recipeId: number;
  ingredientId: number;
  quantity: number;
  unit: string;
  remark?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface RecipeItemCreationAttributes extends Optional<RecipeItemAttributes, 'id'> {}

class RecipeItem extends Model<RecipeItemAttributes, RecipeItemCreationAttributes> implements RecipeItemAttributes {
  public id!: number;
  public recipeId!: number;
  public ingredientId!: number;
  public quantity!: number;
  public unit!: string;
  public remark?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

RecipeItem.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    recipeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '配方ID'
    },
    ingredientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '原料ID'
    },
    quantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '用量'
    },
    unit: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: '单位'
    },
    remark: {
      type: DataTypes.STRING(255),
      comment: '备注'
    }
  },
  {
    sequelize,
    tableName: 'recipe_items',
    modelName: 'RecipeItem',
    timestamps: true
  }
);

export default RecipeItem;
