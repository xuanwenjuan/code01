import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { WorkOrderStatus } from '../types';

interface WorkOrderLogAttributes {
  id: number;
  workOrderId: number;
  operatorId: number;
  action: string;
  oldStatus?: WorkOrderStatus;
  newStatus?: WorkOrderStatus;
  remarks?: string;
}

interface WorkOrderLogCreationAttributes extends Optional<WorkOrderLogAttributes, 'id'> {}

class WorkOrderLog extends Model<WorkOrderLogAttributes, WorkOrderLogCreationAttributes> implements WorkOrderLogAttributes {
  public id!: number;
  public workOrderId!: number;
  public operatorId!: number;
  public action!: string;
  public oldStatus?: WorkOrderStatus;
  public newStatus?: WorkOrderStatus;
  public remarks?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

WorkOrderLog.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    workOrderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'work_order_id'
    },
    operatorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'operator_id'
    },
    action: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    oldStatus: {
      type: DataTypes.ENUM(...Object.values(WorkOrderStatus)),
      allowNull: true,
      field: 'old_status'
    },
    newStatus: {
      type: DataTypes.ENUM(...Object.values(WorkOrderStatus)),
      allowNull: true,
      field: 'new_status'
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'WorkOrderLog',
    tableName: 'work_order_logs',
    timestamps: true
  }
);

export default WorkOrderLog;
