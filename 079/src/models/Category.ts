import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '../database'
import { CategoryType, Season } from '../types'

interface CategoryAttributes {
  id: number
  name: string
  type: CategoryType
  parentId?: number
  level: number
  sortOrder: number
  icon?: string
  description?: string
  season: Season
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

interface CategoryCreationAttributes extends Optional<CategoryAttributes, 'id' | 'createdAt' | 'updatedAt' | 'level' | 'isActive' | 'season'> {}

class Category extends Model<CategoryAttributes, CategoryCreationAttributes> implements CategoryAttributes {
  public id!: number
  public name!: string
  public type!: CategoryType
  public parentId?: number
  public level!: number
  public sortOrder!: number
  public icon?: string
  public description?: string
  public season!: Season
  public isActive!: boolean
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
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
    type: {
      type: DataTypes.ENUM(...Object.values(CategoryType)),
      allowNull: false,
      comment: '类目类型'
    },
    parentId: {
      type: DataTypes.INTEGER,
      comment: '父类目ID'
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
    icon: {
      type: DataTypes.STRING(255),
      comment: '图标'
    },
    description: {
      type: DataTypes.TEXT,
      comment: '描述'
    },
    season: {
      type: DataTypes.ENUM(...Object.values(Season)),
      defaultValue: Season.ALL,
      comment: '适用季节'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: '是否启用'
    }
  },
  {
    sequelize,
    modelName: 'Category',
    tableName: 'categories',
    timestamps: true,
    indexes: [
      { fields: ['parentId'] },
      { fields: ['type'] },
      { fields: ['sortOrder'] }
    ]
  }
)

export default Category
