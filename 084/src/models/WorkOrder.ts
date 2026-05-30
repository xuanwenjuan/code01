import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import Cleaner from './Cleaner';
import WorkArea from './WorkArea';
import User from './User';

export enum WorkOrderStatus {
  PENDING = 'pending',
  ASSIGNED = 'assigned',
  ACCEPTED = 'accepted',
  IN_PROGRESS = 'in_progress',
  REPORTED = 'reported',
  COMPLETED = 'completed',
  REVIEWED = 'reviewed',
  REASSIGNED = 'reassigned',
  CANCELLED = 'cancelled'
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

interface WorkOrderAttributes {
  id: number;
  orderNo: string;
  title: string;
  description?: string;
  workAreaId: number;
  assignedTo?: number;
  assignedBy: number;
  status: WorkOrderStatus;
  priority: Priority;
  scheduledDate: Date;
  scheduledTime: Date;
  deadlineTime: Date;
  scheduleLocked: boolean;
  acceptedTime?: Date;
  startTime?: Date;
  reportTime?: Date;
  reportContent?: string;
  completedTime?: Date;
  reviewedTime?: Date;
  reviewedBy?: number;
  reviewComment?: string;
  reassignCount: number;
  autoReassign: boolean;
  completionNote?: string;
  cancelReason?: string;
}

class WorkOrder extends Model<WorkOrderAttributes> implements WorkOrderAttributes {
  public id!: number;
  public orderNo!: string;
  public title!: string;
  public description?: string;
  public workAreaId!: number;
  public assignedTo?: number;
  public assignedBy!: number;
  public status!: WorkOrderStatus;
  public priority!: Priority;
  public scheduledDate!: Date;
  public scheduledTime!: Date;
  public deadlineTime!: Date;
  public scheduleLocked!: boolean;
  public acceptedTime?: Date;
  public startTime?: Date;
  public reportTime?: Date;
  public reportContent?: string;
  public completedTime?: Date;
  public reviewedTime?: Date;
  public reviewedBy?: number;
  public reviewComment?: string;
  public reassignCount!: number;
  public autoReassign!: boolean;
  public completionNote?: string;
  public cancelReason?: string;
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
      unique: true
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    workAreaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: WorkArea,
        key: 'id'
      }
    },
    assignedTo: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Cleaner,
        key: 'id'
      }
    },
    assignedBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM(...Object.values(WorkOrderStatus)),
      allowNull: false,
      defaultValue: WorkOrderStatus.PENDING
    },
    priority: {
      type: DataTypes.ENUM(...Object.values(Priority)),
      allowNull: false,
      defaultValue: Priority.MEDIUM
    },
    scheduledDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    scheduledTime: {
      type: DataTypes.DATE,
      allowNull: false
    },
    deadlineTime: {
      type: DataTypes.DATE,
      allowNull: false
    },
    scheduleLocked: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    acceptedTime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    reportTime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    reportContent: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    completedTime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    reviewedTime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    reviewedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: User,
        key: 'id'
      }
    },
    reviewComment: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    reassignCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    autoReassign: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    completionNote: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    cancelReason: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'WorkOrder',
    tableName: 'work_orders',
    timestamps: true
  }
);

WorkOrder.belongsTo(WorkArea, { foreignKey: 'workAreaId', as: 'workArea' });
WorkOrder.belongsTo(Cleaner, { foreignKey: 'assignedTo', as: 'cleaner' });
WorkOrder.belongsTo(User, { foreignKey: 'assignedBy', as: 'assigner' });
WorkOrder.belongsTo(User, { foreignKey: 'reviewedBy', as: 'reviewer' });

export default WorkOrder;