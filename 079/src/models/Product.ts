import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '../database'

interface ProductAttributes {
  id: number
  name: string
  code: string
  categoryId: number
  brandId: number
  supplierId: number
  specification?: string
  unit: string
  purchasePrice: number
  wholesalePrice: number
  retailPrice?: number
  stock: number
  lockedStock: number
  minOrderQuantity: number
  image?: string
  images?: string
  description?: string
  isHot: boolean
  isNew: boolean
  status: boolean
  sortOrder: number
  createdAt: Date
  updatedAt: Date
}

interface ProductCreationAttributes extends Optional<ProductAttributes, 'id' | 'createdAt' | 'updatedAt' | 'retailPrice' | 'stock' | 'minOrderQuantity' | 'isHot' | 'isNew' | 'status' | 'sortOrder'> {}

class Product extends Model<ProductAttributes, ProductCreationAttributes> implements ProductAttributes {
  public id!: number
  public name!: string
  public code!: string
  public categoryId!: number
  public brandId!: number
  public supplierId!: number
  public specification?: string
  public unit!: string
  public purchasePrice!: number
  public wholesalePrice!: number
  public retailPrice?: number
  public stock!: number
  public lockedStock!: number
  public minOrderQuantity!: number
  public image?: string
  public images?: string
  public description?: string
  public isHot!: boolean
  public isNew!: boolean
  public status!: boolean
  public sortOrder!: number
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

Product.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: '商品名称'
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '商品编码'
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '类目ID'
    },
    brandId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '品牌ID'
    },
    supplierId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '供货商ID'
    },
    specification: {
      type: DataTypes.STRING(200),
      comment: '规格'
    },
    unit: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: '件',
      comment: '单位'
    },
    purchasePrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '进货价'
    },
    wholesalePrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '批发价'
    },
    retailPrice: {
      type: DataTypes.DECIMAL(10, 2),
      comment: '零售价'
    },
    stock: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '库存'
    },
    lockedStock: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '锁定库存'
    },
    minOrderQuantity: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      comment: '起订量'
    },
    image: {
      type: DataTypes.STRING(255),
      comment: '主图'
    },
    images: {
      type: DataTypes.TEXT,
      comment: '轮播图(JSON)'
    },
    description: {
      type: DataTypes.TEXT,
      comment: '商品描述'
    },
    isHot: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: '是否热销'
    },
    isNew: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: '是否新品'
    },
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: '状态'
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '排序'
    }
  },
  {
    sequelize,
    modelName: 'Product',
    tableName: 'products',
    timestamps: true,
    indexes: [
      { fields: ['categoryId'] },
      { fields: ['brandId'] },
      { fields: ['supplierId'] },
      { fields: ['code'] },
      { fields: ['status'] }
    ]
  }
)

export default Product
