import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../index';

interface CustomerAttributes {
  id: number;
  customerNo: string;
  companyName: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail?: string;
  address?: string;
  businessLicense?: string;
  creditLevel?: number;
  creditLimit?: number;
  status: number;
  remark?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface CustomerCreationAttributes extends Optional<CustomerAttributes, 'id' | 'createdAt' | 'updatedAt' | 'status'> {}

class Customer extends Model<CustomerAttributes, CustomerCreationAttributes> implements CustomerAttributes {
  public id!: number;
  public customerNo!: string;
  public companyName!: string;
  public contactPerson!: string;
  public contactPhone!: string;
  public contactEmail?: string;
  public address?: string;
  public businessLicense?: string;
  public creditLevel?: number;
  public creditLimit?: number;
  public status!: number;
  public remark?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Customer.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    customerNo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '客户编号'
    },
    companyName: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: '公司名称'
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
    contactEmail: {
      type: DataTypes.STRING(100),
      comment: '联系邮箱'
    },
    address: {
      type: DataTypes.STRING(500),
      comment: '公司地址'
    },
    businessLicense: {
      type: DataTypes.STRING(255),
      comment: '营业执照'
    },
    creditLevel: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      comment: '信用等级'
    },
    creditLimit: {
      type: DataTypes.DECIMAL(10, 2),
      comment: '信用额度'
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
      comment: '状态 1-正常 0-禁用'
    },
    remark: {
      type: DataTypes.TEXT,
      comment: '备注'
    }
  },
  {
    sequelize,
    modelName: 'Customer',
    tableName: 'customers',
    timestamps: true,
    indexes: [
      { fields: ['customerNo'], unique: true },
      { fields: ['contactPhone'] },
      { fields: ['status'] }
    ]
  }
);

export default Customer;
