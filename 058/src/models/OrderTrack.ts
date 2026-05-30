import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { OrderStatus } from '../types';

interface OrderTrackAttributes {
  id: number;
  orderId: number;
  status: OrderStatus;
  location?: string;
  lat?: number;
  lng?: number;
  remark?: string;
  operatorId?: number;
}

interface OrderTrackCreationAttributes extends Optional<OrderTrackAttributes, 'id' | 'location' | 'lat' | 'lng' | 'remark' | 'operatorId'> {}

class OrderTrack extends Model<OrderTrackAttributes, OrderTrackCreationAttributes> implements OrderTrackAttributes {
  public id!: number;
  public orderId!: number;
  public status!: OrderStatus;
  public location?: string;
  public lat?: number;
  public lng?: number;
  public remark?: string;
  public operatorId?: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

OrderTrack.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'order',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM(...Object.values(OrderStatus)),
      allowNull: false
    },
    location: {
      type: DataTypes.STRING(500)
    },
    lat: {
      type: DataTypes.DECIMAL(10, 7)
    },
    lng: {
      type: DataTypes.DECIMAL(10, 7)
    },
    remark: {
      type: DataTypes.TEXT
    },
    operatorId: {
      type: DataTypes.INTEGER
    }
  },
  {
    sequelize,
    tableName: 'order_track',
    modelName: 'OrderTrack'
  }
);

export default OrderTrack;
