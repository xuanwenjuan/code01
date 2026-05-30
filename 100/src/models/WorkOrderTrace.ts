import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import { WorkOrderStatus } from '../types';

class WorkOrderTrace extends Model {
  public id!: number;
  public workOrderId!: number;
  public fromStatus?: WorkOrderStatus;
  public toStatus!: WorkOrderStatus;
  public action!: string;
  public remark?: string;
  public operatorId!: number;
  public readonly createdAt!: Date;
}

WorkOrderTrace.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    workOrderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '工单ID'
    },
    fromStatus: {
      type: DataTypes.ENUM(...Object.values(WorkOrderStatus)),
      comment: '原状态'
    },
    toStatus: {
      type: DataTypes.ENUM(...Object.values(WorkOrderStatus)),
      allowNull: false,
      comment: '目标状态'
    },
    action: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '操作行为'
    },
    remark: {
      type: DataTypes.TEXT,
      comment: '备注'
    },
    operatorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '操作人ID'
    }
  },
  {
    sequelize,
    modelName: 'WorkOrderTrace',
    tableName: 'work_order_traces',
    comment: '工单流程追溯表',
    timestamps: true,
    updatedAt: false
  }
);

export default WorkOrderTrace;
