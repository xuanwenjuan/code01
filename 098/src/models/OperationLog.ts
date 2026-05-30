import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface OperationLogAttributes {
  id: number;
  module: string;
  operation: string;
  method: string;
  description: string;
  requestUrl: string;
  requestParams?: string;
  requestBody?: string;
  responseData?: string;
  operatorId: number;
  operatorName: string;
  operatorRole: string;
  ipAddress?: string;
  userAgent?: string;
  status: 'success' | 'error';
  errorMessage?: string;
  duration: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface OperationLogCreationAttributes extends Optional<OperationLogAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class OperationLog extends Model<OperationLogAttributes, OperationLogCreationAttributes> implements OperationLogAttributes {
  public id!: number;
  public module!: string;
  public operation!: string;
  public method!: string;
  public description!: string;
  public requestUrl!: string;
  public requestParams?: string;
  public requestBody?: string;
  public responseData?: string;
  public operatorId!: number;
  public operatorName!: string;
  public operatorRole!: string;
  public ipAddress?: string;
  public userAgent?: string;
  public status!: 'success' | 'error';
  public errorMessage?: string;
  public duration!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

OperationLog.init({
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  module: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '模块名称'
  },
  operation: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '操作类型'
  },
  method: {
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: '请求方法'
  },
  description: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: '操作描述'
  },
  requestUrl: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: '请求URL'
  },
  requestParams: {
    type: DataTypes.TEXT,
    comment: '请求参数'
  },
  requestBody: {
    type: DataTypes.TEXT,
    comment: '请求体'
  },
  responseData: {
    type: DataTypes.TEXT,
    comment: '响应数据'
  },
  operatorId: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: '操作人ID'
  },
  operatorName: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '操作人姓名'
  },
  operatorRole: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '操作人角色'
  },
  ipAddress: {
    type: DataTypes.STRING(50),
    comment: 'IP地址'
  },
  userAgent: {
    type: DataTypes.STRING(255),
    comment: '用户代理'
  },
  status: {
    type: DataTypes.ENUM('success', 'error'),
    allowNull: false,
    defaultValue: 'success',
    comment: '操作状态'
  },
  errorMessage: {
    type: DataTypes.TEXT,
    comment: '错误信息'
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '执行时长(毫秒)'
  }
}, {
  sequelize,
  modelName: 'OperationLog',
  tableName: 'operation_logs',
  timestamps: true,
  indexes: [
    { fields: ['module'] },
    { fields: ['operatorId'] },
    { fields: ['createdAt'] },
    { fields: ['status'] }
  ]
});

export default OperationLog;
