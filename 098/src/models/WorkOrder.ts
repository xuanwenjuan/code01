import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { WorkOrderStatus, WorkOrderType } from '../types';

interface WorkOrderAttributes {
  id: number;
  orderNo: string;
  type: WorkOrderType;
  title: string;
  description?: string;
  plantId?: number;
  areaId: number;
  assignedTo?: number;
  status: WorkOrderStatus;
  priority: number;
  dueDate?: Date;
  actualStartDate?: Date;
  actualCompleteDate?: Date;
  checkInLocation?: string;
  checkInTime?: Date;
  completionReport?: string;
  verifiedBy?: number;
  verifiedAt?: Date;
  createdBy: number;
}

interface WorkOrderCreationAttributes extends Optional<WorkOrderAttributes, 'id' | 'status' | 'priority'> {}

class WorkOrder extends Model<WorkOrderAttributes, WorkOrderCreationAttributes> implements WorkOrderAttributes {
  public id!: number;
  public orderNo!: string;
  public type!: WorkOrderType;
  public title!: string;
  public description?: string;
  public plantId?: number;
  public areaId!: number;
  public assignedTo?: number;
  public status!: WorkOrderStatus;
  public priority!: number;
  public dueDate?: Date;
  public actualStartDate?: Date;
  public actualCompleteDate?: Date;
  public checkInLocation?: string;
  public checkInTime?: Date;
  public completionReport?: string;
  public verifiedBy?: number;
  public verifiedAt?: Date;
  public createdBy!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

WorkOrder.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    orderNo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      field: 'order_no'
    },
    type: {
      type: DataTypes.ENUM(...Object.values(WorkOrderType)),
      allowNull: false
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    plantId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'plant_id'
    },
    areaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'area_id'
    },
    assignedTo: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'assigned_to'
    },
    status: {
      type: DataTypes.ENUM(...Object.values(WorkOrderStatus)),
      allowNull: false,
      defaultValue: WorkOrderStatus.PENDING
    },
    priority: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'due_date'
    },
    actualStartDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'actual_start_date'
    },
    actualCompleteDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'actual_complete_date'
    },
    checkInLocation: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'check_in_location'
    },
    checkInTime: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'check_in_time'
    },
    completionReport: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'completion_report'
    },
    verifiedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'verified_by'
    },
    verifiedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'verified_at'
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'created_by'
    }
  },
  {
    sequelize,
    modelName: 'WorkOrder',
    tableName: 'work_orders',
    timestamps: true
  }
);

export default WorkOrder;
