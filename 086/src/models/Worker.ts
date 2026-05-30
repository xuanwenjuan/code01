import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { WorkerStatus } from '../types';
import User from './User';

interface WorkerAttributes {
  id: string;
  userId: string;
  skills: string;
  serviceAreas: string;
  serviceLevel: number;
  orderCount: number;
  rating: number;
  status: WorkerStatus;
  idCardFront?: string;
  idCardBack?: string;
  healthCertificate?: string;
  healthCertExpire?: Date;
  qualification?: string;
  bankAccount?: string;
  bankName?: string;
  dailyOrderLimit: number;
  createdAt: Date;
  updatedAt: Date;
}

interface WorkerCreationAttributes extends Optional<WorkerAttributes, 'id' | 'createdAt' | 'updatedAt' | 'orderCount' | 'rating' | 'status' | 'dailyOrderLimit' | 'serviceLevel'> {}

class Worker extends Model<WorkerAttributes, WorkerCreationAttributes> implements WorkerAttributes {
  public id!: string;
  public userId!: string;
  public skills!: string;
  public serviceAreas!: string;
  public serviceLevel!: number;
  public orderCount!: number;
  public rating!: number;
  public status!: WorkerStatus;
  public idCardFront?: string;
  public idCardBack?: string;
  public healthCertificate?: string;
  public healthCertExpire?: Date;
  public qualification?: string;
  public bankAccount?: string;
  public bankName?: string;
  public dailyOrderLimit!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public readonly user?: User;
}

Worker.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id',
      references: {
        model: 'users',
        key: 'id'
      }
    },
    skills: {
      type: DataTypes.JSON,
      allowNull: false
    },
    serviceAreas: {
      type: DataTypes.JSON,
      allowNull: false,
      field: 'service_areas'
    },
    serviceLevel: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      field: 'service_level'
    },
    orderCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'order_count'
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 5.00
    },
    status: {
      type: DataTypes.ENUM(...Object.values(WorkerStatus)),
      defaultValue: WorkerStatus.RESTING,
      allowNull: false
    },
    idCardFront: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'id_card_front'
    },
    idCardBack: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'id_card_back'
    },
    healthCertificate: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'health_certificate'
    },
    healthCertExpire: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'health_cert_expire'
    },
    qualification: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    bankAccount: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'bank_account'
    },
    bankName: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'bank_name'
    },
    dailyOrderLimit: {
      type: DataTypes.INTEGER,
      defaultValue: 5,
      field: 'daily_order_limit'
    }
  },
  {
    sequelize,
    tableName: 'workers',
    timestamps: true
  }
);

Worker.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

export default Worker;
