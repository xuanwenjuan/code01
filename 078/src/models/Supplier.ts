import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Supplier extends Model {
  public id!: number;
  public name!: string;
  public code!: string;
  public contactPerson!: string;
  public contactPhone!: string;
  public email!: string | null;
  public address!: string | null;
  public businessLicense!: string | null;
  public qualificationExpireDate!: Date | null;
  public supplyCategories!: string | null;
  public coverageAreas!: string | null;
  public cooperationYears!: number;
  public performanceScore!: number;
  public sort!: number;
  public status!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Supplier.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '供应商名称'
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      comment: '供应商编码'
    },
    contactPerson: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '联系人'
    },
    contactPhone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: '联系电话'
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '邮箱'
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '地址'
    },
    businessLicense: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '营业执照'
    },
    qualificationExpireDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '资质到期日期'
    },
    supplyCategories: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '供货品类，JSON格式'
    },
    coverageAreas: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '配送覆盖区域，JSON格式'
    },
    cooperationYears: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '合作年限'
    },
    performanceScore: {
      type: DataTypes.DECIMAL(3, 1),
      defaultValue: 5.0,
      comment: '履约评分'
    },
    sort: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '排序'
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
      comment: '状态：1正常，0禁用'
    }
  },
  {
    sequelize,
    modelName: 'Supplier',
    tableName: 'suppliers',
    comment: '供应商表'
  }
);

export default Supplier;
