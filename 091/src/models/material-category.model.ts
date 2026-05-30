import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import { MaterialCategoryType } from '../constants/material.constants';

export interface IMaterialCategoryAttributes {
  id?: number;
  name: string;
  code: string;
  type: MaterialCategoryType;
  parentId?: number;
  level: number;
  sortOrder: number;
  description?: string;
  isActive: boolean;
  isSealed: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  children?: IMaterialCategoryAttributes[];
}

class MaterialCategory extends Model<IMaterialCategoryAttributes> implements IMaterialCategoryAttributes {
  public id!: number;
  public name!: string;
  public code!: string;
  public type!: MaterialCategoryType;
  public parentId?: number;
  public level!: number;
  public sortOrder!: number;
  public description?: string;
  public isActive!: boolean;
  public isSealed!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public children?: MaterialCategory[];
}

MaterialCategory.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '类目名称',
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '类目编码',
    },
    type: {
      type: DataTypes.ENUM(...Object.values(MaterialCategoryType)),
      allowNull: false,
      comment: '类目类型',
    },
    parentId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: '父级ID',
    },
    level: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 1,
      comment: '层级',
    },
    sortOrder: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: '排序',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '描述',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: '是否启用',
    },
    isSealed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: '是否停采封存',
    },
  },
  {
    sequelize,
    tableName: 'material_categories',
    timestamps: true,
    indexes: [
      { fields: ['code'] },
      { fields: ['parentId'] },
      { fields: ['type'] },
      { fields: ['sortOrder'] },
    ],
  }
);

MaterialCategory.hasMany(MaterialCategory, {
  as: 'children',
  foreignKey: 'parentId',
});

MaterialCategory.belongsTo(MaterialCategory, {
  as: 'parent',
  foreignKey: 'parentId',
});

export default MaterialCategory;
