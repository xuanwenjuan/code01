import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import { CollectionStatus } from '../types';

class Collection extends Model {
  public id!: number;
  public collectionNo!: string;
  public name!: string;
  public categoryId!: number;
  public era?: string;
  public material?: string;
  public origin?: string;
  public preservationLevel!: number;
  public status!: CollectionStatus;
  public description?: string;
  public location?: string;
  public lastMaintenanceDate?: Date;
  public nextMaintenanceDate?: Date;
  public maintenanceCycleDays!: number;
  public exhibitionCount!: number;
  public totalExhibitionDays!: number;
  public isLocked!: boolean;
  public lockReason?: string;
  public lockedBy?: number;
  public lockedAt?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Collection.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    collectionNo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    categoryId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: 'category_id'
    },
    era: {
      type: DataTypes.STRING(100)
    },
    material: {
      type: DataTypes.STRING(100)
    },
    origin: {
      type: DataTypes.STRING(200)
    },
    preservationLevel: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      field: 'preservation_level'
    },
    status: {
      type: DataTypes.ENUM(...Object.values(CollectionStatus)),
      allowNull: false,
      defaultValue: CollectionStatus.INTACT
    },
    description: {
      type: DataTypes.TEXT
    },
    location: {
      type: DataTypes.STRING(200)
    },
    lastMaintenanceDate: {
      type: DataTypes.DATE,
      field: 'last_maintenance_date'
    },
    nextMaintenanceDate: {
      type: DataTypes.DATE,
      field: 'next_maintenance_date'
    },
    maintenanceCycleDays: {
      type: DataTypes.INTEGER,
      defaultValue: 180,
      field: 'maintenance_cycle_days'
    },
    exhibitionCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'exhibition_count'
    },
    totalExhibitionDays: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'total_exhibition_days'
    },
    isLocked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_locked'
    },
    lockReason: {
      type: DataTypes.STRING(500),
      field: 'lock_reason'
    },
    lockedBy: {
      type: DataTypes.INTEGER.UNSIGNED,
      field: 'locked_by'
    },
    lockedAt: {
      type: DataTypes.DATE,
      field: 'locked_at'
    }
  },
  {
    sequelize,
    modelName: 'Collection',
    tableName: 'collections'
  }
);

export default Collection;
