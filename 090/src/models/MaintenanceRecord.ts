import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { MaintenanceStatus } from '../types';

interface MaintenanceRecordAttributes {
  id: number;
  recordNo: string;
  equipmentId: number;
  storeId: number;
  type: string;
  description: string;
  cost?: number;
  startDate: Date;
  endDate?: Date;
  status: MaintenanceStatus;
  handledBy?: number;
  createdBy: number;
  remark?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface MaintenanceRecordCreationAttributes extends Optional<MaintenanceRecordAttributes, 'id' | 'createdAt' | 'updatedAt' | 'cost' | 'endDate' | 'handledBy' | 'remark'> {}

class MaintenanceRecord extends Model<MaintenanceRecordAttributes, MaintenanceRecordCreationAttributes> implements MaintenanceRecordAttributes {
  public id!: number;
  public recordNo!: string;
  public equipmentId!: number;
  public storeId!: number;
  public type!: string;
  public description!: string;
  public cost?: number;
  public startDate!: Date;
  public endDate?: Date;
  public status!: MaintenanceStatus;
  public handledBy?: number;
  public createdBy!: number;
  public remark?: string;
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
    recordNo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '记录编号'
    },
    equipmentId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '装备ID'
    },
    storeId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '门店ID'
    },
    type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '维保类型：常规检测/维修保养/年检'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: '维保描述'
    },
    cost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: '维保费用'
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: '开始日期'
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '完成日期'
    },
    status: {
      type: DataTypes.ENUM(...Object.values(MaintenanceStatus)),
      allowNull: false,
      defaultValue: MaintenanceStatus.PENDING,
      comment: '状态'
    },
    handledBy: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: '处理人ID'
    },
    createdBy: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '创建人ID'
    },
    remark: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '备注'
    }
  },
  {
    sequelize,
    tableName: 'maintenance_records',
    modelName: 'MaintenanceRecord',
    timestamps: true
  }
);

export default MaintenanceRecord;
