import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { EquipmentStatus } from '../types';

interface EquipmentAttributes {
  id: number;
  equipmentNo: string;
  name: string;
  categoryId: number;
  brand: string;
  model: string;
  manufactureYear: number;
  inspectionCycle: number;
  lastInspectionDate?: Date;
  nextInspectionDate?: Date;
  storeId: number;
  status: EquipmentStatus;
  dailyRent: number;
  deposit: number;
  totalRentals: number;
  totalMaintenance: number;
  remark?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface EquipmentCreationAttributes extends Optional<EquipmentAttributes, 'id' | 'createdAt' | 'updatedAt' | 'lastInspectionDate' | 'nextInspectionDate' | 'totalRentals' | 'totalMaintenance' | 'remark'> {}

class Equipment extends Model<EquipmentAttributes, EquipmentCreationAttributes> implements EquipmentAttributes {
  public id!: number;
  public equipmentNo!: string;
  public name!: string;
  public categoryId!: number;
  public brand!: string;
  public model!: string;
  public manufactureYear!: number;
  public inspectionCycle!: number;
  public lastInspectionDate?: Date;
  public nextInspectionDate?: Date;
  public storeId!: number;
  public status!: EquipmentStatus;
  public dailyRent!: number;
  public deposit!: number;
  public totalRentals!: number;
  public totalMaintenance!: number;
  public remark?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Equipment.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    equipmentNo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '装备编号'
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '装备名称'
    },
    categoryId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '类目ID'
    },
    brand: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '品牌'
    },
    model: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '型号规格'
    },
    manufactureYear: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '出厂年份'
    },
    inspectionCycle: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 12,
      comment: '检测周期(月)'
    },
    lastInspectionDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '上次检测日期'
    },
    nextInspectionDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '下次检测日期'
    },
    storeId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '所属门店ID'
    },
    status: {
      type: DataTypes.ENUM(...Object.values(EquipmentStatus)),
      allowNull: false,
      defaultValue: EquipmentStatus.IN_STOCK,
      comment: '状态'
    },
    dailyRent: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      comment: '日租金'
    },
    deposit: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      comment: '押金'
    },
    totalRentals: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: '租借次数'
    },
    totalMaintenance: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: '维保次数'
    },
    remark: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '备注'
    }
  },
  {
    sequelize,
    tableName: 'equipments',
    modelName: 'Equipment',
    timestamps: true
  }
);

export default Equipment;
