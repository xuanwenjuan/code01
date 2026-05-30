import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Branch from './Branch';
import Vehicle from './Vehicle';
import User from './User';

export enum SettlementStatus {
  PENDING = 'pending',
  SETTLED = 'settled',
  CANCELLED = 'cancelled'
}

export interface SettlementAttributes {
  id: number;
  settlementNo: string;
  type: 'line' | 'vehicle' | 'branch';
  branchId?: number;
  vehicleId?: number;
  startDate: Date;
  endDate: Date;
  totalOrders: number;
  totalFreight: number;
  totalInsurance: number;
  branchCommission: number;
  driverFreight: number;
  platformFee: number;
  insuranceShare: number;
  otherCosts: number;
  netAmount: number;
  status: SettlementStatus;
  operatorId?: number;
  remark?: string;
  settledAt?: Date;
}

export interface SettlementCreationAttributes extends Optional<SettlementAttributes, 'id' | 'status'> {}

class Settlement extends Model<SettlementAttributes, SettlementCreationAttributes> implements SettlementAttributes {
  public id!: number;
  public settlementNo!: string;
  public type!: 'line' | 'vehicle' | 'branch';
  public branchId?: number;
  public vehicleId?: number;
  public startDate!: Date;
  public endDate!: Date;
  public totalOrders!: number;
  public totalFreight!: number;
  public totalInsurance!: number;
  public branchCommission!: number;
  public driverFreight!: number;
  public platformFee!: number;
  public insuranceShare!: number;
  public otherCosts!: number;
  public netAmount!: number;
  public status!: SettlementStatus;
  public operatorId?: number;
  public remark?: string;
  public settledAt?: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public readonly branch?: Branch;
  public readonly vehicle?: Vehicle;
  public readonly operator?: User;
}

Settlement.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    settlementNo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '结算单号'
    },
    type: {
      type: DataTypes.ENUM('line', 'vehicle', 'branch'),
      allowNull: false,
      comment: '结算类型'
    },
    branchId: {
      type: DataTypes.INTEGER.UNSIGNED,
      comment: '网点ID'
    },
    vehicleId: {
      type: DataTypes.INTEGER.UNSIGNED,
      comment: '车辆ID'
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
    totalOrders: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '订单总数'
    },
    totalFreight: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      comment: '总运费'
    },
    totalInsurance: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      comment: '总保险费'
    },
    branchCommission: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      comment: '网点提成'
    },
    driverFreight: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      comment: '司机运费'
    },
    platformFee: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      comment: '平台服务费'
    },
    insuranceShare: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      comment: '保险分成'
    },
    otherCosts: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      comment: '其他费用'
    },
    netAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      comment: '净结算金额'
    },
    status: {
      type: DataTypes.ENUM(...Object.values(SettlementStatus)),
      defaultValue: SettlementStatus.PENDING,
      comment: '结算状态'
    },
    operatorId: {
      type: DataTypes.INTEGER.UNSIGNED,
      comment: '操作人ID'
    },
    remark: {
      type: DataTypes.TEXT,
      comment: '备注'
    },
    settledAt: {
      type: DataTypes.DATE,
      comment: '结算时间'
    }
  },
  {
    sequelize,
    tableName: 'settlements',
    modelName: 'Settlement'
  }
);

Settlement.belongsTo(Branch, { foreignKey: 'branchId', as: 'branch' });
Settlement.belongsTo(Vehicle, { foreignKey: 'vehicleId', as: 'vehicle' });
Settlement.belongsTo(User, { foreignKey: 'operatorId', as: 'operator' });
Branch.hasMany(Settlement, { foreignKey: 'branchId' });
Vehicle.hasMany(Settlement, { foreignKey: 'vehicleId' });
User.hasMany(Settlement, { foreignKey: 'operatorId' });

export default Settlement;
