import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import { EquipmentStatus } from '../types';

class Equipment extends Model {
  public id!: number;
  public name!: string;
  public code!: string;
  public categoryId!: number;
  public departmentId!: number;
  public specification!: string;
  public model!: string;
  public manufacturer!: string;
  public purchaseDate!: Date;
  public warrantyPeriod!: number;
  public location!: string;
  public status!: EquipmentStatus;
  public description!: string;
  public lastInspectionDate!: Date | null;
  public nextInspectionDate!: Date | null;
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
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '设备名称',
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '设备编码',
    },
    categoryId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '分类ID',
    },
    departmentId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '所属部门ID',
    },
    specification: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: '规格',
    },
    model: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '型号',
    },
    manufacturer: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '制造商',
    },
    purchaseDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '采购日期',
    },
    warrantyPeriod: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '保修期限(月)',
    },
    location: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: '存放位置',
    },
    status: {
      type: DataTypes.ENUM(...Object.values(EquipmentStatus)),
      allowNull: false,
      defaultValue: EquipmentStatus.NORMAL,
      comment: '设备状态',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '设备描述',
    },
    lastInspectionDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '上次巡检日期',
    },
    nextInspectionDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '下次巡检日期',
    },
  },
  {
    sequelize,
    tableName: 'equipment',
    modelName: 'Equipment',
    timestamps: true,
    indexes: [
      { fields: ['categoryId'] },
      { fields: ['departmentId'] },
      { fields: ['status'] },
    ],
  }
);

export default Equipment;
