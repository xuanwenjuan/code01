import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Category from './Category';
import User from './User';

export enum EquipmentStatus {
  ON_SALE = 'on_sale',
  SOLD = 'sold',
  OFF_SHELF = 'off_shelf',
  IN_AUCTION = 'in_auction',
}

export enum ConditionLevel {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor',
}

export interface EquipmentAttributes {
  id: number;
  equipmentNo: string;
  name: string;
  categoryId: number;
  brand: string;
  manufactureYear: number;
  workingHours: number;
  conditionLevel: ConditionLevel;
  location: string;
  description?: string;
  images?: string;
  startPrice: number;
  reservePrice?: number;
  currentPrice?: number;
  status: EquipmentStatus;
  sellerId: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EquipmentCreationAttributes extends Optional<EquipmentAttributes, 'id' | 'createdAt' | 'updatedAt' | 'isDeleted' | 'currentPrice'> {}

class Equipment extends Model<EquipmentAttributes, EquipmentCreationAttributes> implements EquipmentAttributes {
  public id!: number;
  public equipmentNo!: string;
  public name!: string;
  public categoryId!: number;
  public brand!: string;
  public manufactureYear!: number;
  public workingHours!: number;
  public conditionLevel!: ConditionLevel;
  public location!: string;
  public description?: string;
  public images?: string;
  public startPrice!: number;
  public reservePrice?: number;
  public currentPrice?: number;
  public status!: EquipmentStatus;
  public sellerId!: number;
  public isDeleted!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Equipment.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    equipmentNo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      field: 'equipment_no',
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    categoryId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: 'category_id',
    },
    brand: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    manufactureYear: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'manufacture_year',
    },
    workingHours: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'working_hours',
    },
    conditionLevel: {
      type: DataTypes.ENUM(...Object.values(ConditionLevel)),
      allowNull: false,
      field: 'condition_level',
    },
    location: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    images: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    startPrice: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      field: 'start_price',
    },
    reservePrice: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      field: 'reserve_price',
    },
    currentPrice: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      field: 'current_price',
    },
    status: {
      type: DataTypes.ENUM(...Object.values(EquipmentStatus)),
      allowNull: false,
      defaultValue: EquipmentStatus.OFF_SHELF,
    },
    sellerId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: 'seller_id',
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_deleted',
    },
  },
  {
    sequelize,
    tableName: 'equipments',
    timestamps: true,
  }
);

Equipment.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });
Equipment.belongsTo(User, { foreignKey: 'sellerId', as: 'seller' });

export default Equipment;
