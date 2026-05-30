import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import { WorkOrderType, WorkOrderStatus } from '../constants/enum';

export interface WorkOrderAttributes {
  id?: number;
  orderNo: string;
  type: WorkOrderType;
  title: string;
  description?: string;
  status: WorkOrderStatus;
  pigeonIds?: string;
  pigeonCount?: number;
  location?: string;
  distance?: number;
  planDate?: Date;
  actualStartDate?: Date;
  actualEndDate?: Date;
  raceName?: string;
  returnCount?: number;
  results?: string;
  confirmedById?: number;
  confirmedAt?: Date;
  createdById?: number;
  remarks?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

class WorkOrder extends Model<WorkOrderAttributes> implements WorkOrderAttributes {
  public id!: number;
  public orderNo!: string;
  public type!: WorkOrderType;
  public title!: string;
  public description?: string;
  public status!: WorkOrderStatus;
  public pigeonIds?: string;
  public pigeonCount?: number;
  public location?: string;
  public distance?: number;
  public planDate?: Date;
  public actualStartDate?: Date;
  public actualEndDate?: Date;
  public raceName?: string;
  public returnCount?: number;
  public results?: string;
  public confirmedById?: number;
  public confirmedAt?: Date;
  public createdById?: number;
  public remarks?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

WorkOrder.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    orderNo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
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
    status: {
      type: DataTypes.ENUM(...Object.values(WorkOrderStatus)),
      allowNull: false,
      defaultValue: WorkOrderStatus.PENDING
    },
    pigeonIds: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    pigeonCount: {
      type: DataTypes.INTEGER.UNSIGNED,
      defaultValue: 0
    },
    location: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    distance: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    planDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    actualStartDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    actualEndDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    raceName: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    returnCount: {
      type: DataTypes.INTEGER.UNSIGNED,
      defaultValue: 0
    },
    results: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    confirmedById: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    confirmedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    createdById: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: 'work_orders',
    modelName: 'WorkOrder',
    timestamps: true
  }
);

export default WorkOrder;
