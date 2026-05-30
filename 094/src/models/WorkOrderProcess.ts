import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import WorkOrder from './WorkOrder';
import User from './User';

export const PROCESS_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

export type ProcessStatusType = typeof PROCESS_STATUS[keyof typeof PROCESS_STATUS];

interface WorkOrderProcessAttributes {
  id: number;
  workOrderId: number;
  processName: string;
  processOrder: number;
  status: ProcessStatusType;
  startedAt?: Date;
  completedAt?: Date;
  inspectorId?: number;
  inspectionResult?: string;
  inspectionRemark?: string;
  inspectedAt?: Date;
  remark?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface WorkOrderProcessCreationAttributes extends Optional<WorkOrderProcessAttributes, 'id' | 'createdAt' | 'updatedAt' | 'status'> {}

class WorkOrderProcess extends Model<WorkOrderProcessAttributes, WorkOrderProcessCreationAttributes> implements WorkOrderProcessAttributes {
  public id!: number;
  public workOrderId!: number;
  public processName!: string;
  public processOrder!: number;
  public status!: ProcessStatusType;
  public startedAt?: Date;
  public completedAt?: Date;
  public inspectorId?: number;
  public inspectionResult?: string;
  public inspectionRemark?: string;
  public inspectedAt?: Date;
  public remark?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public readonly workOrder?: WorkOrder;
  public readonly inspector?: User;
}

WorkOrderProcess.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    workOrderId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '工单ID',
      references: {
        model: 'work_orders',
        key: 'id',
      },
    },
    processName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '工序名称',
    },
    processOrder: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '工序顺序',
    },
    status: {
      type: DataTypes.ENUM(...Object.values(PROCESS_STATUS)),
      allowNull: false,
      defaultValue: PROCESS_STATUS.PENDING,
      comment: '工序状态',
    },
    startedAt: {
      type: DataTypes.DATE,
      comment: '开始时间',
    },
    completedAt: {
      type: DataTypes.DATE,
      comment: '完成时间',
    },
    inspectorId: {
      type: DataTypes.INTEGER.UNSIGNED,
      comment: '质检员ID',
      references: {
        model: 'users',
        key: 'id',
      },
    },
    inspectionResult: {
      type: DataTypes.STRING(50),
      comment: '质检结果',
    },
    inspectionRemark: {
      type: DataTypes.TEXT,
      comment: '质检备注',
    },
    inspectedAt: {
      type: DataTypes.DATE,
      comment: '质检时间',
    },
    remark: {
      type: DataTypes.TEXT,
      comment: '备注',
    },
  },
  {
    sequelize,
    tableName: 'work_order_processes',
    modelName: 'WorkOrderProcess',
    timestamps: true,
    indexes: [
      { fields: ['workOrderId'] },
      { fields: ['status'] },
      { fields: ['processOrder'] },
    ],
  }
);

WorkOrderProcess.belongsTo(WorkOrder, {
  as: 'workOrder',
  foreignKey: 'workOrderId',
});

WorkOrder.hasMany(WorkOrderProcess, {
  as: 'processes',
  foreignKey: 'workOrderId',
});

WorkOrderProcess.belongsTo(User, {
  as: 'inspector',
  foreignKey: 'inspectorId',
});

export default WorkOrderProcess;
