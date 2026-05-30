import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import User from './User';

class OperationLog extends Model {
  public id!: number;
  public userId?: number;
  public username?: string;
  public module!: string;
  public operation!: string;
  public method?: string;
  public params?: string;
  public time!: number;
  public ip?: string;
  public status!: number;
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
      comment: '模块'
    },
    operation: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '操作'
    },
    method: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: '方法'
    },
    params: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '请求参数'
    },
    time: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '执行时长(毫秒)'
    },
    ip: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'IP地址'
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
      comment: '状态：1-成功，0-失败'
    },
    errorMsg: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '错误信息'
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