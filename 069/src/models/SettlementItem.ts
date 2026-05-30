import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Settlement from './Settlement';
import Order from './Order';

export interface SettlementItemAttributes {
  id: number;
  settlementId: number;
  orderId: number;
  orderNo: string;
  freightAmount: number;
  insuranceAmount?: number;
  branchCommission: number;
  driverFreight: number;
  platformFee: number;
  insuranceShare: number;
  netAmount: number;
  remark?: string;
}

export interface SettlementItemCreationAttributes extends Optional<SettlementItemAttributes, 'id'> {}

class SettlementItem extends Model<SettlementItemAttributes, SettlementItemCreationAttributes> implements SettlementItemAttributes {
  public id!: number;
  public settlementId!: number;
  public orderId!: number;
  public orderNo!: string;
  public freightAmount!: number;
  public insuranceAmount?: number;
  public branchCommission!: number;
  public driverFreight!: number;
  public platformFee!: number;
  public insuranceShare!: number;
  public netAmount!: number;
  public remark?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public readonly settlement?: Settlement;
  public readonly order?: Order;
}

SettlementItem.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    settlementId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '结算单ID'
    },
    orderId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '订单ID'
    },
    orderNo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '订单号'
    },
    freightAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      comment: '运费金额'
    },
    insuranceAmount: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
      comment: '保险金额'
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
    netAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      comment: '净结算金额'
    },
    remark: {
      type: DataTypes.TEXT,
      comment: '备注'
    }
  },
  {
    sequelize,
    tableName: 'settlement_items',
    modelName: 'SettlementItem'
  }
);

SettlementItem.belongsTo(Settlement, { foreignKey: 'settlementId', as: 'settlement' });
Settlement.hasMany(SettlementItem, { foreignKey: 'settlementId', as: 'items' });
SettlementItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });
Order.hasMany(SettlementItem, { foreignKey: 'orderId' });

export default SettlementItem;
