import { DataTypes, Model } from 'sequelize';
import sequelize from '../database';
import User from './User';

class OperationLog extends Model {
  public id!: number;
  public userId!: number;
  public username!: string;
  public module!: string;
  public operation!: string;
  public method!: string;
  public params?: string;
  public ip?: string;
  public status!: boolean;
  public errorMsg?: string;
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
      allowNull: false,
      comment: '用户ID'
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '用户名'
    },
    module: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '模块'
    },
    operation: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '操作'
    },
    method: {
      type: DataTypes.STRING(20),
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
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: '操作状态'
    },
    errorMsg: {
      type: DataTypes.TEXT,
      comment: '错误信息'
    }
  },
  {
    sequelize,
    modelName: 'OperationLog',
    tableName: 'operation_logs',
    updatedAt: false
  }
);

OperationLog.belongsTo(User, { as: 'user', foreignKey: 'userId' });

export default OperationLog;