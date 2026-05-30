import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

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
  body?: string;
  response?: string;
  statusCode?: number;
  duration?: number;
  success: boolean;
  errorMessage?: string;
  createdAt?: Date;
}

interface OperationLogCreationAttributes extends Optional<OperationLogAttributes, 'id'> {}

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
  public body?: string;
  public response?: string;
  public statusCode?: number;
  public duration?: number;
  public success!: boolean;
  public errorMessage?: string;
  public readonly createdAt!: Date;
}

OperationLog.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    userId: {
      type: DataTypes.INTEGER,
      comment: '用户ID'
    },
    username: {
      type: DataTypes.STRING(50),
      comment: '用户名'
    },
    module: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '模块'
    },
    operation: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '操作'
    },
    method: {
      type: DataTypes.STRING(10),
      allowNull: false,
      comment: 'HTTP方法'
    },
    url: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: '请求URL'
    },
    ip: {
      type: DataTypes.STRING(50),
      comment: 'IP地址'
    },
    params: {
      type: DataTypes.TEXT,
      comment: '请求参数'
    },
    body: {
      type: DataTypes.TEXT,
      comment: '请求体'
    },
    response: {
      type: DataTypes.TEXT,
      comment: '响应内容'
    },
    statusCode: {
      type: DataTypes.INTEGER,
      comment: '状态码'
    },
    duration: {
      type: DataTypes.INTEGER,
      comment: '耗时(ms)'
    },
    success: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: '是否成功'
    },
    errorMessage: {
      type: DataTypes.TEXT,
      comment: '错误信息'
    }
  },
  {
    sequelize,
    tableName: 'operation_logs',
    modelName: 'OperationLog',
    timestamps: true,
    updatedAt: false
  }
);

export default OperationLog;
