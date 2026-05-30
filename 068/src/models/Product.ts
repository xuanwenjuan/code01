import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database';
import Category from './Category';

export interface ProductAttributes {
  id: number;
  categoryId: number;
  name: string;
  description?: string;
  flowerLanguage?: string;
  specs?: string;
  price: number;
  originalPrice?: number;
  stock: number;
  images?: string;
  tags?: string;
  discountStart?: Date;
  discountEnd?: Date;
  sort: number;
  status: number;
  salesCount: number;
}

export interface ProductCreationAttributes extends Optional<ProductAttributes, 'id'> {}

class Product extends Model<ProductAttributes, ProductCreationAttributes> implements ProductAttributes {
  public id!: number;
  public categoryId!: number;
  public name!: string;
  public description?: string;
  public flowerLanguage?: string;
  public specs?: string;
  public price!: number;
  public originalPrice?: number;
  public stock!: number;
  public images?: string;
  public tags?: string;
  public discountStart?: Date;
  public discountEnd?: Date;
  public sort!: number;
  public status!: number;
  public salesCount!: number;

  public readonly category?: Category;
}

Product.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    categoryId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: 'category_id',
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    flowerLanguage: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'flower_language',
      comment: '花语',
    },
    specs: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: '保鲜规格',
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    originalPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: 'original_price',
    },
    stock: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },
    images: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '商品图片，JSON 数组',
    },
    tags: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: '花语标签，JSON 数组',
    },
    discountStart: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'discount_start',
    },
    discountEnd: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'discount_end',
    },
    sort: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
      comment: '1: 上架, 0: 下架',
    },
    salesCount: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      field: 'sales_count',
    },
  },
  {
    sequelize,
    tableName: 'products',
  }
);

Product.belongsTo(Category, { as: 'category', foreignKey: 'categoryId' });
Category.hasMany(Product, { as: 'products', foreignKey: 'categoryId' });

export default Product;
