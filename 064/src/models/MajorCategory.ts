import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../database';
import { MajorCategoryType } from '../types';

export class MajorCategory extends Model {
  public id!: number;
  public name!: string;
  public type!: MajorCategoryType;
  public parentId!: number | null;
  public level!: number;
  public sort!: number;
  public hours!: number;
  public isActive!: boolean;
  public description!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly children?: MajorCategory[];
}

MajorCategory.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '专业名称'
    },
    type: {
      type: DataTypes.ENUM(...Object.values(MajorCategoryType)),
      allowNull: false,
      comment: '分类类型'
    },
    parentId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      defaultValue: null,
      comment: '父级分类ID'
    },
    level: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 1,
      comment: '层级'
    },
    sort: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: '排序'
    },
    hours: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: '课时数'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: '是否启用招生'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '描述'
    }
  },
  {
    sequelize,
    tableName: 'major_categories',
    modelName: 'MajorCategory',
    timestamps: true,
    indexes: [
      { fields: ['parentId'] },
      { fields: ['type'] },
      { fields: ['isActive'] }
    ]
  }
);

MajorCategory.hasMany(MajorCategory, {
  as: 'children',
  foreignKey: 'parentId'
});

MajorCategory.belongsTo(MajorCategory, {
  as: 'parent',
  foreignKey: 'parentId'
});
