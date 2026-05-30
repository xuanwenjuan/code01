import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import { InspectionStatus } from '../types';

class InspectionTask extends Model {
  public id!: number;
  public planId!: number | null;
  public equipmentId!: number;
  public inspectorId!: number | null;
  public taskNo!: string;
  public title!: string;
  public status!: InspectionStatus;
  public scheduledDate!: Date;
  public actualDate!: Date | null;
  public inspectionItems!: string;
  public inspectionResult!: string | null;
  public exceptionDescription!: string | null;
  public hasException!: boolean;
  public completedBy!: number | null;
  public completedAt!: Date | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

InspectionTask.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    planId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: '关联计划ID',
    },
    equipmentId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '设备ID',
    },
    inspectorId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: '巡检员ID',
    },
    taskNo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '任务编号',
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: '任务标题',
    },
    status: {
      type: DataTypes.ENUM(...Object.values(InspectionStatus)),
      allowNull: false,
      defaultValue: InspectionStatus.PENDING,
      comment: '任务状态',
    },
    scheduledDate: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: '计划巡检日期',
    },
    actualDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '实际巡检日期',
    },
    inspectionItems: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: '巡检项(JSON格式)',
    },
    inspectionResult: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '巡检结果(JSON格式)',
    },
    exceptionDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '异常描述',
    },
    hasException: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: '是否有异常',
    },
    completedBy: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: '完成人ID',
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '完成时间',
    },
  },
  {
    sequelize,
    tableName: 'inspection_tasks',
    modelName: 'InspectionTask',
    timestamps: true,
    indexes: [
      { fields: ['planId'] },
      { fields: ['equipmentId'] },
      { fields: ['inspectorId'] },
      { fields: ['status'] },
      { fields: ['scheduledDate'] },
    ],
  }
);

export default InspectionTask;
