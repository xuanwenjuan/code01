import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

export interface OperationLogAttributes {
  id?: number;
  userId?: number;
  username?: string;
  module: string;
  operation: string;
  method: string;
  params?: string;
  ip?: string;
  userAgent?: string;
  status: number;
  errorMsg?: string;
  duration: number;
  createdAt?: Date;
}

class OperationLog extends Model<OperationLogAttributes> implements OperationLogAttributes {
  public id!: number;
  public userId?: number;
  public username?: string;
  public module!: string;
  public operation!: string;
  public method!: string;
  public params?: string;
  public ip?: string;
  public userAgent?: string;
  public status!: number;
  public errorMsg?: string;
  public duration!: number;
  public readonly createdAt!: Date;
}

OperationLog.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
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
    userAgent: {
      type: DataTypes.STRING(255),
      comment: 'UserAgent'
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
      comment: '状态 0:失败 1:成功'
    },
    errorMsg: {
      type: DataTypes.TEXT,
      comment: '错误信息'
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '耗时ms'
    }
  },
  {
    sequelize,
    modelName: 'OperationLog',
    tableName: 'operation_logs',
    timestamps: true,
    updatedAt: false
  }
);

export default OperationLog;
