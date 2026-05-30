import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface SupplierAttributes {
  id: number;
  name: string;
  contact?: string;
  phone?: string;
  address?: string;
  email?: string;
  status: 'active' | 'inactive';
  storeId?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface SupplierCreationAttributes extends Optional<SupplierAttributes, 'id'> {}

class Supplier extends Model<SupplierAttributes, SupplierCreationAttributes> implements SupplierAttributes {
  public id!: number;
  public name!: string;
  public contact?: string;
  public phone?: string;
  public address?: string;
  public email?: string;
  public status!: 'active' | 'inactive';
  public storeId?: number;
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
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '供应商名称'
    },
    contact: {
      type: DataTypes.STRING(50),
      comment: '联系人'
    },
    phone: {
      type: DataTypes.STRING(20),
      comment: '联系电话'
    },
    address: {
      type: DataTypes.STRING(255),
      comment: '地址'
    },
    email: {
      type: DataTypes.STRING(100),
      comment: '邮箱'
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      allowNull: false,
      defaultValue: 'active',
      comment: '状态'
    },
    storeId: {
      type: DataTypes.INTEGER,
      comment: '门店ID'
    }
  },
  {
    sequelize,
    tableName: 'suppliers',
    modelName: 'Supplier',
    timestamps: true
  }
);

export default Supplier;
