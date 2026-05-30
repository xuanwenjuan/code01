import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import User from './User';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  ASSIGN = 'assign',
  ACCEPT = 'accept',
  START = 'start',
  COMPLETE = 'complete',
  REVIEW = 'review',
  CANCEL = 'cancel',
  CALCULATE = 'calculate',
  SUSPEND = 'suspend',
  ACTIVATE = 'activate'
}

export enum OperationModule {
  AREA = 'area',
  CLEANER = 'cleaner',
  WORK_ORDER = 'work_order',
  PERFORMANCE = 'performance',
  USER = 'user'
}

interface OperationLogAttributes {
  id: number;
  module: OperationModule;
  operationType: OperationType;
  recordId: number;
  recordName?: string;
  operatorId: number;
  operatorName: string;
  oldValue?: string;
  newValue?: string;
  description: string;
  ipAddress?: string;
  userAgent?: string;
}

class OperationLog extends Model<OperationLogAttributes> implements OperationLogAttributes {
  public id!: number;
  public module!: OperationModule;
  public operationType!: OperationType;
  public recordId!: number;
  public recordName?: string;
  public operatorId!: number;
  public operatorName!: string;
  public oldValue?: string;
  public newValue?: string;
  public description!: string;
  public ipAddress?: string;
  public userAgent?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

OperationLog.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    module: {
      type: DataTypes.ENUM(...Object.values(OperationModule)),
      allowNull: false
    },
    operationType: {
      type: DataTypes.ENUM(...Object.values(OperationType)),
      allowNull: false
    },
    recordId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    recordName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    operatorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id'
      }
    },
    operatorName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    oldValue: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    newValue: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    ipAddress: {
      type: DataTypes.STRING,
      allowNull: true
    },
    userAgent: {
      type: DataTypes.STRING,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'OperationLog',
    tableName: 'operation_logs',
    timestamps: true,
    indexes: [
      { fields: ['module'] },
      { fields: ['operationType'] },
      { fields: ['recordId'] },
      { fields: ['operatorId'] },
      { fields: ['createdAt'] }
    ]
  }
);

OperationLog.belongsTo(User, { foreignKey: 'operatorId', as: 'operator' });

export default OperationLog;
