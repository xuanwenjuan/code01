import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database';
import { SettlementStatus } from '../types';
import AuntProfile from './AuntProfile';
import Order from './Order';

interface SettlementAttributes {
  id: number;
  settlementNo: string;
  auntId: number;
  orderId: number;
  orderAmount: number;
  commissionRate: number;
  commissionAmount: number;
  auntAmount: number;
  status: SettlementStatus;
  settledAt?: Date;
  remark?: string;
}

interface SettlementCreationAttributes extends Optional<SettlementAttributes, 'id' | 'settledAt' | 'remark'> {}

class Settlement extends Model<SettlementAttributes, SettlementCreationAttributes> implements SettlementAttributes {
  public id!: number;
  public settlementNo!: string;
  public auntId!: number;
  public orderId!: number;
  public orderAmount!: number;
  public commissionRate!: number;
  public commissionAmount!: number;
  public auntAmount!: number;
  public status!: SettlementStatus;
  public settledAt?: Date;
  public remark?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly aunt?: AuntProfile;
  public readonly order?: Order;
}

Settlement.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    settlementNo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      field: 'settlement_no',
    },
    auntId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'aunt_id',
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      field: 'order_id',
    },
    orderAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'order_amount',
    },
    commissionRate: {
      type: DataTypes.DECIMAL(5, 4),
      allowNull: false,
      field: 'commission_rate',
    },
    commissionAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'commission_amount',
    },
    auntAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'aunt_amount',
    },
    status: {
      type: DataTypes.ENUM(...Object.values(SettlementStatus)),
      allowNull: false,
      defaultValue: SettlementStatus.PENDING,
    },
    settledAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'settled_at',
    },
    remark: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Settlement',
    tableName: 'settlements',
    timestamps: true,
  }
);

Settlement.belongsTo(AuntProfile, {
  as: 'aunt',
  foreignKey: 'auntId',
});

Settlement.belongsTo(Order, {
  as: 'order',
  foreignKey: 'orderId',
});

AuntProfile.hasMany(Settlement, {
  as: 'settlements',
  foreignKey: 'auntId',
});

Order.hasOne(Settlement, {
  as: 'settlement',
  foreignKey: 'orderId',
});

export default Settlement;
