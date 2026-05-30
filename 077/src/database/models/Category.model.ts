import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../index';

interface CategoryAttributes {
  id: number;
  name: string;
  parentId?: number;
  level: number;
  sort: number;
  icon?: string;
  description?: string;
  status: number;
  createdAt: Date;
  updatedAt: Date;
}

interface CategoryCreationAttributes extends Optional<CategoryAttributes, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'sort' | 'level'> {}

class Category extends Model<CategoryAttributes, CategoryCreationAttributes> implements CategoryAttributes {
  public id!: number;
  public name!: string;
  public parentId?: number;
  public level!: number;
  public sort!: number;
  public icon?: string;
  public description?: string;
  public status!: number;
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
    parentId: {
      type: DataTypes.INTEGER,
      comment: '父级ID'
    },
    level: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      comment: '层级'
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
      comment: '状态 1-启用 0-禁用'
    }
  },
  {
    sequelize,
    modelName: 'Category',
    tableName: 'categories',
    timestamps: true,
    indexes: [
      { fields: ['parentId'] },
      { fields: ['level'] },
      { fields: ['sort'] },
      { fields: ['status'] }
    ]
  }
);

Category.hasMany(Category, { as: 'children', foreignKey: 'parentId' });
Category.belongsTo(Category, { as: 'parent', foreignKey: 'parentId' });

export default Category;
