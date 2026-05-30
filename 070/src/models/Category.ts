import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import { CategoryStatus } from '../utils/constants';

export interface ICategoryAttributes {
  id?: number;
  name: string;
  parentId?: number;
  level: number;
  sortOrder: number;
  status: CategoryStatus;
  description?: string;
  icon?: string;
  createdAt?: Date;
  updatedAt?: Date;
  children?: ICategoryAttributes[];
}

class Category extends Model<ICategoryAttributes> implements ICategoryAttributes {
  public id!: number;
  public name!: string;
  public parentId?: number;
  public level!: number;
  public sortOrder!: number;
  public status!: CategoryStatus;
  public description?: string;
  public icon?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public children?: Category[];
}

Category.init(
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
    parentId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: '父分类ID',
      references: {
        model: 'categories',
        key: 'id',
      },
    },
    level: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 1,
      comment: '层级',
    },
    sortOrder: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: '排序权重',
    },
    status: {
      type: DataTypes.ENUM(...Object.values(CategoryStatus)),
      allowNull: false,
      defaultValue: CategoryStatus.ACTIVE,
      comment: '状态',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '描述',
    },
    icon: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '图标',
    },
  },
  {
    sequelize,
    tableName: 'categories',
    modelName: 'Category',
  }
);

Category.hasMany(Category, { as: 'children', foreignKey: 'parentId' });
Category.belongsTo(Category, { as: 'parent', foreignKey: 'parentId' });

export default Category;
