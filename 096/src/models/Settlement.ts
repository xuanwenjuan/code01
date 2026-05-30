import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import WorkOrder from './WorkOrder';
import User from './User';

export enum SettlementStatus {
  PENDING = 'pending',
  SETTLED = 'settled',
  CANCELLED = 'cancelled'
}

export enum SettlementType {
  REPAIR = 'repair',
  CONSIGN = 'consign'
}

export interface SettlementAttributes {
  id?: number;
  settlementNo: string;
  type: SettlementType;
  workOrderId?: number;
  categoryId?: number;
  startDate: Date;
  endDate: Date;
  totalWorkOrders: number;
  totalLaborFee: number;
  totalPartsFee: number;
  totalRepairIncome: number;
  totalCommissionAmount: number;
  totalConsignIncome: number;
  repairerShare?: number;
  storeShare?: number;
  platformShare?: number;
  status: SettlementStatus;
  settledAt?: Date;
  settledBy?: number;
  remarks?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

class Settlement extends Model<SettlementAttributes> implements SettlementAttributes {
  public id!: number;
  public settlementNo!: string;
  public type!: SettlementType;
  public workOrderId?: number;
  public categoryId?: number;
  public startDate!: Date;
  public endDate!: Date;
  public totalWorkOrders!: number;
  public totalLaborFee!: number;
  public totalPartsFee!: number;
  public totalRepairIncome!: number;
  public totalCommissionAmount!: number;
  public totalConsignIncome!: number;
  public repairerShare?: number;
  public storeShare?: number;
  public platformShare?: number;
  public status!: SettlementStatus;
  public settledAt?: Date;
  public settledBy?: number;
  public remarks?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public readonly workOrder?: WorkOrder;
  public readonly settlor?: User;
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
    type: {
      type: DataTypes.ENUM(...Object.values(SettlementType)),
      allowNull: false,
      comment: '结算类型'
    },
    workOrderId: {
      type: DataTypes.INTEGER,
      comment: '工单ID(单笔结算时)'
    },
    categoryId: {
      type: DataTypes.INTEGER,
      comment: '类目ID(按类目统计)'
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: '统计开始日期'
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: '统计结束日期'
    },
    totalWorkOrders: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '总工单数'
    },
    totalLaborFee: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      comment: '总工时费'
    },
    totalPartsFee: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      comment: '总配件费'
    },
    totalRepairIncome: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      comment: '维修总收入'
    },
    totalCommissionAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      comment: '总佣金'
    },
    totalConsignIncome: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      comment: '寄卖总收入'
    },
    repairerShare: {
      type: DataTypes.DECIMAL(10, 2),
      comment: '维修师分成'
    },
    storeShare: {
      type: DataTypes.DECIMAL(10, 2),
      comment: '门店分成'
    },
    platformShare: {
      type: DataTypes.DECIMAL(10, 2),
      comment: '平台分成'
    },
    status: {
      type: DataTypes.ENUM(...Object.values(SettlementStatus)),
      allowNull: false,
      defaultValue: SettlementStatus.PENDING,
      comment: '结算状态'
    },
    settledAt: {
      type: DataTypes.DATE,
      comment: '结算时间'
    },
    settledBy: {
      type: DataTypes.INTEGER,
      comment: '结算人ID'
    },
    remarks: {
      type: DataTypes.TEXT,
      comment: '备注'
    }
  },
  {
    sequelize,
    modelName: 'Settlement',
    tableName: 'settlements'
  }
);

Settlement.belongsTo(WorkOrder, { foreignKey: 'workOrderId', as: 'workOrder' });
WorkOrder.hasMany(Settlement, { foreignKey: 'workOrderId' });

Settlement.belongsTo(User, { foreignKey: 'settledBy', as: 'settlor' });
User.hasMany(Settlement, { foreignKey: 'settledBy', as: 'createdSettlements' });

export default Settlement;