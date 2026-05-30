import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database';
import { SettlementStatus } from '../types';
import { Artist } from './Artist';
import { User } from './User';

interface SettlementAttributes {
  id: number;
  settlementNo: string;
  artistId: number;
  month: string;
  totalOrders: number;
  totalAmount: number;
  platformFee: number;
  artistAmount: number;
  status: SettlementStatus;
  paidBy?: number;
  paidAt?: Date;
  remark?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface SettlementCreationAttributes extends Optional<SettlementAttributes, 'id' | 'createdAt' | 'updatedAt' | 'status'> {}

class Settlement extends Model<SettlementAttributes, SettlementCreationAttributes> implements SettlementAttributes {
  public id!: number;
  public settlementNo!: string;
  public artistId!: number;
  public month!: string;
  public totalOrders!: number;
  public totalAmount!: number;
  public platformFee!: number;
  public artistAmount!: number;
  public status!: SettlementStatus;
  public paidBy?: number;
  public paidAt?: Date;
  public remark?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public readonly artist?: Artist;
  public readonly items?: SettlementItem[];
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
    artistId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    month: {
      type: DataTypes.STRING(7),
      allowNull: false,
      comment: '结算月份，格式：YYYY-MM'
    },
    totalOrders: {
      type: DataTypes.INTEGER.UNSIGNED,
      defaultValue: 0,
      comment: '订单总数'
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '订单总金额'
    },
    platformFee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '平台服务费'
    },
    artistAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '艺术家分成'
    },
    status: {
      type: DataTypes.ENUM(...Object.values(SettlementStatus)),
      allowNull: false,
      defaultValue: SettlementStatus.PENDING
    },
    paidBy: {
      type: DataTypes.INTEGER.UNSIGNED,
      comment: '打款人ID'
    },
    paidAt: {
      type: DataTypes.DATE,
      comment: '打款时间'
    },
    remark: {
      type: DataTypes.TEXT
    }
  },
  {
    sequelize,
    modelName: 'Settlement',
    tableName: 'settlements',
    indexes: [
      { fields: ['settlementNo'], unique: true },
      { fields: ['artistId'] },
      { fields: ['month'] },
      { fields: ['status'] }
    ]
  }
);

Settlement.belongsTo(Artist, { foreignKey: 'artistId', as: 'artist' });
Settlement.belongsTo(User, { foreignKey: 'paidBy', as: 'payer' });

interface SettlementItemAttributes {
  id: number;
  settlementId: number;
  orderItemId: number;
  orderNo: string;
  productName: string;
  orderAmount: number;
  platformFee: number;
  artistAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface SettlementItemCreationAttributes extends Optional<SettlementItemAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class SettlementItem extends Model<SettlementItemAttributes, SettlementItemCreationAttributes> implements SettlementItemAttributes {
  public id!: number;
  public settlementId!: number;
  public orderItemId!: number;
  public orderNo!: string;
  public productName!: string;
  public orderAmount!: number;
  public platformFee!: number;
  public artistAmount!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
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
      allowNull: false
    },
    orderItemId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    orderNo: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    productName: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    orderAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    platformFee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    artistAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    }
  },
  {
    sequelize,
    modelName: 'SettlementItem',
    tableName: 'settlement_items',
    indexes: [
      { fields: ['settlementId'] },
      { fields: ['orderItemId'] }
    ]
  }
);

Settlement.hasMany(SettlementItem, { as: 'items', foreignKey: 'settlementId' });
SettlementItem.belongsTo(Settlement, { foreignKey: 'settlementId', as: 'settlement' });

export { Settlement, SettlementAttributes, SettlementCreationAttributes, SettlementItem, SettlementItemAttributes, SettlementItemCreationAttributes };
