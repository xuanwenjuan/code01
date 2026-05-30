import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database';
import { AuntStatus } from '../types';
import User from './User';

interface AuntProfileAttributes {
  id: number;
  userId: number;
  realName: string;
  idCard: string;
  idCardFront?: string;
  idCardBack?: string;
  avatar?: string;
  phone: string;
  age?: number;
  gender?: string;
  serviceYears: number;
  skills: string;
  serviceScope: string;
  description?: string;
  avgRating: number;
  orderCount: number;
  status: AuntStatus;
  rejectReason?: string;
}

interface AuntProfileCreationAttributes extends Optional<AuntProfileAttributes, 'id' | 'idCardFront' | 'idCardBack' | 'avatar' | 'age' | 'gender' | 'description' | 'avgRating' | 'orderCount' | 'status' | 'rejectReason'> {}

class AuntProfile extends Model<AuntProfileAttributes, AuntProfileCreationAttributes> implements AuntProfileAttributes {
  public id!: number;
  public userId!: number;
  public realName!: string;
  public idCard!: string;
  public idCardFront?: string;
  public idCardBack?: string;
  public avatar?: string;
  public phone!: string;
  public age?: number;
  public gender?: string;
  public serviceYears!: number;
  public skills!: string;
  public serviceScope!: string;
  public description?: string;
  public avgRating!: number;
  public orderCount!: number;
  public status!: AuntStatus;
  public rejectReason?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly user?: User;
}

AuntProfile.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'user_id',
      unique: true,
    },
    realName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'real_name',
    },
    idCard: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: 'id_card',
      unique: true,
    },
    idCardFront: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'id_card_front',
    },
    idCardBack: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'id_card_back',
    },
    avatar: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    gender: {
      type: DataTypes.ENUM('male', 'female'),
      allowNull: true,
    },
    serviceYears: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'service_years',
    },
    skills: {
      type: DataTypes.TEXT,
      allowNull: false,
      get() {
        const rawValue = this.getDataValue('skills');
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(value: any[]) {
        this.setDataValue('skills', JSON.stringify(value));
      },
    },
    serviceScope: {
      type: DataTypes.STRING(500),
      allowNull: false,
      field: 'service_scope',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    avgRating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0,
      field: 'avg_rating',
    },
    orderCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'order_count',
    },
    status: {
      type: DataTypes.ENUM(...Object.values(AuntStatus)),
      allowNull: false,
      defaultValue: AuntStatus.PENDING_REVIEW,
    },
    rejectReason: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'reject_reason',
    },
  },
  {
    sequelize,
    modelName: 'AuntProfile',
    tableName: 'aunt_profiles',
    timestamps: true,
  }
);

AuntProfile.belongsTo(User, {
  as: 'user',
  foreignKey: 'userId',
});

User.hasOne(AuntProfile, {
  as: 'auntProfile',
  foreignKey: 'userId',
});

export default AuntProfile;