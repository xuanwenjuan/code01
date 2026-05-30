import { DataTypes, Model } from 'sequelize';
import sequelize from '../database';
import { MaterialCategoryType } from '../constants';

export interface MaterialCategoryAttributes {
  id?: number;
  name: string;
  code: string;
  type: MaterialCategoryType;
  parentId?: number;
  level: number;
  sort: number;
  description?: string;
  status: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

class MaterialCategory extends Model<MaterialCategoryAttributes> implements MaterialCategoryAttributes {
  public id!: number;
  public name!: string;
  public code!: string;
  public type!: MaterialCategoryType;
  public parentId?: number;
  public level!: number;
  public sort!: number;
  public description?: string;
  public status!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public readonly children?: MaterialCategory[];
}

MaterialCategory.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
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
    type: {
      type: DataTypes.ENUM(...Object.values(MaterialCategoryType)),
      allowNull: false,
      comment: '分类类型',
    },
    parentId: {
      type: DataTypes.INTEGER,
      comment: '父分类ID',
    },
    level: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: '层级',
    },
    sort: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '排序',
    },
    description: {
      type: DataTypes.TEXT,
      comment: '描述',
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: '状态',
    },
  },
  {
    sequelize,
    modelName: 'MaterialCategory',
    tableName: 'material_categories',
    indexes: [
      { fields: ['parentId'] },
      { fields: ['type'] },
      { fields: ['status'] },
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
