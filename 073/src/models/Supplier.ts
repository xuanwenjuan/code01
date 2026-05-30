import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { SupplierStatus } from '../types';

interface SupplierAttributes {
  id: number;
  name: string;
  code: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  businessLicense: string;
  qualificationCert: string;
  qualificationExpiry: Date;
  businessScope: string;
  supplyCategories: string;
  status: SupplierStatus;
  rating: number;
  remarks: string;
}

interface SupplierCreationAttributes extends Optional<SupplierAttributes, 'id' | 'rating' | 'status' | 'remarks'> {}

class Supplier extends Model<SupplierAttributes, SupplierCreationAttributes> implements SupplierAttributes {
  public id!: number;
  public name!: string;
  public code!: string;
  public contactPerson!: string;
  public phone!: string;
  public email!: string;
  public address!: string;
  public businessLicense!: string;
  public qualificationCert!: string;
  public qualificationExpiry!: Date;
  public businessScope!: string;
  public supplyCategories!: string;
  public status!: SupplierStatus;
  public rating!: number;
  public remarks!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Supplier.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    contactPerson: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true
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
      comment: '营业执照文件路径'
    },
    qualificationCert: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '资质证书文件路径'
    },
    qualificationExpiry: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '资质有效期'
    },
    businessScope: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '经营范围'
    },
    supplyCategories: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '供货品类，分类ID逗号分隔'
    },
    status: {
      type: DataTypes.ENUM(...Object.values(SupplierStatus)),
      allowNull: false,
      defaultValue: SupplierStatus.PENDING
    },
    rating: {
      type: DataTypes.DECIMAL(3, 1),
      allowNull: false,
      defaultValue: 5.0,
      comment: '供应商评分'
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: 'suppliers',
    modelName: 'Supplier'
  }
);

export default Supplier;
