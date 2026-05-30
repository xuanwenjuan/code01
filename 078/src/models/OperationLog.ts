import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import User from './User';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  QUERY = 'query',
  APPROVE = 'approve',
  REJECT = 'reject',
  EXPORT = 'export',
  IMPORT = 'import',
  LOGIN = 'login',
  LOGOUT = 'logout'
}

class OperationLog extends Model {
  public id!: number;
  public userId!: number | null;
  public username!: string | null;
  public module!: string;
  public operation!: OperationType;
  public method!: string;
  public requestUrl!: string;
  public requestParams!: string | null;
  public responseData!: string | null;
  public ip!: string | null;
  public userAgent!: string | null;
  public status!: number;
  public errorMessage!: string | null;
  public executionTime!: number;
  public readonly createdAt!: Date;
}

OperationLog.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '用户ID'
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '用户名'
    },
    module: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '模块名称'
    },
    operation: {
      type: DataTypes.ENUM(...Object.values(OperationType)),
      allowNull: false,
      comment: '操作类型'
    },
    method: {
      type: DataTypes.STRING(10),
      allowNull: false,
      comment: '请求方法'
    },
    requestUrl: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: '请求URL'
    },
    requestParams: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '请求参数，JSON格式'
    },
    responseData: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '响应数据，JSON格式'
    },
    ip: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'IP地址'
    },
    userAgent: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: '用户代理'
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
      comment: '状态：1成功，0失败'
    },
    errorMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '错误信息'
    },
    executionTime: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '执行时间（毫秒）'
    }
  },
  {
    sequelize,
    modelName: 'OperationLog',
    tableName: 'operation_logs',
    comment: '操作日志表',
    updatedAt: false
  }
);

OperationLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export default OperationLog;
