import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Branch from './Branch';

export enum VehicleStatus {
  IDLE = 'idle',
  IN_TRANSIT = 'in_transit',
  MAINTENANCE = 'maintenance'
}

export interface VehicleAttributes {
  id: number;
  plateNumber: string;
  vehicleType: string;
  loadCapacity: number;
  loadVolume?: number;
  driverName: string;
  driverPhone: string;
  driverIdCard?: string;
  operatingLicense: string;
  licenseExpireDate: Date;
  branchId: number;
  status: VehicleStatus;
  currentLocation?: string;
  remark?: string;
}

export interface VehicleCreationAttributes extends Optional<VehicleAttributes, 'id' | 'status' | 'currentLocation'> {}

class Vehicle extends Model<VehicleAttributes, VehicleCreationAttributes> implements VehicleAttributes {
  public id!: number;
  public plateNumber!: string;
  public vehicleType!: string;
  public loadCapacity!: number;
  public loadVolume?: number;
  public driverName!: string;
  public driverPhone!: string;
  public driverIdCard?: string;
  public operatingLicense!: string;
  public licenseExpireDate!: Date;
  public branchId!: number;
  public status!: VehicleStatus;
  public currentLocation?: string;
  public remark?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public readonly branch?: Branch;
}

Vehicle.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    plateNumber: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      comment: '车牌号'
    },
    vehicleType: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '车型'
    },
    loadCapacity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '载重(吨)'
    },
    loadVolume: {
      type: DataTypes.DECIMAL(10, 2),
      comment: '容积(立方米)'
    },
    driverName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '司机姓名'
    },
    driverPhone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: '司机电话'
    },
    driverIdCard: {
      type: DataTypes.STRING(20),
      comment: '司机身份证号'
    },
    operatingLicense: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '营运证号'
    },
    licenseExpireDate: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: '证件到期日期'
    },
    branchId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '所属网点ID'
    },
    status: {
      type: DataTypes.ENUM(...Object.values(VehicleStatus)),
      defaultValue: VehicleStatus.IDLE,
      comment: '状态:空闲、在途、维保'
    },
    currentLocation: {
      type: DataTypes.STRING(200),
      comment: '当前位置'
    },
    remark: {
      type: DataTypes.TEXT,
      comment: '备注'
    }
  },
  {
    sequelize,
    tableName: 'vehicles',
    modelName: 'Vehicle'
  }
);

Vehicle.belongsTo(Branch, { foreignKey: 'branchId', as: 'branch' });
Branch.hasMany(Vehicle, { foreignKey: 'branchId' });

export default Vehicle;
