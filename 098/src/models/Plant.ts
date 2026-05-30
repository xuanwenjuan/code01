import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { PlantHealthStatus } from '../types';

interface PlantAttributes {
  id: number;
  code: string;
  name: string;
  categoryId: number;
  areaId: number;
  location: string;
  age?: number;
  specification?: string;
  plantDate?: Date;
  maintenanceCycle: number;
  healthStatus: PlantHealthStatus;
  lastMaintenanceDate?: Date;
  nextMaintenanceDate?: Date;
  pestWarning: boolean;
  remarks?: string;
  isActive: boolean;
}

interface PlantCreationAttributes extends Optional<PlantAttributes, 'id' | 'pestWarning' | 'isActive'> {}

class Plant extends Model<PlantAttributes, PlantCreationAttributes> implements PlantAttributes {
  public id!: number;
  public code!: string;
  public name!: string;
  public categoryId!: number;
  public areaId!: number;
  public location!: string;
  public age?: number;
  public specification?: string;
  public plantDate?: Date;
  public maintenanceCycle!: number;
  public healthStatus!: PlantHealthStatus;
  public lastMaintenanceDate?: Date;
  public nextMaintenanceDate?: Date;
  public pestWarning!: boolean;
  public remarks?: string;
  public isActive!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Plant.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'category_id'
    },
    areaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'area_id'
    },
    location: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    specification: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    plantDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'plant_date'
    },
    maintenanceCycle: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 30,
      field: 'maintenance_cycle'
    },
    healthStatus: {
      type: DataTypes.ENUM(...Object.values(PlantHealthStatus)),
      allowNull: false,
      defaultValue: PlantHealthStatus.GOOD,
      field: 'health_status'
    },
    lastMaintenanceDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'last_maintenance_date'
    },
    nextMaintenanceDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'next_maintenance_date'
    },
    pestWarning: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'pest_warning'
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active'
    }
  },
  {
    sequelize,
    modelName: 'Plant',
    tableName: 'plants',
    timestamps: true
  }
);

export default Plant;
