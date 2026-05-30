import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { OperationType } from '../types';
import User from './User';

interface OperationLogAttributes {
  id: number;
  operatorId: number;
  operationType: OperationType;
  module: string;
  recordId: number;
  beforeData: string;
  afterData: string;
  description: string;
  ipAddress: string;
  userAgent: string;
}

interface OperationLogCreationAttributes extends Optional<OperationLogAttributes, 'id' | 'beforeData' | 'afterData' | 'ipAddress' | 'userAgent'> {}

class OperationLog extends Model<OperationLogAttributes, OperationLogCreationAttributes> implements OperationLogAttributes {
  public id!: number;
  public operatorId!: number;
  public operationType!: OperationType;
  public module!: string;
  public recordId!: number;
  public beforeData!: string;
  public afterData!: string;
  public description!: string;
  public ipAddress!: string;
  public userAgent!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public readonly operator?: User;
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
      allowNull: false,
      field: 'operator_id',
      comment: '操作员ID'
    },
    operationType: {
      type: DataTypes.ENUM(...Object.values(OperationType)),
      allowNull: false,
      comment: '操作类型'
    },
    module: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '模块名称'
    },
    recordId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'record_id',
      comment: '记录ID'
    },
    beforeData: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '操作前数据'
    },
    afterData: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '操作后数据'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: '操作描述'
    },
    ipAddress: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'IP地址'
    },
    userAgent: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: '用户代理'
    }
  },
  {
    sequelize,
    tableName: 'operation_logs',
    modelName: 'OperationLog'
  }
);

OperationLog.belongsTo(User, { as: 'operator', foreignKey: 'operatorId' });

export default OperationLog;
