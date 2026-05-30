import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Auction from './Auction';
import User from './User';

export interface BidAttributes {
  id: number;
  auctionId: number;
  userId: number;
  bidPrice: number;
  bidTime: Date;
  isAutoBid: boolean;
  createdAt: Date;
}

export interface BidCreationAttributes extends Optional<BidAttributes, 'id' | 'createdAt' | 'isAutoBid'> {}

class Bid extends Model<BidAttributes, BidCreationAttributes> implements BidAttributes {
  public id!: number;
  public auctionId!: number;
  public userId!: number;
  public bidPrice!: number;
  public bidTime!: Date;
  public isAutoBid!: boolean;
  public readonly createdAt!: Date;
}

Bid.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    auctionId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: 'auction_id',
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: 'user_id',
    },
    bidPrice: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      field: 'bid_price',
    },
    bidTime: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'bid_time',
    },
    isAutoBid: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_auto_bid',
    },
  },
  {
    sequelize,
    tableName: 'bids',
    timestamps: false,
    indexes: [
      { fields: ['auction_id', 'bid_price'] },
    ],
  }
);

Bid.belongsTo(Auction, { foreignKey: 'auctionId', as: 'auction' });
Bid.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export default Bid;
