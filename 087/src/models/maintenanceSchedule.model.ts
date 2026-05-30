import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import { MaintenanceScheduleAttributes } from '../types';

class MaintenanceSchedule extends Model<MaintenanceScheduleAttributes> implements MaintenanceScheduleAttributes {
  public id!: number;
  public scheduleDate!: Date;
  public userId!: number;
  public workOrderId?: number;
  public siteId?: number;
  public isLocked!: boolean;
  public lockedBy?: number;
  public lockedAt?: Date;
  public remark?: string;
  public createdBy?: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

MaintenanceSchedule.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    scheduleDate: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: '排期日期'
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '用户ID'
    },
    workOrderId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: '工单ID'
    },
    siteId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: '站点ID'
    },
    isLocked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: '是否锁定'
    },
    lockedBy: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: '锁定人'
    },
    lockedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '锁定时间'
    },
    remark: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '备注'
    },
    createdBy: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: '创建人'
    }
  },
  {
    sequelize,
    tableName: 'maintenance_schedules',
    modelName: 'MaintenanceSchedule',
    indexes: [
      { fields: ['scheduleDate', 'userId'], unique: true },
      { fields: ['workOrderId'] }
    ]
  }
);

export default MaintenanceSchedule;
