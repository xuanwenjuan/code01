import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '../database'

interface DealerAttributes {
  id: number
  userId: number
  companyName?: string
  businessLicense?: string
  contactAddress?: string
  creditLimit: number
  currentBalance: number
  rebateRate: number
  totalPurchaseAmount: number
  level: number
  status: boolean
  remarks?: string
  createdAt: Date
  updatedAt: Date
}

interface DealerCreationAttributes extends Optional<DealerAttributes, 'id' | 'createdAt' | 'updatedAt' | 'creditLimit' | 'currentBalance' | 'rebateRate' | 'totalPurchaseAmount' | 'level' | 'status'> {}

class Dealer extends Model<DealerAttributes, DealerCreationAttributes> implements DealerAttributes {
  public id!: number
  public userId!: number
  public companyName?: string
  public businessLicense?: string
  public contactAddress?: string
  public creditLimit!: number
  public currentBalance!: number
  public rebateRate!: number
  public totalPurchaseAmount!: number
  public level!: number
  public status!: boolean
  public remarks?: string
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

Dealer.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      comment: '用户ID'
    },
    companyName: {
      type: DataTypes.STRING(200),
      comment: '公司名称'
    },
    businessLicense: {
      type: DataTypes.STRING(255),
      comment: '营业执照'
    },
    contactAddress: {
      type: DataTypes.STRING(500),
      comment: '联系地址'
    },
    creditLimit: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
      comment: '信用额度'
    },
    currentBalance: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
      comment: '当前余额'
    },
    rebateRate: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0,
      comment: '返利比例(%)'
    },
    totalPurchaseAmount: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
      comment: '累计进货金额'
    },
    level: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      comment: '经销商等级'
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
    modelName: 'Dealer',
    tableName: 'dealers',
    timestamps: true,
    indexes: [
      { fields: ['userId'] },
      { fields: ['status'] }
    ]
  }
)

export default Dealer
