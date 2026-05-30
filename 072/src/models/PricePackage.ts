import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class PricePackage extends Model {
  public id!: number;
  public merchantId!: number;
  public name!: string;
  public description!: string;
  public basePrice!: number;
  public pricePerPerson!: number;
  public minParticipants!: number;
  public maxParticipants!: number;
  public includedServices!: string;
  public status!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

PricePackage.init(
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
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    description: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    basePrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    pricePerPerson: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    minParticipants: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    maxParticipants: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    includedServices: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '包含服务，JSON格式'
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1
    }
  },
  {
    sequelize,
    modelName: 'PricePackage',
    tableName: 'price_packages'
  }
);

export default PricePackage;
