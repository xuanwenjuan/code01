import { DataTypes, Model } from 'sequelize';
import sequelize from '../database';
import User from './User';

export interface OperationLogAttributes {
  id?: number;
  userId?: number;
  username?: string;
  module: string;
  operation: string;
  method: string;
  url: string;
  ip?: string;
  params?: string;
  result?: string;
  status: 'success' | 'fail';
  errorMessage?: string;
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
  public url!: string;
  public ip?: string;
  public params?: string;
  public result?: string;
  public status!: 'success' | 'fail';
  public errorMessage?: string;
  public duration?: number;
  public readonly createdAt!: Date;
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
      comment: '用户ID',
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '用户名',
    },
    module: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '模块',
    },
    operation: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '操作',
    },
    method: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: '请求方法',
    },
    url: {
      type: DataTypes.STRING(500),
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
      type: DataTypes.ENUM('success', 'fail'),
      allowNull: false,
      comment: '状态',
    },
    errorMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '错误信息',
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '耗时(ms)',
    },
  },
  {
    sequelize,
    modelName: 'OperationLog',
    tableName: 'operation_logs',
    timestamps: true,
    updatedAt: false,
  }
);

OperationLog.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

User.hasMany(OperationLog, {
  foreignKey: 'userId',
  as: 'operationLogs',
});

export default OperationLog;
