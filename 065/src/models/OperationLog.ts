import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database';
import { OperationType, LogModule, UserRole } from '../types';

interface OperationLogAttributes {
  id: number;
  module: LogModule;
  operationType: OperationType;
  operatorId?: number;
  operatorRole?: UserRole;
  operatorName?: string;
  targetId?: number;
  targetType?: string;
  detail?: string;
  ip?: string;
  userAgent?: string;
  success: boolean;
  errorMessage?: string;
}

interface OperationLogCreationAttributes extends Optional<OperationLogAttributes, 'id'> {}

class OperationLog extends Model<OperationLogAttributes, OperationLogCreationAttributes> implements OperationLogAttributes {
  public id!: number;
  public module!: LogModule;
  public operationType!: OperationType;
  public operatorId?: number;
  public operatorRole?: UserRole;
  public operatorName?: string;
  public targetId?: number;
  public targetType?: string;
  public detail?: string;
  public ip?: string;
  public userAgent?: string;
  public success!: boolean;
  public errorMessage?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

OperationLog.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    module: {
      type: DataTypes.ENUM(...Object.values(LogModule)),
      allowNull: false,
    },
    operationType: {
      type: DataTypes.ENUM(...Object.values(OperationType)),
      allowNull: false,
    },
    operatorId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'operator_id',
    },
    operatorRole: {
      type: DataTypes.ENUM(...Object.values(UserRole)),
      allowNull: true,
      field: 'operator_role',
    },
    operatorName: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'operator_name',
    },
    targetId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'target_id',
    },
    targetType: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'target_type',
    },
    detail: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    ip: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    userAgent: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'user_agent',
    },
    success: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    errorMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'error_message',
    },
  },
  {
    sequelize,
    modelName: 'OperationLog',
    tableName: 'operation_logs',
    timestamps: true,
    indexes: [
      { fields: ['module'] },
      { fields: ['operator_id'] },
      { fields: ['target_id'] },
      { fields: ['created_at'] },
    ],
  }
);

export default OperationLog;
