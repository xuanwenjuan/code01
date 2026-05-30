import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface ProductAttributes {
  id: number;
  name: string;
  categoryId: number;
  storeId?: number;
  description?: string;
  images?: string;
  basePrice: number;
  sizes?: string;
  flavors?: string;
  minProductionTime?: number;
  status: 'on_shelf' | 'off_shelf';
  sort: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ProductCreationAttributes extends Optional<ProductAttributes, 'id'> {}

class Product extends Model<ProductAttributes, ProductCreationAttributes> implements ProductAttributes {
  public id!: number;
  public name!: string;
  public categoryId!: number;
  public storeId?: number;
  public description?: string;
  public images?: string;
  public basePrice!: number;
  public sizes?: string;
  public flavors?: string;
  public minProductionTime?: number;
  public status!: 'on_shelf' | 'off_shelf';
  public sort!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Product.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '产品名称'
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '分类ID'
    },
    storeId: {
      type: DataTypes.INTEGER,
      comment: '门店ID'
    },
    description: {
      type: DataTypes.TEXT,
      comment: '产品描述'
    },
    images: {
      type: DataTypes.TEXT,
      comment: '图片URL，多个用逗号分隔'
    },
    basePrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '基础价格'
    },
    sizes: {
      type: DataTypes.JSON,
      comment: '尺寸规格配置'
    },
    flavors: {
      type: DataTypes.JSON,
      comment: '口味配置'
    },
    minProductionTime: {
      type: DataTypes.INTEGER,
      comment: '最小制作时间（分钟）'
    },
    status: {
      type: DataTypes.ENUM('on_shelf', 'off_shelf'),
      allowNull: false,
      defaultValue: 'on_shelf',
      comment: '上架状态'
    },
    sort: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '排序'
    }
  },
  {
    sequelize,
    tableName: 'products',
    modelName: 'Product',
    timestamps: true
  }
);

export default Product;
