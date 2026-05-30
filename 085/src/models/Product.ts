import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database';
import { Category } from './Category';
import { Artist } from './Artist';
import { ProductType } from '../types';

interface ProductAttributes {
  id: number;
  name: string;
  description?: string;
  categoryId: number;
  artistId: number;
  price: number;
  stock: number;
  images?: string;
  coverImage?: string;
  isCustomizable: boolean;
  productType: ProductType;
  isActive: boolean;
  sortOrder: number;
  salesCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface ProductCreationAttributes extends Optional<ProductAttributes, 'id' | 'createdAt' | 'updatedAt' | 'stock' | 'isCustomizable' | 'productType' | 'isActive' | 'sortOrder' | 'salesCount'> {}

class Product extends Model<ProductAttributes, ProductCreationAttributes> implements ProductAttributes {
  public id!: number;
  public name!: string;
  public description?: string;
  public categoryId!: number;
  public artistId!: number;
  public price!: number;
  public stock!: number;
  public images?: string;
  public coverImage?: string;
  public isCustomizable!: boolean;
  public productType!: ProductType;
  public isActive!: boolean;
  public sortOrder!: number;
  public salesCount!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public readonly category?: Category;
  public readonly artist?: Artist;
}

Product.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    categoryId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    artistId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    stock: {
      type: DataTypes.INTEGER.UNSIGNED,
      defaultValue: 0
    },
    images: {
      type: DataTypes.TEXT,
      comment: '商品图片，JSON数组存储'
    },
    coverImage: {
      type: DataTypes.STRING(255)
    },
    isCustomizable: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: '是否支持定制'
    },
    productType: {
      type: DataTypes.ENUM('normal', 'unique', 'custom'),
      defaultValue: 'normal',
      comment: '商品类型：normal-普通，unique-孤品，custom-定制'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    salesCount: {
      type: DataTypes.INTEGER.UNSIGNED,
      defaultValue: 0,
      comment: '销量'
    }
  },
  {
    sequelize,
    modelName: 'Product',
    tableName: 'products',
    indexes: [
      { fields: ['categoryId'] },
      { fields: ['artistId'] },
      { fields: ['isActive'] },
      { fields: ['sortOrder'] },
      { fields: ['productType'] }
    ]
  }
);

Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });
Product.belongsTo(Artist, { foreignKey: 'artistId', as: 'artist' });

export { Product, ProductAttributes, ProductCreationAttributes };
