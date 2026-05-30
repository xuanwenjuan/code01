import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import { ActivityStatus } from '../types';

class Activity extends Model {
  public id!: number;
  public title!: string;
  public description!: string;
  public categoryId!: number;
  public merchantId!: number;
  public pricePackageId!: number;
  public maxParticipants!: number;
  public currentParticipants!: number;
  public registrationStartTime!: Date;
  public registrationEndTime!: Date;
  public activityStartTime!: Date;
  public activityEndTime!: Date;
  public location!: string;
  public fee!: number;
  public status!: ActivityStatus;
  public creatorId!: number;
  public allowedDepartments!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Activity.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'activity_categories',
        key: 'id'
      }
    },
    merchantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'merchants',
        key: 'id'
      }
    },
    pricePackageId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'price_packages',
        key: 'id'
      }
    },
    maxParticipants: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    currentParticipants: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    registrationStartTime: {
      type: DataTypes.DATE,
      allowNull: false
    },
    registrationEndTime: {
      type: DataTypes.DATE,
      allowNull: false
    },
    activityStartTime: {
      type: DataTypes.DATE,
      allowNull: false
    },
    activityEndTime: {
      type: DataTypes.DATE,
      allowNull: false
    },
    location: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    fee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    status: {
      type: DataTypes.ENUM('draft', 'registering', 'closed', 'completed'),
      allowNull: false,
      defaultValue: ActivityStatus.DRAFT
    },
    creatorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    allowedDepartments: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '允许报名的部门ID，JSON数组格式'
    }
  },
  {
    sequelize,
    modelName: 'Activity',
    tableName: 'activities'
  }
);

export default Activity;
