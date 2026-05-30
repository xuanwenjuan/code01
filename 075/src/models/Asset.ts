
import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import { AssetStatus } from '../types';
import AssetCategory from './AssetCategory';
import User from './User';

class Asset extends Model {
  public id!: number;
  public assetCode!: string;
  public name!: string;
  public categoryId!: number;
  public specModel!: string;
  public brand!: string;
  public purchaseDate!: Date;
  public purchasePrice!: number;
  public currentValue!: number;
  public depreciationRate!: number;
  public department!: string;
  public storageLocation!: string;
  public responsiblePerson!: string;
  public status!: AssetStatus;
  public warrantyDate!: Date;
  public description!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Asset.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    assetCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '资产编号'
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '资产名称'
    },
    categoryId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '分类ID'
    },
    specModel: {
      type: DataTypes.STRING(200),
      comment: '规格型号'
    },
    brand: {
      type: DataTypes.STRING(100),
      comment: '品牌'
    },
    purchaseDate: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: '采购日期'
    },
    purchasePrice: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      comment: '采购价格'
    },
    currentValue: {
      type: DataTypes.DECIMAL(12, 2),
      comment: '当前价值'
    },
    depreciationRate: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0,
      comment: '折旧率(%)'
    },
    department: {
      type: DataTypes.STRING(100),
      comment: '使用部门'
    },
    storageLocation: {
      type: DataTypes.STRING(200),
      comment: '存放位置'
    },
    responsiblePerson: {
      type: DataTypes.STRING(50),
      comment: '责任人'
    },
    status: {
      type: DataTypes.ENUM(...Object.values(AssetStatus)),
      allowNull: false,
      defaultValue: AssetStatus.IDLE,
      comment: '资产状态'
    },
    warrantyDate: {
      type: DataTypes.DATE,
      comment: '保修到期日'
    },
    description: {
      type: DataTypes.TEXT,
      comment: '描述'
    }
  },
  {
    sequelize,
    tableName: 'assets',
    modelName: 'Asset',
    timestamps: true
  }
);

Asset.belongsTo(AssetCategory, { as: 'category', foreignKey: 'categoryId' });

export default Asset;
