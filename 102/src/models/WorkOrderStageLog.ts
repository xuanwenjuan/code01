import { DataTypes, Model } from 'sequelize';
import sequelize from '../database';
import { WorkOrderStage, WorkOrderStatus } from '../constants';
import WorkOrder from './WorkOrder';
import User from './User';

export interface WorkOrderStageLogAttributes {
  id?: number;
  workOrderId: number;
  stage: WorkOrderStage;
  status: WorkOrderStatus;
  startedAt?: Date;
  completedAt?: Date;
  operatedBy?: number;
  quantity?: number;
  temperature?: string;
  duration?: number;
  notes?: string;
  createdAt?: Date;
}

class WorkOrderStageLog extends Model<WorkOrderStageLogAttributes> implements WorkOrderStageLogAttributes {
  public id!: number;
  public workOrderId!: number;
  public stage!: WorkOrderStage;
  public status!: WorkOrderStatus;
  public startedAt?: Date;
  public completedAt?: Date;
  public operatedBy?: number;
  public quantity?: number;
  public temperature?: string;
  public duration?: number;
  public notes?: string;
  public readonly createdAt!: Date;

  public readonly workOrder?: WorkOrder;
  public readonly operator?: User;
}

WorkOrderStageLog.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    workOrderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '工单ID',
    },
    stage: {
      type: DataTypes.ENUM(...Object.values(WorkOrderStage)),
      allowNull: false,
      comment: '阶段',
    },
    status: {
      type: DataTypes.ENUM(...Object.values(WorkOrderStatus)),
      allowNull: false,
      comment: '状态',
    },
    startedAt: {
      type: DataTypes.DATE,
      comment: '开始时间',
    },
    completedAt: {
      type: DataTypes.DATE,
      comment: '完成时间',
    },
    operatedBy: {
      type: DataTypes.INTEGER,
      comment: '操作人ID',
    },
    quantity: {
      type: DataTypes.DECIMAL(10, 2),
      comment: '数量',
    },
    temperature: {
      type: DataTypes.STRING(50),
      comment: '温度',
    },
    duration: {
      type: DataTypes.INTEGER,
      comment: '持续时间(天)',
    },
    notes: {
      type: DataTypes.TEXT,
      comment: '备注',
    },
  },
  {
    sequelize,
    modelName: 'WorkOrderStageLog',
    tableName: 'work_order_stage_logs',
    updatedAt: false,
    indexes: [
      { fields: ['workOrderId'] },
      { fields: ['stage'] },
    ],
  }
);

WorkOrderStageLog.belongsTo(WorkOrder, {
  foreignKey: 'workOrderId',
  as: 'workOrder',
});

WorkOrder.hasMany(WorkOrderStageLog, {
  foreignKey: 'workOrderId',
  as: 'stages',
});

WorkOrderStageLog.belongsTo(User, {
  foreignKey: 'operatedBy',
  as: 'operator',
});

export default WorkOrderStageLog;
