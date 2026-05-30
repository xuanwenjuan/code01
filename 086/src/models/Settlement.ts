import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { SettlementStatus } from '../types';
import Worker from './Worker';
import Order from './Order';

interface SettlementAttributes {
  id: string;
  settlementNo: string;
  workerId: string;
  orderId: string;
  orderAmount: number;
  commissionRate: number;
  commissionAmount: number;
  workerAmount: number;
  status: SettlementStatus;
  settledAt?: Date;
  withdrawnAt?: Date;
  withdrawTransactionId?: string;
  remark?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface SettlementCreationAttributes extends Optional<SettlementAttributes, 'id' | 'createdAt' | 'updatedAt' | 'status'> {}

class Settlement extends Model<SettlementAttributes, SettlementCreationAttributes> implements SettlementAttributes {
  public id!: string;
  public settlementNo!: string;
  public workerId!: string;
  public orderId!: string;
  public orderAmount!: number;
  public commissionRate!: number;
  public commissionAmount!: number;
  public workerAmount!: number;
  public status!: SettlementStatus;
  public settledAt?: Date;
  public withdrawnAt?: Date;
  public withdrawTransactionId?: string;
  public remark?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public readonly worker?: Worker;
  public readonly order?: Order;
}

Settlement.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    settlementNo: {
      type: DataTypes.STRING(32),
      allowNull: false,
      unique: true,
      field: 'settlement_no'
    },
    workerId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'worker_id',
      references: {
        model: 'workers',
        key: 'id'
      }
    },
    orderId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'order_id',
      references: {
        model: 'orders',
        key: 'id'
      }
    },
    orderAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'order_amount'
    },
    commissionRate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      field: 'commission_rate'
    },
    commissionAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'commission_amount'
    },
    workerAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'worker_amount'
    },
    status: {
      type: DataTypes.ENUM(...Object.values(SettlementStatus)),
      defaultValue: SettlementStatus.PENDING,
      allowNull: false
    },
    settledAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'settled_at'
    },
    withdrawnAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'withdrawn_at'
    },
    withdrawTransactionId: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'withdraw_transaction_id'
    },
    remark: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: 'settlements',
    timestamps: true
  }
);

Settlement.belongsTo(Worker, {
  foreignKey: 'worker_id',
  as: 'worker'
});

Settlement.belongsTo(Order, {
  foreignKey: 'order_id',
  as: 'order'
});

export default Settlement;
