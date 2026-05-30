import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import { RegistrationStatus } from '../types';

class Registration extends Model {
  public id!: number;
  public activityId!: number;
  public userId!: number;
  public status!: RegistrationStatus;
  public approverId!: number | null;
  public approveTime!: Date | null;
  public approveRemark!: string;
  public checkInTime!: Date | null;
  public cancelTime!: Date | null;
  public cancelReason!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Registration.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    activityId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'activities',
        key: 'id'
      }
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected', 'cancelled', 'checked_in'),
      allowNull: false,
      defaultValue: RegistrationStatus.PENDING
    },
    approverId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    approveTime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    approveRemark: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    checkInTime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    cancelTime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    cancelReason: {
      type: DataTypes.STRING(500),
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'Registration',
    tableName: 'registrations',
    indexes: [
      {
        unique: true,
        fields: ['activityId', 'userId']
      }
    ]
  }
);

export default Registration;
