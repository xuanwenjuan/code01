import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { MaintenanceType } from '../common/enums';
import Equipment from './equipment.model';
import User from './user.model';

interface MaintenanceRecordAttributes {
  id: number;
  equipmentId: number;
  type: MaintenanceType;
  cost: number;
  description: string;
  performedBy: number;
  performedAt: Date;
  nextMaintenanceDate?: Date;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface MaintenanceRecordCreationAttributes extends Optional<MaintenanceRecordAttributes, 'id' | 'createdAt' | 'updatedAt' | 'nextMaintenanceDate' | 'remarks'> {}

class MaintenanceRecord extends Model<MaintenanceRecordAttributes, MaintenanceRecordCreationAttributes> implements MaintenanceRecordAttributes {
  public id!: number;
  public equipmentId!: number;
  public type!: MaintenanceType;
  public cost!: number;
  public description!: string;
  public performedBy!: number;
  public performedAt!: Date;
  public nextMaintenanceDate?: Date;
  public remarks?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public readonly equipment?: Equipment;
  public readonly performer?: User;
}

MaintenanceRecord.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    equipmentId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '设备ID',
    },
    type: {
      type: DataTypes.ENUM(...Object.values(MaintenanceType)),
      allowNull: false,
      defaultValue: MaintenanceType.ROUTINE,
      comment: '维保类型',
    },
    cost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      comment: '费用',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: '维保描述',
    },
    performedBy: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '执行人',
    },
    performedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: '执行时间',
    },
    nextMaintenanceDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '下次维保日期',
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '备注',
    },
  },
  {
    sequelize,
    tableName: 'maintenance_records',
    comment: '维保记录表',
  }
);

MaintenanceRecord.belongsTo(Equipment, { as: 'equipment', foreignKey: 'equipmentId' });
Equipment.hasMany(MaintenanceRecord, { as: 'maintenanceRecords', foreignKey: 'equipmentId' });
MaintenanceRecord.belongsTo(User, { as: 'performer', foreignKey: 'performedBy' });
User.hasMany(MaintenanceRecord, { as: 'maintenanceRecords', foreignKey: 'performedBy' });

export default MaintenanceRecord;