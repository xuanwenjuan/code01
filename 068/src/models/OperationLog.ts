import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database';
import User from './User';

export interface OperationLogAttributes {
  id: number;
  userId?: number;
  username?: string;
  module: string;
  operation: string;
  method: string;
  url: string;
  ip?: string;
  params?: string;
  result?: string;
  status: number;
}

export interface OperationLogCreationAttributes extends Optional<OperationLogAttributes, 'id'> {}

class OperationLog extends Model<OperationLogAttributes, OperationLogCreationAttributes> implements OperationLogAttributes {
  public id!: number;
  public userId?: number;
  public username?: string;
  public module!: string;
  public operation!: string;
  public method!: string;
  public url!: string;
  public ip?: string;
  public params?: string;
  public result?: string;
  public status!: number;

  public readonly user?: User;
}

OperationLog.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      field: 'user_id',
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    module: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '模块名称',
    },
    operation: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '操作名称',
    },
    method: {
      type: DataTypes.STRING(10),
      allowNull: false,
      comment: '请求方法',
    },
    url: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: '请求URL',
    },
    ip: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'IP地址',
    },
    params: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '请求参数',
    },
    result: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '返回结果',
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
      comment: '1: 成功, 0: 失败',
    },
  },
  {
    sequelize,
    tableName: 'operation_logs',
  }
);

OperationLog.belongsTo(User, { as: 'user', foreignKey: 'userId' });
User.hasMany(OperationLog, { as: 'operationLogs', foreignKey: 'userId' });

export default OperationLog;
