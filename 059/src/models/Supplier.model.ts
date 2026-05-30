import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import { CooperationStatus } from '../types';

class Supplier extends Model {
  public id!: number;
  public name!: string;
  public code!: string;
  public contactPerson!: string;
  public phone!: string;
  public email!: string;
  public address!: string;
  public supplyCategories!: string;
  public cooperationStartDate!: Date;
  public cooperationEndDate!: Date;
  public status!: CooperationStatus;
  public qualification!: string;
  public creditRating!: string;
  public remark!: string;
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
      comment: '供应商名称'
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '供应商编码'
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
      allowNull: true,
      comment: '邮箱'
    },
    address: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: '地址'
    },
    supplyCategories: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '供货品类（JSON格式存储分类ID数组）'
    },
    cooperationStartDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '合作开始日期'
    },
    cooperationEndDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '合作结束日期'
    },
    status: {
      type: DataTypes.ENUM(...Object.values(CooperationStatus)),
      allowNull: false,
      defaultValue: CooperationStatus.PENDING,
      comment: '合作状态'
    },
    qualification: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '资质信息'
    },
    creditRating: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: '信用等级'
    },
    remark: {
      type: DataTypes.STRING(1000),
      allowNull: true,
      comment: '备注'
    }
  },
  {
    sequelize,
    tableName: 'suppliers',
    modelName: 'Supplier'
  }
);

export default Supplier;

import SupplierReminder from './SupplierReminder.model';

Supplier.hasMany(SupplierReminder, { as: 'reminders', foreignKey: 'supplierId' });
SupplierReminder.belongsTo(Supplier, { as: 'supplier', foreignKey: 'supplierId' });
