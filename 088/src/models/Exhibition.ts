import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Exhibition extends Model {
  public id!: number;
  public name!: string;
  public location!: string;
  public startDate!: Date;
  public endDate!: Date;
  public description?: string;
  public totalCost?: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Exhibition.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    location: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    totalCost: {
      type: DataTypes.DECIMAL(10, 2)
    }
  },
  {
    sequelize,
    modelName: 'Exhibition',
    tableName: 'exhibitions'
  }
);

export default Exhibition;
