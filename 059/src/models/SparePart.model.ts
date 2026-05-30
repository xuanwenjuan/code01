import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import SparePartCategory from './SparePartCategory.model';

class SparePart extends Model {
  public id!: number;
  public name!: string;
  public code!: string;
  public categoryId!: number;
  public specification!: string;
  public model!: string;
  public unit!: string;
  public brand!: string;
  public safetyStock!: number;
  public currentStock!: number;
  public unitPrice!: number;
  public workshop!: string;
  public location!: string;
  public description!: string;
  public isEnabled!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly category?: SparePartCategory;
}

SparePart.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: '备件名称'
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '备件编码'
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '分类ID'
    },
    specification: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: '规格'
    },
    model: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: '型号'
    },
    unit: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: '单位'
    },
    brand: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '品牌'
    },
    safetyStock: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      comment: '安全库存'
    },
    currentStock: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      comment: '当前库存'
    },
    unitPrice: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      comment: '单价'
    },
    workshop: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '所属车间'
    },
    location: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: '存放位置'
    },
    description: {
      type: DataTypes.STRING(1000),
      allowNull: true,
      comment: '描述'
    },
    isEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: '是否启用'
    }
  },
  {
    sequelize,
    tableName: 'spare_parts',
    modelName: 'SparePart'
  }
);

SparePart.belongsTo(SparePartCategory, { as: 'category', foreignKey: 'categoryId' });
SparePartCategory.hasMany(SparePart, { as: 'spareParts', foreignKey: 'categoryId' });

export default SparePart;
