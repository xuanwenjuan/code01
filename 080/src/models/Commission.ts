import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Category from './Category';
import Order from './Order';
import User from './User';

export enum CommissionStatus {
  PENDING = 'pending',
  SETTLED = 'settled',
}

export interface CommissionAttributes {
  id: number;
  orderId: number;
  sellerId: number;
  categoryId: number;
  transactionAmount: number;
  commissionRate: number;
  commissionAmount: number;
  status: CommissionStatus;
  settlementTime?: Date;
  settlementMonth: string;
  remark?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommissionCreationAttributes extends Optional<CommissionAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Commission extends Model<CommissionAttributes, CommissionCreationAttributes> implements CommissionAttributes {
  public id!: number;
  public orderId!: number;
  public sellerId!: number;
  public categoryId!: number;
  public transactionAmount!: number;
  public commissionRate!: number;
  public commissionAmount!: number;
  public status!: CommissionStatus;
  public settlementTime?: Date;
  public settlementMonth!: string;
  public remark?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Commission.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    orderId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: 'order_id',
    },
    sellerId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: 'seller_id',
    },
    categoryId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: 'category_id',
    },
    transactionAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      field: 'transaction_amount',
    },
    commissionRate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      field: 'commission_rate',
    },
    commissionAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      field: 'commission_amount',
    },
    status: {
      type: DataTypes.ENUM(...Object.values(CommissionStatus)),
      allowNull: false,
      defaultValue: CommissionStatus.PENDING,
    },
    settlementTime: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'settlement_time',
    },
    settlementMonth: {
      type: DataTypes.STRING(7),
      allowNull: false,
      field: 'settlement_month',
    },
    remark: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'commissions',
    timestamps: true,
  }
);

Commission.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });
Commission.belongsTo(User, { foreignKey: 'sellerId', as: 'seller' });
Commission.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

export default Commission;
