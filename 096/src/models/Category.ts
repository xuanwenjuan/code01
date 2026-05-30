import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

export interface CategoryAttributes {
  id?: number;
  name: string;
  code: string;
  parentId?: number;
  level: number;
  sort: number;
  icon?: string;
  description?: string;
  status: number;
  createdAt?: Date;
  updatedAt?: Date;
}

class Category extends Model<CategoryAttributes> implements CategoryAttributes {
  public id!: number;
  public name!: string;
  public code!: string;
  public parentId?: number;
  public level!: number;
  public sort!: number;
  public icon?: string;
  public description?: string;
  public status!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public children?: Category[];
}

Category.init(
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
    parentId: {
      type: DataTypes.INTEGER,
      comment: '父类目ID'
    },
    level: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
      comment: '类目层级'
    },
    sort: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '排序'
    },
    icon: {
      type: DataTypes.STRING(255),
      comment: '图标'
    },
    description: {
      type: DataTypes.TEXT,
      comment: '描述'
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
      comment: '状态 0-下线 1-正常'
    }
  },
  {
    sequelize,
    modelName: 'Category',
    tableName: 'categories'
  }
);

Category.hasMany(Category, { as: 'children', foreignKey: 'parentId' });
Category.belongsTo(Category, { as: 'parent', foreignKey: 'parentId' });

export default Category;