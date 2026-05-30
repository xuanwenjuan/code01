import { DataTypes, Model } from 'sequelize';
import sequelize from '../database';

export interface TreatmentCategoryAttributes {
  id?: number;
  name: string;
  code: string;
  parentId?: number;
  description?: string;
  sort: number;
  status: 'active' | 'inactive';
  createdAt?: Date;
  updatedAt?: Date;
}

class TreatmentCategory extends Model<TreatmentCategoryAttributes> implements TreatmentCategoryAttributes {
  public id!: number;
  public name!: string;
  public code!: string;
  public parentId?: number;
  public description?: string;
  public sort!: number;
  public status!: 'active' | 'inactive';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

TreatmentCategory.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '分类名称',
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '分类编码',
    },
    parentId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: '父分类ID',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '分类描述',
    },
    sort: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '排序',
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active',
      comment: '状态',
    },
  },
  {
    sequelize,
    modelName: 'TreatmentCategory',
    tableName: 'treatment_categories',
  }
);

TreatmentCategory.hasMany(TreatmentCategory, {
  as: 'children',
  foreignKey: 'parentId',
});

TreatmentCategory.belongsTo(TreatmentCategory, {
  as: 'parent',
  foreignKey: 'parentId',
});

export default TreatmentCategory;
