import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../index';
import { EquipmentStatus } from '../../types';

interface EquipmentAttributes {
  id: number;
  equipmentNo: string;
  name: string;
  categoryId: number;
  model: string;
  specification?: string;
  configuration?: string;
  purchaseCost: number;
  purchaseDate: Date;
  dailyPrice: number;
  monthlyPrice: number;
  deposit: number;
  status: EquipmentStatus;
  location?: string;
  maintenanceCycle?: number;
  lastMaintenanceDate?: Date;
  nextMaintenanceDate?: Date;
  remark?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface EquipmentCreationAttributes extends Optional<EquipmentAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Equipment extends Model<EquipmentAttributes, EquipmentCreationAttributes> implements EquipmentAttributes {
  public id!: number;
  public equipmentNo!: string;
  public name!: string;
  public categoryId!: number;
  public model!: string;
  public specification?: string;
  public configuration?: string;
  public purchaseCost!: number;
  public purchaseDate!: Date;
  public dailyPrice!: number;
  public monthlyPrice!: number;
  public deposit!: number;
  public status!: EquipmentStatus;
  public location?: string;
  public maintenanceCycle?: number;
  public lastMaintenanceDate?: Date;
  public nextMaintenanceDate?: Date;
  public remark?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Equipment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    equipmentNo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '设备编号'
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '设备名称'
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '类目ID'
    },
    model: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '型号'
    },
    specification: {
      type: DataTypes.STRING(255),
      comment: '规格'
    },
    configuration: {
      type: DataTypes.TEXT,
      comment: '配置参数'
    },
    purchaseCost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '采购成本'
    },
    purchaseDate: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: '采购日期'
    },
    dailyPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '日租价格'
    },
    monthlyPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '月租价格'
    },
    deposit: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '押金'
    },
    status: {
      type: DataTypes.ENUM(...Object.values(EquipmentStatus)),
      allowNull: false,
      defaultValue: EquipmentStatus.IN_STOCK,
      comment: '设备状态'
    },
    location: {
      type: DataTypes.STRING(255),
      comment: '存放位置'
    },
    maintenanceCycle: {
      type: DataTypes.INTEGER,
      comment: '维保周期(天)'
    },
    lastMaintenanceDate: {
      type: DataTypes.DATE,
      comment: '上次维保日期'
    },
    nextMaintenanceDate: {
      type: DataTypes.DATE,
      comment: '下次维保日期'
    },
    remark: {
      type: DataTypes.TEXT,
      comment: '备注'
    }
  },
  {
    sequelize,
    modelName: 'Equipment',
    tableName: 'equipments',
    timestamps: true,
    indexes: [
      { fields: ['equipmentNo'], unique: true },
      { fields: ['categoryId'] },
      { fields: ['status'] },
      { fields: ['nextMaintenanceDate'] }
    ]
  }
);

export default Equipment;
