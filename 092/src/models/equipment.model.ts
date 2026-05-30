import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { EquipmentStatus } from '../common/enums';
import Category from './category.model';

interface EquipmentAttributes {
  id: number;
  assetNo: string;
  name: string;
  brand: string;
  model: string;
  categoryId: number;
  power?: string;
  specs?: string;
  purchaseDate: Date;
  purchasePrice: number;
  maintenanceCycle: number;
  lastMaintenanceDate?: Date;
  nextMaintenanceDate?: Date;
  status: EquipmentStatus;
  location?: string;
  remarks?: string;
  depreciationRate: number;
  currentValue: number;
  createdAt: Date;
  updatedAt: Date;
}

interface EquipmentCreationAttributes extends Optional<EquipmentAttributes, 'id' | 'createdAt' | 'updatedAt' | 'power' | 'specs' | 'lastMaintenanceDate' | 'nextMaintenanceDate' | 'location' | 'remarks'> {}

class Equipment extends Model<EquipmentAttributes, EquipmentCreationAttributes> implements EquipmentAttributes {
  public id!: number;
  public assetNo!: string;
  public name!: string;
  public brand!: string;
  public model!: string;
  public categoryId!: number;
  public power?: string;
  public specs?: string;
  public purchaseDate!: Date;
  public purchasePrice!: number;
  public maintenanceCycle!: number;
  public lastMaintenanceDate?: Date;
  public nextMaintenanceDate?: Date;
  public status!: EquipmentStatus;
  public location?: string;
  public remarks?: string;
  public depreciationRate!: number;
  public currentValue!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public readonly category?: Category;
}

Equipment.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    assetNo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '资产编号',
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '设备名称',
    },
    brand: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '品牌',
    },
    model: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '型号',
    },
    categoryId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '分类ID',
    },
    power: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '功率',
    },
    specs: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '规格描述',
    },
    purchaseDate: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: '购置日期',
    },
    purchasePrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '购置价格',
    },
    maintenanceCycle: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 90,
      comment: '维保周期(天)',
    },
    lastMaintenanceDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '上次维保日期',
    },
    nextMaintenanceDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '下次维保日期',
    },
    status: {
      type: DataTypes.ENUM(...Object.values(EquipmentStatus)),
      allowNull: false,
      defaultValue: EquipmentStatus.IN_STOCK,
      comment: '状态',
    },
    location: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: '存放位置',
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '备注',
    },
    depreciationRate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0.05,
      comment: '折旧率(年)',
    },
    currentValue: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '当前价值',
    },
  },
  {
    sequelize,
    tableName: 'equipments',
    comment: '设备资产表',
  }
);

Equipment.belongsTo(Category, { as: 'category', foreignKey: 'categoryId' });
Category.hasMany(Equipment, { as: 'equipments', foreignKey: 'categoryId' });

export default Equipment;