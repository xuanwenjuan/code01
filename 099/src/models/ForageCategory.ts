import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../database';
import { ForageCategoryType, ForageStatus } from '../constants';

export interface ForageCategoryAttributes {
  id?: number;
  name: string;
  code: string;
  type: ForageCategoryType;
  parentId?: number;
  level: number;
  sortOrder: number;
  status: ForageStatus;
  description?: string;
  unit: string;
  createdAt?: Date;
  updatedAt?: Date;
  children?: ForageCategoryAttributes[];
}

class ForageCategory extends Model<ForageCategoryAttributes> implements ForageCategoryAttributes {
  public id!: number;
  public name!: string;
  public code!: string;
  public type!: ForageCategoryType;
  public parentId?: number;
  public level!: number;
  public sortOrder!: number;
  public status!: ForageStatus;
  public description?: string;
  public unit!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public children?: ForageCategory[];
}

ForageCategory.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '类目名称'
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '类目编码'
    },
    type: {
      type: DataTypes.ENUM(...Object.values(ForageCategoryType)),
      allowNull: false,
      comment: '类型: concentrate-精粮饲料, forage-青储牧草, supplement-营养补剂, medicine-驱虫药剂'
    },
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
      comment: '父级类目ID'
    },
    level: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      comment: '层级'
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '排序'
    },
    status: {
      type: DataTypes.ENUM(...Object.values(ForageStatus)),
      defaultValue: ForageStatus.ACTIVE,
      comment: '状态'
    },
    description: {
      type: DataTypes.TEXT,
      comment: '描述'
    },
    unit: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'kg',
      comment: '计量单位'
    }
  },
  {
    sequelize,
    modelName: 'ForageCategory',
    tableName: 'forage_categories',
    indexes: [
      { fields: ['parentId'] },
      { fields: ['type'] },
      { fields: ['status'] }
    ]
  }
);

ForageCategory.hasMany(ForageCategory, {
  as: 'children',
  foreignKey: 'parentId',
  constraints: false
});

ForageCategory.belongsTo(ForageCategory, {
  as: 'parent',
  foreignKey: 'parentId',
  constraints: false
});

export default ForageCategory;
