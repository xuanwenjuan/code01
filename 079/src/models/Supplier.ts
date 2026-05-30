import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '../database'

interface SupplierAttributes {
  id: number
  name: string
  contactPerson: string
  phone: string
  email?: string
  address?: string
  licenseNumber?: string
  businessLicense?: string
  authorizationCert?: string
  cooperationStartDate?: Date
  cooperationEndDate?: Date
  minOrderAmount: number
  rating: number
  status: boolean
  remarks?: string
  createdAt: Date
  updatedAt: Date
}

interface SupplierCreationAttributes extends Optional<SupplierAttributes, 'id' | 'createdAt' | 'updatedAt' | 'minOrderAmount' | 'rating' | 'status'> {}

class Supplier extends Model<SupplierAttributes, SupplierCreationAttributes> implements SupplierAttributes {
  public id!: number
  public name!: string
  public contactPerson!: string
  public phone!: string
  public email?: string
  public address?: string
  public licenseNumber?: string
  public businessLicense?: string
  public authorizationCert?: string
  public cooperationStartDate?: Date
  public cooperationEndDate?: Date
  public minOrderAmount!: number
  public rating!: number
  public status!: boolean
  public remarks?: string
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
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
    licenseNumber: {
      type: DataTypes.STRING(100),
      comment: '营业执照号'
    },
    businessLicense: {
      type: DataTypes.STRING(255),
      comment: '营业执照图片'
    },
    authorizationCert: {
      type: DataTypes.STRING(255),
      comment: '授权证书'
    },
    cooperationStartDate: {
      type: DataTypes.DATE,
      comment: '合作开始日期'
    },
    cooperationEndDate: {
      type: DataTypes.DATE,
      comment: '合作到期日期'
    },
    minOrderAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      comment: '起订金额'
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 5.0,
      comment: '评分'
    },
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: '状态'
    },
    remarks: {
      type: DataTypes.TEXT,
      comment: '备注'
    }
  },
  {
    sequelize,
    modelName: 'Supplier',
    tableName: 'suppliers',
    timestamps: true,
    indexes: [
      { fields: ['name'] },
      { fields: ['status'] }
    ]
  }
)

export default Supplier
