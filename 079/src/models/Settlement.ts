import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '../database'

interface SettlementAttributes {
  id: number
  settlementNo: string
  dealerId: number
  startDate: Date
  endDate: Date
  totalOrderAmount: number
  totalRebateAmount: number
  totalSettlementAmount: number
  paidAmount: number
  status: 'pending' | 'partial' | 'completed'
  operatorId?: number
  remarks?: string
  createdAt: Date
  updatedAt: Date
}

interface SettlementCreationAttributes extends Optional<SettlementAttributes, 'id' | 'createdAt' | 'updatedAt' | 'paidAmount' | 'status'> {}

class Settlement extends Model<SettlementAttributes, SettlementCreationAttributes> implements SettlementAttributes {
  public id!: number
  public settlementNo!: string
  public dealerId!: number
  public startDate!: Date
  public endDate!: Date
  public totalOrderAmount!: number
  public totalRebateAmount!: number
  public totalSettlementAmount!: number
  public paidAmount!: number
  public status!: 'pending' | 'partial' | 'completed'
  public operatorId?: number
  public remarks?: string
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
}

Settlement.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    settlementNo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '结算单号'
    },
    dealerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '经销商ID'
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: '开始日期'
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: '结束日期'
    },
    totalOrderAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      comment: '订单总金额'
    },
    totalRebateAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      comment: '返利总金额'
    },
    totalSettlementAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      comment: '结算总金额'
    },
    paidAmount: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
      comment: '已付金额'
    },
    status: {
      type: DataTypes.ENUM('pending', 'partial', 'completed'),
      allowNull: false,
      defaultValue: 'pending',
      comment: '状态'
    },
    operatorId: {
      type: DataTypes.INTEGER,
      comment: '操作人ID'
    },
    remarks: {
      type: DataTypes.TEXT,
      comment: '备注'
    }
  },
  {
    sequelize,
    modelName: 'Settlement',
    tableName: 'settlements',
    timestamps: true,
    indexes: [
      { fields: ['settlementNo'] },
      { fields: ['dealerId'] },
      { fields: ['status'] }
    ]
  }
)

export default Settlement
