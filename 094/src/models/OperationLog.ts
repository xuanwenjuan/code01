import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './User';

interface OperationLogAttributes {
  id: number;
  userId?: number;
  username?: string;
  operation: string;
  module: string;
  action: string;
  ip?: string;
  userAgent?: string;
  requestMethod?: string;
  requestUrl?: string;
  requestParams?: string;
  responseData?: string;
  status: boolean;
  errorMessage?: string;
  duration?: number;
  createdAt: Date;
}

interface OperationLogCreationAttributes extends Optional<OperationLogAttributes, 'id' | 'createdAt'> {}

class OperationLog extends Model<OperationLogAttributes, OperationLogCreationAttributes> implements OperationLogAttributes {
  public id!: number;
  public userId?: number;
  public username?: string;
  public operation!: string;
  public module!: string;
  public action!: string;
  public ip?: string;
  public userAgent?: string;
  public requestMethod?: string;
  public requestUrl?: string;
  public requestParams?: string;
  public responseData?: string;
  public status!: boolean;
  public errorMessage?: string;
  public duration?: number;
  public readonly createdAt!: Date;

  public readonly user?: User;
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
      comment: '用户ID',
      references: {
        model: 'users',
        key: 'id',
      },
    },
    username: {
      type: DataTypes.STRING(50),
      comment: '用户名',
    },
    operation: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: '操作描述',
    },
    module: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '模块',
    },
    action: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '动作',
    },
    ip: {
      type: DataTypes.STRING(50),
      comment: 'IP地址',
    },
    userAgent: {
      type: DataTypes.STRING(500),
      comment: '用户代理',
    },
    requestMethod: {
      type: DataTypes.STRING(10),
      comment: '请求方法',
    },
    requestUrl: {
      type: DataTypes.STRING(500),
      comment: '请求URL',
    },
    requestParams: {
      type: DataTypes.TEXT,
      comment: '请求参数',
    },
    responseData: {
      type: DataTypes.TEXT,
      comment: '响应数据',
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: '操作状态',
    },
    errorMessage: {
      type: DataTypes.TEXT,
      comment: '错误信息',
    },
    duration: {
      type: DataTypes.INTEGER.UNSIGNED,
      comment: '耗时(ms)',
    },
  },
  {
    sequelize,
    tableName: 'operation_logs',
    modelName: 'OperationLog',
    updatedAt: false,
    indexes: [
      { fields: ['userId'] },
      { fields: ['module'] },
      { fields: ['status'] },
      { fields: ['createdAt'] },
    ],
  }
);

OperationLog.belongsTo(User, {
  as: 'user',
  foreignKey: 'userId',
});

export default OperationLog;
