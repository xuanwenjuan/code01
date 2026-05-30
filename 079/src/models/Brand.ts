import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '../database'

interface BrandAttributes {
  id: number
  name: string
  supplierId: number
  logo?: string
  description?: string
  origin?: string
  authorizationLevel?: string
  authorizationStartDate?: Date
  authorizationEndDate?: Date
  sortOrder: number
  status: boolean
  createdAt: Date
  updatedAt: Date
}

interface BrandCreationAttributes extends Optional<BrandAttributes, 'id' | 'createdAt' | 'updatedAt' | 'sortOrder' | 'status'> {}

class Brand extends Model<BrandAttributes, BrandCreationAttributes> implements BrandAttributes {
  public id!: number
  public name!: string
  public supplierId!: number
  public logo?: string
  public description?: string
  public origin?: string
  public authorizationLevel?: string
  public authorizationStartDate?: Date
  public authorizationEndDate?: Date
  public sortOrder!: number
  public status!: boolean
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

Brand.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '品牌名称'
    },
    supplierId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '供货商ID'
    },
    logo: {
      type: DataTypes.STRING(255),
      comment: '品牌Logo'
    },
    description: {
      type: DataTypes.TEXT,
      comment: '品牌描述'
    },
    origin: {
      type: DataTypes.STRING(100),
      comment: '产地'
    },
    authorizationLevel: {
      type: DataTypes.STRING(50),
      comment: '授权等级'
    },
    authorizationStartDate: {
      type: DataTypes.DATE,
      comment: '授权开始日期'
    },
    authorizationEndDate: {
      type: DataTypes.DATE,
      comment: '授权到期日期'
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '排序'
    },
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: '状态'
    }
  },
  {
    sequelize,
    modelName: 'Brand',
    tableName: 'brands',
    timestamps: true,
    indexes: [
      { fields: ['supplierId'] },
      { fields: ['status'] }
    ]
  }
)

export default Brand
