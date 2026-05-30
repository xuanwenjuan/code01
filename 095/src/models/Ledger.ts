import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { LedgerStatus } from '../types';
import Order from './Order';
import User from './User';

interface LedgerAttributes {
  id: number;
  orderId: number;
  orderNo: string;
  companyName: string;
  totalRevenue: number;
  totalMaterialCost: number;
  totalCustomFee: number;
  processingCost: number;
  totalCost: number;
  profit: number;
  profitRate: number;
  materialLossRate: number;
  returnLoss?: number;
  status: LedgerStatus;
  notes?: string;
  createdBy: number;
  auditBy?: number;
  auditByName?: string;
  auditTime?: Date;
  auditNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface LedgerCreationAttributes extends Optional<LedgerAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Ledger extends Model<LedgerAttributes, LedgerCreationAttributes> implements LedgerAttributes {
  public id!: number;
  public orderId!: number;
  public orderNo!: string;
  public companyName!: string;
  public totalRevenue!: number;
  public totalMaterialCost!: number;
  public totalCustomFee!: number;
  public processingCost!: number;
  public totalCost!: number;
  public profit!: number;
  public profitRate!: number;
  public materialLossRate!: number;
  public returnLoss?: number;
  public status!: LedgerStatus;
  public notes?: string;
  public createdBy!: number;
  public createdByName?: string;
  public auditBy?: number;
  public auditByName?: string;
  public auditTime?: Date;
  public auditNotes?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Ledger.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: '台账ID',
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '关联订单ID',
    },
    orderNo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '订单编号',
    },
    companyName: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: '公司名称',
    },
    totalRevenue: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      comment: '总营收',
    },
    totalMaterialCost: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      comment: '总物料成本',
    },
    totalCustomFee: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      comment: '总定制费',
    },
    processingCost: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      comment: '加工费',
    },
    totalCost: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      comment: '总成本',
    },
    profit: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      comment: '利润',
    },
    profitRate: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: false,
      defaultValue: 0,
      comment: '利润率',
    },
    materialLossRate: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: false,
      defaultValue: 0.05,
      comment: '面料损耗率',
    },
    returnLoss: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
      comment: '退货损失',
    },
    status: {
      type: DataTypes.ENUM(...Object.values(LedgerStatus)),
      allowNull: false,
      defaultValue: LedgerStatus.DRAFT,
      comment: '台账状态',
    },
    notes: {
      type: DataTypes.TEXT,
      comment: '备注',
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '创建人ID',
    },
    createdByName: {
      type: DataTypes.STRING(50),
      comment: '创建人姓名',
    },
    auditBy: {
      type: DataTypes.INTEGER,
      comment: '审核人ID',
    },
    auditByName: {
      type: DataTypes.STRING(50),
      comment: '审核人姓名',
    },
    auditTime: {
      type: DataTypes.DATE,
      comment: '审核时间',
    },
    auditNotes: {
      type: DataTypes.TEXT,
      comment: '审核备注',
    },
  },
  {
    sequelize,
    modelName: 'Ledger',
    tableName: 'ledgers',
    timestamps: true,
    comment: '营收台账表',
    indexes: [
      { fields: ['orderId'] },
      { fields: ['orderNo'] },
      { fields: ['status'] },
      { fields: ['createdAt'] },
    ],
  }
);

Ledger.belongsTo(Order, { as: 'order', foreignKey: 'orderId' });
Order.hasOne(Ledger, { as: 'ledger', foreignKey: 'orderId' });

Ledger.belongsTo(User, { as: 'creator', foreignKey: 'createdBy' });
User.hasMany(Ledger, { as: 'ledgers', foreignKey: 'createdBy' });

Ledger.belongsTo(User, { as: 'auditor', foreignKey: 'auditBy' });
User.hasMany(Ledger, { as: 'auditedLedgers', foreignKey: 'auditBy' });

export default Ledger;
