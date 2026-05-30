
import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import User from './User';

class OperationLog extends Model {
  public id!: number;
  public userId!: number;
  public username!: string;
  public module!: string;
  public operation!: string;
  public ip!: string;
  public userAgent!: string;
  public readonly createdAt!: Date;
}

OperationLog.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
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
      type: DataTypes.TEXT,
      allowNull: false,
      comment: '操作内容'
    },
    ip: {
      type: DataTypes.STRING(50),
      comment: 'IP地址'
    },
    userAgent: {
      type: DataTypes.STRING(255),
      comment: '用户代理'
    }
  },
  {
    sequelize,
    tableName: 'operation_logs',
    modelName: 'OperationLog',
    updatedAt: false
  }
);

OperationLog.belongsTo(User, { as: 'user', foreignKey: 'userId' });

export default OperationLog;
