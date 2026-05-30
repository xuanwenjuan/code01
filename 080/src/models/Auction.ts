import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Equipment from './Equipment';
import User from './User';

export enum AuctionStatus {
  PENDING = 'pending',
  ONGOING = 'ongoing',
  ENDED = 'ended',
  CANCELLED = 'cancelled',
  FAILED = 'failed',
}

export interface AuctionAttributes {
  id: number;
  auctionNo: string;
  equipmentId: number;
  sellerId: number;
  startPrice: number;
  currentPrice: number;
  reservePrice?: number;
  bidIncrement: number;
  startTime: Date;
  endTime: Date;
  extendTime: number;
  winnerId?: number;
  status: AuctionStatus;
  bidCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuctionCreationAttributes extends Optional<AuctionAttributes, 'id' | 'createdAt' | 'updatedAt' | 'bidCount' | 'currentPrice'> {}

class Auction extends Model<AuctionAttributes, AuctionCreationAttributes> implements AuctionAttributes {
  public id!: number;
  public auctionNo!: string;
  public equipmentId!: number;
  public sellerId!: number;
  public startPrice!: number;
  public currentPrice!: number;
  public reservePrice?: number;
  public bidIncrement!: number;
  public startTime!: Date;
  public endTime!: Date;
  public extendTime!: number;
  public winnerId?: number;
  public status!: AuctionStatus;
  public bidCount!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Auction.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    auctionNo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      field: 'auction_no',
    },
    equipmentId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: 'equipment_id',
    },
    sellerId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: 'seller_id',
    },
    startPrice: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      field: 'start_price',
    },
    currentPrice: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      field: 'current_price',
    },
    reservePrice: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      field: 'reserve_price',
    },
    bidIncrement: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 100,
      field: 'bid_increment',
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'start_time',
    },
    endTime: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'end_time',
    },
    extendTime: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 300,
      field: 'extend_time',
    },
    winnerId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      field: 'winner_id',
    },
    status: {
      type: DataTypes.ENUM(...Object.values(AuctionStatus)),
      allowNull: false,
      defaultValue: AuctionStatus.PENDING,
    },
    bidCount: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      field: 'bid_count',
    },
  },
  {
    sequelize,
    tableName: 'auctions',
    timestamps: true,
  }
);

Auction.belongsTo(Equipment, { foreignKey: 'equipmentId', as: 'equipment' });
Auction.belongsTo(User, { foreignKey: 'sellerId', as: 'seller' });
Auction.belongsTo(User, { foreignKey: 'winnerId', as: 'winner' });

export default Auction;
