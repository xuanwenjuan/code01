import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import { MerchantStatus } from '../types';

class Merchant extends Model {
  public id!: number;
  public name!: string;
  public contactPerson!: string;
  public phone!: string;
  public email!: string;
  public address!: string;
  public businessLicense!: string;
  public serviceItems!: string;
  public cooperationStartDate!: Date;
  public cooperationEndDate!: Date;
  public status!: MerchantStatus;
  public auditRemark!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Merchant.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    contactPerson: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    address: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    businessLicense: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '营业执照图片路径'
    },
    serviceItems: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '承接项目，JSON格式存储'
    },
    cooperationStartDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    cooperationEndDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected', 'suspended'),
      allowNull: false,
      defaultValue: MerchantStatus.PENDING
    },
    auditRemark: {
      type: DataTypes.STRING(500),
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'Merchant',
    tableName: 'merchants'
  }
);

export default Merchant;
