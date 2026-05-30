import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './User';

export interface OperationLogAttributes {
  id: number;
  userId?: number;
  username?: string;
  module: string;
  operation: string;
  method: string;
  path: string;
  params?: string;
  query?: string;
  body?: string;
  statusCode: number;
  duration: string;
  ip?: string;
}

export interface OperationLogCreationAttributes extends Optional<OperationLogAttributes, 'id'> {}

class OperationLog extends Model<OperationLogAttributes, OperationLogCreationAttributes>
  implements OperationLogAttributes {
  public id!: number;
  public userId?: number;
  public username?: string;
  public module!: string;
  public operation!: string;
  public method!: string;
  public path!: string;
  public params?: string;
  public query?: string;
  public body?: string;
  public statusCode!: number;
  public duration!: string;
  public ip?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

OperationLog.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
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
      type: DataTypes.STRING(10),
      allowNull: false,
      comment: '请求方法'
    },
    path: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: '请求路径'
    },
    params: {
      type: DataTypes.TEXT,
      comment: '路径参数'
    },
    query: {
      type: DataTypes.TEXT,
      comment: '查询参数'
    },
    body: {
      type: DataTypes.TEXT,
      comment: '请求体'
    },
    statusCode: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '响应状态码'
    },
    duration: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: '耗时'
    },
    ip: {
      type: DataTypes.STRING(50),
      comment: 'IP地址'
    }
  },
  {
    sequelize,
    tableName: 'operation_logs',
    modelName: 'OperationLog'
  }
);

OperationLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(OperationLog, { foreignKey: 'userId' });

export default OperationLog;
