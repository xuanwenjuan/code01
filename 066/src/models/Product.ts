import { DataTypes, Model } from 'sequelize';
import sequelize from '../database';
import Category from './Category';

class Product extends Model {
  public id!: number;
  public name!: string;
  public code!: string;
  public categoryId!: number;
  public spec?: string;
  public unit!: string;
  public purchasePrice!: number;
  public sellingPrice!: number;
  public stockQuantity!: number;
  public minStock!: number;
  public maxStock!: number;
  public status!: boolean;
  public description?: string;
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
    spec: {
      type: DataTypes.STRING(200),
      comment: '规格型号'
    },
    unit: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: '单位'
    },
    purchasePrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      comment: '采购价'
    },
    sellingPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      comment: '销售价'
    },
    stockQuantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '库存数量'
    },
    minStock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '最小库存预警'
    },
    maxStock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 99999,
      comment: '最大库存'
    },
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: '状态 true:启用 false:禁用'
    },
    description: {
      type: DataTypes.TEXT,
      comment: '描述'
    }
  },
  {
    sequelize,
    modelName: 'Product',
    tableName: 'products'
  }
);

Product.belongsTo(Category, { as: 'category', foreignKey: 'categoryId' });
Category.hasMany(Product, { as: 'products', foreignKey: 'categoryId' });

export default Product;