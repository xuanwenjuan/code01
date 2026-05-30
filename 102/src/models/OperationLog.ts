import { DataTypes, Model } from 'sequelize';
import sequelize from '../database';

export interface OperationLogAttributes {
  id?: number;
  userId?: number;
  username?: string;
  module: string;
  operation: string;
  method: string;
  path: string;
  ip?: string;
  params?: string;
  query?: string;
  body?: string;
  success: boolean;
  duration?: number;
  createdAt?: Date;
}

class OperationLog extends Model<OperationLogAttributes> implements OperationLogAttributes {
  public id!: number;
  public userId?: number;
  public username?: string;
  public module!: string;
  public operation!: string;
  public method!: string;
  public path!: string;
  public ip?: string;
  public params?: string;
  public query?: string;
  public body?: string;
  public success!: boolean;
  public duration?: number;
  public readonly createdAt!: Date;
}

OperationLog.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      comment: '用户ID',
    },
    username: {
      type: DataTypes.STRING(50),
      comment: '用户名',
    },
    module: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '模块',
    },
    operation: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '操作',
    },
    method: {
      type: DataTypes.STRING(10),
      allowNull: false,
      comment: '请求方法',
    },
    path: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: '请求路径',
    },
    ip: {
      type: DataTypes.STRING(50),
      comment: 'IP地址',
    },
    params: {
      type: DataTypes.TEXT,
      comment: '路径参数',
    },
    query: {
      type: DataTypes.TEXT,
      comment: '查询参数',
    },
    body: {
      type: DataTypes.TEXT,
      comment: '请求体',
    },
    success: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: '是否成功',
    },
    duration: {
      type: DataTypes.INTEGER,
      comment: '耗时(ms)',
    },
  },
  {
    sequelize,
    modelName: 'OperationLog',
    tableName: 'operation_logs',
    updatedAt: false,
    indexes: [
      { fields: ['userId'] },
      { fields: ['module'] },
      { fields: ['createdAt'] },
    ],
  }
);

export default OperationLog;
