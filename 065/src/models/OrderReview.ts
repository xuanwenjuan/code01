import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database';
import Order from './Order';
import User from './User';
import AuntProfile from './AuntProfile';

interface OrderReviewAttributes {
  id: number;
  orderId: number;
  userId: number;
  auntId: number;
  rating: number;
  content?: string;
  images?: string;
  serviceScore: number;
  attitudeScore: number;
  punctualityScore: number;
}

interface OrderReviewCreationAttributes extends Optional<OrderReviewAttributes, 'id' | 'content' | 'images'> {}

class OrderReview extends Model<OrderReviewAttributes, OrderReviewCreationAttributes> implements OrderReviewAttributes {
  public id!: number;
  public orderId!: number;
  public userId!: number;
  public auntId!: number;
  public rating!: number;
  public content?: string;
  public images?: string;
  public serviceScore!: number;
  public attitudeScore!: number;
  public punctualityScore!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly order?: Order;
  public readonly user?: User;
  public readonly aunt?: AuntProfile;
}

OrderReview.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      field: 'order_id',
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'user_id',
    },
    auntId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'aunt_id',
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: false,
      defaultValue: 5,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    images: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const rawValue = this.getDataValue('images');
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(value: any[]) {
        this.setDataValue('images', JSON.stringify(value));
      },
    },
    serviceScore: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 5,
      field: 'service_score',
    },
    attitudeScore: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 5,
      field: 'attitude_score',
    },
    punctualityScore: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 5,
      field: 'punctuality_score',
    },
  },
  {
    sequelize,
    modelName: 'OrderReview',
    tableName: 'order_reviews',
    timestamps: true,
  }
);

OrderReview.belongsTo(Order, {
  as: 'order',
  foreignKey: 'orderId',
});

Order.hasOne(OrderReview, {
  as: 'review',
  foreignKey: 'orderId',
});

OrderReview.belongsTo(User, {
  as: 'user',
  foreignKey: 'userId',
});

OrderReview.belongsTo(AuntProfile, {
  as: 'aunt',
  foreignKey: 'auntId',
});

export default OrderReview;
