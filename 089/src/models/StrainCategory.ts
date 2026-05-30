import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import { StrainCategoryType } from '../types';

class StrainCategory extends Model {
  public id!: number;
  public parentId!: number | null;
  public categoryCode!: string;
  public categoryName!: string;
  public categoryType!: StrainCategoryType;
  public description!: string | null;
  public sortOrder!: number;
  public isActive!: boolean;
  public level!: number;
  public path!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly children?: StrainCategory[];
}

StrainCategory.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
      field: 'parent_id'
    },
    categoryCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      field: 'category_code'
    },
    categoryName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'category_name'
    },
    categoryType: {
      type: DataTypes.ENUM(...Object.values(StrainCategoryType)),
      allowNull: false,
      field: 'category_type'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
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
    },
    level: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    path: {
      type: DataTypes.STRING(500),
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'StrainCategory',
    tableName: 'strain_categories'
  }
);

StrainCategory.hasMany(StrainCategory, {
  as: 'children',
  foreignKey: 'parentId',
  constraints: false
});

StrainCategory.belongsTo(StrainCategory, {
  as: 'parent',
  foreignKey: 'parentId',
  constraints: false
});

export default StrainCategory;