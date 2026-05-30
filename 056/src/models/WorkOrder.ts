import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import { WorkOrderStatus } from '../types';

class WorkOrder extends Model {
  public id!: number;
  public orderNo!: string;
  public title!: string;
  public equipmentId!: number;
  public type!: 'repair' | 'maintenance' | 'emergency';
  public priority!: 'low' | 'medium' | 'high' | 'urgent';
  public status!: WorkOrderStatus;
  public description!: string;
  public faultDescription!: string | null;
  public reportedBy!: number;
  public reportedAt!: Date;
  public assignedTo!: number | null;
  public assignedAt!: Date | null;
  public startedAt!: Date | null;
  public completedAt!: Date | null;
  public acceptedAt!: Date | null;
  public closedAt!: Date | null;
  public maintenanceContent!: string | null;
  public maintenanceResult!: string | null;
  public partsUsed!: string | null;
  public laborHours!: number | null;
  public acceptedBy!: number | null;
  public acceptedRemark!: string | null;
  public closedBy!: number | null;
  public closedRemark!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

WorkOrder.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    orderNo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '工单编号',
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: '工单标题',
    },
    equipmentId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '设备ID',
    },
    type: {
      type: DataTypes.ENUM('repair', 'maintenance', 'emergency'),
      allowNull: false,
      defaultValue: 'repair',
      comment: '工单类型',
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
      allowNull: false,
      defaultValue: 'medium',
      comment: '优先级',
    },
    status: {
      type: DataTypes.ENUM(...Object.values(WorkOrderStatus)),
      allowNull: false,
      defaultValue: WorkOrderStatus.PENDING,
      comment: '工单状态',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '工单描述',
    },
    faultDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '故障描述',
    },
    reportedBy: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '上报人ID',
    },
    reportedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: '上报时间',
    },
    assignedTo: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: '指派维修人员ID',
    },
    assignedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '指派时间',
    },
    startedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '开始维修时间',
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '完成维修时间',
    },
    acceptedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '验收时间',
    },
    closedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '关闭时间',
    },
    maintenanceContent: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '维修内容',
    },
    maintenanceResult: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '维修结果',
    },
    partsUsed: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '使用配件(JSON格式)',
    },
    laborHours: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      comment: '工时',
    },
    acceptedBy: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: '验收人ID',
    },
    acceptedRemark: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '验收备注',
    },
    closedBy: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: '关闭人ID',
    },
    closedRemark: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '关闭备注',
    },
  },
  {
    sequelize,
    tableName: 'work_orders',
    modelName: 'WorkOrder',
    timestamps: true,
    indexes: [
      { fields: ['equipmentId'] },
      { fields: ['status'] },
      { fields: ['type'] },
      { fields: ['priority'] },
      { fields: ['reportedBy'] },
      { fields: ['assignedTo'] },
    ],
  }
);

export default WorkOrder;
