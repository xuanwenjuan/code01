import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import WorkOrder from './WorkOrder';
import User from './User';
import Cleaner from './Cleaner';

interface WorkOrderLogAttributes {
  id: number;
  workOrderId: number;
  action: string;
  oldStatus?: string;
  newStatus: string;
  operatorId?: number;
  cleanerId?: number;
  remark?: string;
}

class WorkOrderLog extends Model<WorkOrderLogAttributes> implements WorkOrderLogAttributes {
  public id!: number;
  public workOrderId!: number;
  public action!: string;
  public oldStatus?: string;
  public newStatus!: string;
  public operatorId?: number;
  public cleanerId?: number;
  public remark?: string;
  public readonly createdAt!: Date;
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
      references: {
        model: WorkOrder,
        key: 'id'
      }
    },
    action: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    oldStatus: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    newStatus: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    operatorId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: User,
        key: 'id'
      }
    },
    cleanerId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Cleaner,
        key: 'id'
      }
    },
    remark: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'WorkOrderLog',
    tableName: 'work_order_logs',
    timestamps: true,
    updatedAt: false
  }
);

WorkOrderLog.belongsTo(WorkOrder, { foreignKey: 'workOrderId', as: 'workOrder' });
WorkOrderLog.belongsTo(User, { foreignKey: 'operatorId', as: 'operator' });
WorkOrderLog.belongsTo(Cleaner, { foreignKey: 'cleanerId', as: 'cleaner' });

export default WorkOrderLog;