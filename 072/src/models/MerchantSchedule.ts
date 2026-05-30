import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class MerchantSchedule extends Model {
  public id!: number;
  public merchantId!: number;
  public date!: Date;
  public timeSlot!: string;
  public isLocked!: boolean;
  public eventId!: number | null;
  public pricePackageId!: number | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

MerchantSchedule.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    merchantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'merchants',
        key: 'id'
      }
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    timeSlot: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '时间段，如 09:00-12:00'
    },
    isLocked: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    eventId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'activities',
        key: 'id'
      }
    },
    pricePackageId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'price_packages',
        key: 'id'
      }
    }
  },
  {
    sequelize,
    modelName: 'MerchantSchedule',
    tableName: 'merchant_schedules',
    indexes: [
      {
        unique: true,
        fields: ['merchantId', 'date', 'timeSlot']
      }
    ]
  }
);

export default MerchantSchedule;
