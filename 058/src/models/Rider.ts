import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { RiderStatus } from '../types';

interface RiderAttributes {
  id: number;
  userId: number;
  realName: string;
  idCard: string;
  idCardFront?: string;
  idCardBack?: string;
  phone: string;
  vehicleType: string;
  vehicleNumber?: string;
  deliveryArea?: string;
  status: RiderStatus;
  canReceiveOrder: boolean;
  totalOrders: number;
  rating: number;
  balance: number;
}

interface RiderCreationAttributes extends Optional<RiderAttributes, 'id' | 'idCardFront' | 'idCardBack' | 'vehicleNumber' | 'deliveryArea' | 'status' | 'canReceiveOrder' | 'totalOrders' | 'rating' | 'balance'> {}

class Rider extends Model<RiderAttributes, RiderCreationAttributes> implements RiderAttributes {
  public id!: number;
  public userId!: number;
  public realName!: string;
  public idCard!: string;
  public idCardFront?: string;
  public idCardBack?: string;
  public phone!: string;
  public vehicleType!: string;
  public vehicleNumber?: string;
  public deliveryArea?: string;
  public status!: RiderStatus;
  public canReceiveOrder!: boolean;
  public totalOrders!: number;
  public rating!: number;
  public balance!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Rider.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: 'user',
        key: 'id'
      }
    },
    realName: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    idCard: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true
    },
    idCardFront: {
      type: DataTypes.STRING(255)
    },
    idCardBack: {
      type: DataTypes.STRING(255)
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    vehicleType: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    vehicleNumber: {
      type: DataTypes.STRING(50)
    },
    deliveryArea: {
      type: DataTypes.TEXT
    },
    status: {
      type: DataTypes.ENUM(...Object.values(RiderStatus)),
      allowNull: false,
      defaultValue: RiderStatus.PENDING
    },
    canReceiveOrder: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    totalOrders: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: false,
      defaultValue: 5.00
    },
    balance: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
    }
  },
  {
    sequelize,
    tableName: 'rider',
    modelName: 'Rider'
  }
);

export default Rider;
