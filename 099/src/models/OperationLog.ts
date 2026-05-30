import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../database';

export interface OperationLogAttributes {
  id?: number;
  userId?: number;
  username?: string;
  module: string;
  action: string;
  detail: string;
  ip?: string;
  userAgent?: string;
  createdAt?: Date;
}

class OperationLog extends Model<OperationLogAttributes> implements OperationLogAttributes {
  public id!: number;
  public userId?: number;
  public username?: string;
  public module!: string;
  public action!: string;
  public detail!: string;
  public ip?: string;
  public userAgent?: string;
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
    action: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '操作'
    },
    detail: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: '详情'
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
    modelName: 'OperationLog',
    tableName: 'operation_logs',
    updatedAt: false,
    indexes: [
      { fields: ['userId'] },
      { fields: ['module'] },
      { fields: ['createdAt'] }
    ]
  }
);

export default OperationLog;
