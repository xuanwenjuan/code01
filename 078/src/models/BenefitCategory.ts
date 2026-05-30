import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class BenefitCategory extends Model {
  public id!: number;
  public name!: string;
  public code!: string;
  public parentId!: number | null;
  public level!: number;
  public icon!: string | null;
  public description!: string | null;
  public sort!: number;
  public status!: number;
  public isStop!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public children?: BenefitCategory[];
}

BenefitCategory.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '分类名称'
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      comment: '分类编码'
    },
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '父分类ID'
    },
    level: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      comment: '层级'
    },
    icon: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '图标'
    },
    description: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: '描述'
    },
    sort: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '排序'
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
      comment: '状态：1启用，0禁用'
    },
    isStop: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
      comment: '是否停发：1停发，0正常'
    }
  },
  {
    sequelize,
    modelName: 'BenefitCategory',
    tableName: 'benefit_categories',
    comment: '福利商品分类表'
  }
);

BenefitCategory.hasMany(BenefitCategory, { foreignKey: 'parentId', as: 'children' });

export default BenefitCategory;
