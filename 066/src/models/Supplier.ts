import { DataTypes, Model } from 'sequelize';
import sequelize from '../database';
import { SupplierStatus } from '../types';

class Supplier extends Model {
  public id!: number;
  public name!: string;
  public code!: string;
  public contactPerson!: string;
  public phone!: string;
  public email?: string;
  public address?: string;
  public brand!: string;
  public categoryIds!: string;
  public supplyCycle!: number;
  public settlementPeriod!: number;
  public taxNumber?: string;
  public bankName?: string;
  public bankAccount?: string;
  public qualificationExpiryDate?: Date;
  public status!: SupplierStatus;
  public remark?: string;
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
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: '供货商名称'
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '供货商编码'
    },
    contactPerson: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '联系人'
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: '联系电话'
    },
    email: {
      type: DataTypes.STRING(100),
      comment: '邮箱'
    },
    address: {
      type: DataTypes.STRING(500),
      comment: '地址'
    },
    brand: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '代理品牌'
    },
    categoryIds: {
      type: DataTypes.STRING(500),
      allowNull: false,
      defaultValue: '',
      comment: '供货品类ID列表，逗号分隔'
    },
    supplyCycle: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 7,
      comment: '供货周期（天）'
    },
    settlementPeriod: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 30,
      comment: '账期（天）'
    },
    taxNumber: {
      type: DataTypes.STRING(50),
      comment: '税号'
    },
    bankName: {
      type: DataTypes.STRING(100),
      comment: '开户银行'
    },
    bankAccount: {
      type: DataTypes.STRING(50),
      comment: '银行账号'
    },
    qualificationExpiryDate: {
      type: DataTypes.DATE,
      comment: '资质到期日期'
    },
    status: {
      type: DataTypes.ENUM(...Object.values(SupplierStatus)),
      allowNull: false,
      defaultValue: SupplierStatus.COOPERATING,
      comment: '合作状态'
    },
    remark: {
      type: DataTypes.TEXT,
      comment: '备注'
    }
  },
  {
    sequelize,
    modelName: 'Supplier',
    tableName: 'suppliers'
  }
);

export default Supplier;