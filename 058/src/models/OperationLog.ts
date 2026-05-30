import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { OperationType } from '../types';

interface OperationLogAttributes {
  id: number;
  operatorId?: number;
  operatorName?: string;
  operationType: OperationType;
  module: string;
  recordId?: number;
  beforeData?: string;
  afterData?: string;
  remark?: string;
  ip?: string;
  userAgent?: string;
  createdAt: Date;
}

interface OperationLogCreationAttributes extends Optional<OperationLogAttributes, 'id' | 'createdAt'> {}

class OperationLog extends Model<OperationLogAttributes, OperationLogCreationAttributes> implements OperationLogAttributes {
  public id!: number;
  public operatorId?: number;
  public operatorName?: string;
  public operationType!: OperationType;
  public module!: string;
  public recordId?: number;
  public beforeData?: string;
  public afterData?: string;
  public remark?: string;
  public ip?: string;
  public userAgent?: string;
  public readonly createdAt!: Date;
}

OperationLog.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    operatorId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    operatorName: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    operationType: {
      type: DataTypes.ENUM(...Object.values(OperationType)),
      allowNull: false
    },
    module: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    recordId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    beforeData: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    afterData: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    remark: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    ip: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    userAgent: {
      type: DataTypes.STRING(500),
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: 'operation_log',
    modelName: 'OperationLog',
    timestamps: true,
    updatedAt: false
  }
);

export default OperationLog;
