import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

export interface CategoryAttributes {
  id?: number;
  name: string;
  parentId: number;
  level: number;
  icon?: string;
  sort: number;
  status: number;
  createdAt?: Date;
  updatedAt?: Date;
  children?: CategoryAttributes[];
}

class Category extends Model<CategoryAttributes> implements CategoryAttributes {
  public id!: number;
  public name!: string;
  public parentId!: number;
  public level!: number;
  public icon?: string;
  public sort!: number;
  public status!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public children?: CategoryAttributes[];
}

Category.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '类目名称'
    },
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '父类目ID，0表示一级类目'
    },
    level: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
      comment: '类目层级'
    },
    icon: {
      type: DataTypes.STRING(255),
      comment: '类目图标'
    },
    sort: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '排序优先级'
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
      comment: '状态 0:下架 1:正常'
    }
  },
  {
    sequelize,
    modelName: 'Category',
    tableName: 'categories',
    timestamps: true
  }
);

export default Category;
