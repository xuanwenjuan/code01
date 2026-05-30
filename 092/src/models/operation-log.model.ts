import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './user.model';

interface OperationLogAttributes {
  id: number;
  userId?: number;
  username?: string;
  module: string;
  operation: string;
  method: string;
  params?: string;
  ip?: string;
  userAgent?: string;
  duration: number;
  status: number;
  errorMsg?: string;
  createdAt: Date;
}

interface OperationLogCreationAttributes extends Optional<OperationLogAttributes, 'id' | 'createdAt' | 'userId' | 'username' | 'params' | 'ip' | 'userAgent' | 'errorMsg'> {}

class OperationLog extends Model<OperationLogAttributes, OperationLogCreationAttributes> implements OperationLogAttributes {
  public id!: number;
  public userId?: number;
  public username?: string;
  public module!: string;
  public operation!: string;
  public method!: string;
  public params?: string;
  public ip?: string;
  public userAgent?: string;
  public duration!: number;
  public status!: number;
  public errorMsg?: string;
  public readonly createdAt!: Date;

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
    params: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '请求参数',
    },
    ip: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'IP地址',
    },
    userAgent: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: '用户代理',
    },
    duration: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: '耗时(ms)',
    },
    status: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      comment: '状态码',
    },
    errorMsg: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '错误信息',
    },
  },
  {
    sequelize,
    tableName: 'operation_logs',
    comment: '操作日志表',
    timestamps: true,
    updatedAt: false,
  }
);

OperationLog.belongsTo(User, { as: 'user', foreignKey: 'userId' });
User.hasMany(OperationLog, { as: 'operationLogs', foreignKey: 'userId' });

export default OperationLog;