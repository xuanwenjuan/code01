import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

export enum ProductStatus {
  OFF_SHELF = 0,
  ON_SHELF = 1
}

export interface ProductAttributes {
  id?: number;
  categoryId: number;
  name: string;
  image?: string;
  images?: string;
  description?: string;
  specs?: string;
  unit: string;
  originPrice: number;
  groupPrice: number;
  supplierId: number;
  stock: number;
  soldCount: number;
  sort: number;
  status: ProductStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

class Product extends Model<ProductAttributes> implements ProductAttributes {
  public id!: number;
  public categoryId!: number;
  public name!: string;
  public image?: string;
  public images?: string;
  public description?: string;
  public specs?: string;
  public unit!: string;
  public originPrice!: number;
  public groupPrice!: number;
  public supplierId!: number;
  public stock!: number;
  public soldCount!: number;
  public sort!: number;
  public status!: ProductStatus;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Product.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '类目ID'
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '商品名称'
    },
    image: {
      type: DataTypes.STRING(255),
      comment: '主图'
    },
    images: {
      type: DataTypes.TEXT,
      comment: '多图JSON'
    },
    description: {
      type: DataTypes.TEXT,
      comment: '商品描述'
    },
    specs: {
      type: DataTypes.STRING(255),
      comment: '规格'
    },
    unit: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: '单位'
    },
    originPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '原价'
    },
    groupPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '团购价'
    },
    supplierId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '供应商ID'
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '库存'
    },
    soldCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '销量'
    },
    sort: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '排序'
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: ProductStatus.ON_SHELF,
      comment: '状态 0:下架 1:上架'
    }
  },
  {
    sequelize,
    modelName: 'Product',
    tableName: 'products',
    timestamps: true
  }
);

export default Product;
