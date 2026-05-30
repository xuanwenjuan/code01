import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import User from './User';

export interface IOperationLogAttributes {
  id?: number;
  userId?: number;
  username?: string;
  module: string;
  operation: string;
  method: string;
  url?: string;
  ip?: string;
  userAgent?: string;
  params?: any;
  result?: any;
  status: boolean;
  errorMessage?: string;
  duration?: number;
  createdAt?: Date;
}

class OperationLog extends Model<IOperationLogAttributes> implements IOperationLogAttributes {
  public id!: number;
  public userId?: number;
  public username?: string;
  public module!: string;
  public operation!: string;
  public method!: string;
  public url?: string;
  public ip?: string;
  public userAgent?: string;
  public params?: any;
  public result?: any;
  public status!: boolean;
  public errorMessage?: string;
  public duration?: number;
  public readonly createdAt!: Date;
}

OperationLog.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: '操作人ID',
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '操作人用户名',
    },
    module: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '模块名称',
    },
    operation: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '操作类型',
    },
    method: {
      type: DataTypes.STRING(10),
      allowNull: false,
      comment: '请求方法',
    },
    url: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '请求URL',
    },
    ip: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'IP地址',
    },
    userAgent: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '用户代理',
    },
    params: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '请求参数',
    },
    result: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '返回结果',
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: '操作状态',
    },
    errorMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '错误信息',
    },
    duration: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: '耗时(ms)',
    },
  },
  {
    sequelize,
    tableName: 'operation_logs',
    modelName: 'OperationLog',
    timestamps: true,
    updatedAt: false,
    indexes: [
      { fields: ['userId'] },
      { fields: ['module'] },
      { fields: ['createdAt'] },
    ],
  }
);

export default OperationLog;
