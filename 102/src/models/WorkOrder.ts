import { DataTypes, Model } from 'sequelize';
import sequelize from '../database';
import { WorkOrderStatus, WorkOrderStage } from '../constants';
import Wine from './Wine';
import User from './User';
import WorkOrderStageLog from './WorkOrderStageLog';
import WorkOrderMaterial from './WorkOrderMaterial';

export interface WorkOrderAttributes {
  id?: number;
  orderNo: string;
  wineId: number;
  name: string;
  currentStage: WorkOrderStage;
  status: WorkOrderStatus;
  targetQuantity: number;
  actualQuantity?: number;
  assignedTo?: number;
  startDate?: Date;
  estimatedEndDate?: Date;
  actualEndDate?: Date;
  isOverdue?: boolean;
  remarks?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

class WorkOrder extends Model<WorkOrderAttributes> implements WorkOrderAttributes {
  public id!: number;
  public orderNo!: string;
  public wineId!: number;
  public name!: string;
  public currentStage!: WorkOrderStage;
  public status!: WorkOrderStatus;
  public targetQuantity!: number;
  public actualQuantity?: number;
  public assignedTo?: number;
  public startDate?: Date;
  public estimatedEndDate?: Date;
  public actualEndDate?: Date;
  public isOverdue!: boolean;
  public remarks?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public readonly wine?: Wine;
  public readonly assignee?: User;
  public readonly stages?: WorkOrderStageLog[];
  public readonly materials?: WorkOrderMaterial[];
}

WorkOrder.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    orderNo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '工单号',
    },
    wineId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '酒品ID',
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: '工单名称',
    },
    currentStage: {
      type: DataTypes.ENUM(...Object.values(WorkOrderStage)),
      allowNull: false,
      comment: '当前阶段',
    },
    status: {
      type: DataTypes.ENUM(...Object.values(WorkOrderStatus)),
      allowNull: false,
      defaultValue: WorkOrderStatus.PENDING,
      comment: '状态',
    },
    targetQuantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '目标数量(升)',
    },
    actualQuantity: {
      type: DataTypes.DECIMAL(10, 2),
      comment: '实际数量(升)',
    },
    assignedTo: {
      type: DataTypes.INTEGER,
      comment: '负责人ID',
    },
    startDate: {
      type: DataTypes.DATE,
      comment: '开始日期',
    },
    estimatedEndDate: {
      type: DataTypes.DATE,
      comment: '预计结束日期',
    },
    actualEndDate: {
      type: DataTypes.DATE,
      comment: '实际结束日期',
    },
    isOverdue: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: '是否逾期',
    },
    remarks: {
      type: DataTypes.TEXT,
      comment: '备注',
    },
  },
  {
    sequelize,
    modelName: 'WorkOrder',
    tableName: 'work_orders',
    indexes: [
      { fields: ['orderNo'], unique: true },
      { fields: ['wineId'] },
      { fields: ['status'] },
      { fields: ['assignedTo'] },
    ],
  }
);

WorkOrder.belongsTo(Wine, {
  foreignKey: 'wineId',
  as: 'wine',
});

Wine.hasMany(WorkOrder, {
  foreignKey: 'wineId',
  as: 'workOrders',
});

WorkOrder.belongsTo(User, {
  foreignKey: 'assignedTo',
  as: 'assignee',
});

User.hasMany(WorkOrder, {
  foreignKey: 'assignedTo',
  as: 'assignedWorkOrders',
});

export default WorkOrder;
