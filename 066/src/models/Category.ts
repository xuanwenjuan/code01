import { DataTypes, Model } from 'sequelize';
import sequelize from '../database';
import { CategoryStatus } from '../types';

class Category extends Model {
  public id!: number;
  public name!: string;
  public code!: string;
  public parentId?: number;
  public level!: number;
  public path!: string;
  public sort!: number;
  public status!: CategoryStatus;
  public description?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly children?: Category[];
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
      allowNull: true,
      comment: '父类目ID'
    },
    level: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: '类目层级'
    },
    path: {
      type: DataTypes.STRING(500),
      allowNull: false,
      defaultValue: '',
      comment: '类目路径'
    },
    sort: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '排序权重'
    },
    status: {
      type: DataTypes.ENUM(...Object.values(CategoryStatus)),
      allowNull: false,
      defaultValue: CategoryStatus.ACTIVE,
      comment: '状态'
    },
    description: {
      type: DataTypes.TEXT,
      comment: '描述'
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