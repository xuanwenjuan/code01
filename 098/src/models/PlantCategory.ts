import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { PlantCategoryType } from '../types';

interface PlantCategoryAttributes {
  id: number;
  name: string;
  type: PlantCategoryType;
  description?: string;
  parentId?: number;
  sortOrder: number;
  isActive: boolean;
}

interface PlantCategoryCreationAttributes extends Optional<PlantCategoryAttributes, 'id' | 'sortOrder' | 'isActive'> {}

class PlantCategory extends Model<PlantCategoryAttributes, PlantCategoryCreationAttributes> implements PlantCategoryAttributes {
  public id!: number;
  public name!: string;
  public type!: PlantCategoryType;
  public description?: string;
  public parentId?: number;
  public sortOrder!: number;
  public isActive!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

PlantCategory.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM(...Object.values(PlantCategoryType)),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'parent_id'
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'sort_order'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active'
    }
  },
  {
    sequelize,
    modelName: 'PlantCategory',
    tableName: 'plant_categories',
    timestamps: true
  }
);

export default PlantCategory;
