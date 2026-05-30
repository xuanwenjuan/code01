import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface OperationLogAttributes {
  id: number;
  userId?: number;
  username?: string;
  module: string;
  operation: string;
  method: string;
  params?: string;
  ip?: string;
  status: boolean;
  errorMsg?: string;
  duration: number;
}

interface OperationLogCreationAttributes extends Optional<OperationLogAttributes, 'id' | 'userId' | 'username' | 'params' | 'ip' | 'errorMsg'> {}

class OperationLog extends Model<OperationLogAttributes, OperationLogCreationAttributes> implements OperationLogAttributes {
  public id!: number;
  public userId?: number;
  public username?: string;
  public module!: string;
  public operation!: string;
  public method!: string;
  public params?: string;
  public ip?: string;
  public status!: boolean;
  public errorMsg?: string;
  public duration!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

OperationLog.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      comment: '日志ID'
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      comment: '用户ID'
    },
    username: {
      type: DataTypes.STRING(50),
      comment: '用户名'
    },
    module: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '模块名称'
    },
    operation: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '操作名称'
    },
    method: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: '请求方法'
    },
    params: {
      type: DataTypes.TEXT,
      comment: '请求参数'
    },
    ip: {
      type: DataTypes.STRING(50),
      comment: 'IP地址'
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: '操作状态'
    },
    errorMsg: {
      type: DataTypes.TEXT,
      comment: '错误信息'
    },
    duration: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: '耗时(ms)'
    }
  },
  {
    sequelize,
    tableName: 'operation_logs',
    modelName: 'OperationLog',
    comment: '操作日志表'
  }
);

export default OperationLog;
