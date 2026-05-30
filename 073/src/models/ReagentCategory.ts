import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { ReagentCategoryType } from '../types';

interface ReagentCategoryAttributes {
  id: number;
  name: string;
  code: string;
  type: ReagentCategoryType;
  parentId: number | null;
  sortOrder: number;
  status: boolean;
  description: string;
}

interface ReagentCategoryCreationAttributes extends Optional<ReagentCategoryAttributes, 'id' | 'parentId' | 'sortOrder' | 'status' | 'description'> {}

class ReagentCategory extends Model<ReagentCategoryAttributes, ReagentCategoryCreationAttributes> implements ReagentCategoryAttributes {
  public id!: number;
  public name!: string;
  public code!: string;
  public type!: ReagentCategoryType;
  public parentId!: number | null;
  public sortOrder!: number;
  public status!: boolean;
  public description!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public readonly children?: ReagentCategory[];
}

ReagentCategory.init(
  {
    id: {
      type: DataTypes.INTEGER,
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
    type: {
      type: DataTypes.ENUM(...Object.values(ReagentCategoryType)),
      allowNull: false
    },
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'parent_id'
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: 'reagent_categories',
    modelName: 'ReagentCategory'
  }
);

ReagentCategory.hasMany(ReagentCategory, { as: 'children', foreignKey: 'parentId' });
ReagentCategory.belongsTo(ReagentCategory, { as: 'parent', foreignKey: 'parentId' });

export default ReagentCategory;
