import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import BenefitCategory from './BenefitCategory';
import Supplier from './Supplier';

class BenefitProduct extends Model {
  public id!: number;
  public name!: string;
  public code!: string;
  public categoryId!: number;
  public supplierId!: number;
  public image!: string | null;
  public description!: string | null;
  public price!: number;
  public costPrice!: number;
  public stock!: number;
  public unit!: string;
  public specs!: string | null;
  public sort!: number;
  public status!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

BenefitProduct.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '商品名称'
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      comment: '商品编码'
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '分类ID'
    },
    supplierId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '供应商ID'
    },
    image: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '商品图片'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '商品描述'
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '售价'
    },
    costPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '成本价'
    },
    stock: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '库存'
    },
    unit: {
      type: DataTypes.STRING(10),
      defaultValue: '份',
      comment: '单位'
    },
    specs: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '规格'
    },
    sort: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '排序'
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
      comment: '状态：1上架，0下架'
    }
  },
  {
    sequelize,
    modelName: 'BenefitProduct',
    tableName: 'benefit_products',
    comment: '福利商品表'
  }
);

BenefitProduct.belongsTo(BenefitCategory, { foreignKey: 'categoryId', as: 'category' });
BenefitProduct.belongsTo(Supplier, { foreignKey: 'supplierId', as: 'supplier' });
BenefitCategory.hasMany(BenefitProduct, { foreignKey: 'categoryId', as: 'products' });
Supplier.hasMany(BenefitProduct, { foreignKey: 'supplierId', as: 'products' });

export default BenefitProduct;
