import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class MaintenanceRecord extends Model {
  public id!: number;
  public collectionId!: number;
  public performedBy!: number;
  public maintenanceDate!: Date;
  public maintenanceType!: string;
  public description?: string;
  public cost?: number;
  public nextMaintenanceDate?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

MaintenanceRecord.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    collectionId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    performedBy: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    maintenanceDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    maintenanceType: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    cost: {
      type: DataTypes.DECIMAL(10, 2)
    },
    nextMaintenanceDate: {
      type: DataTypes.DATE
    }
  },
  {
    sequelize,
    modelName: 'MaintenanceRecord',
    tableName: 'maintenance_records'
  }
);

export default MaintenanceRecord;
