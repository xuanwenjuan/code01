import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import { OperationLogAttributes, OperationModule, OperationType } from '../types';

class OperationLog extends Model<OperationLogAttributes> implements OperationLogAttributes {
  public id!: number;
  public userId?: number;
  public username?: string;
  public module!: OperationModule;
  public operation!: OperationType;
  public method?: string;
  public url?: string;
  public ip?: string;
  public params?: string;
  public result?: string;
  public status!: 'success' | 'fail';
  public errorMessage?: string;
  public duration?: number;
  public targetId?: number;
  public targetType?: string;
  public beforeData?: string;
  public afterData?: string;
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
      allowNull: true,
      comment: '用户ID'
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '用户名'
    },
    module: {
      type: DataTypes.ENUM(...Object.values(OperationModule)),
      allowNull: false,
      comment: '模块'
    },
    operation: {
      type: DataTypes.ENUM(...Object.values(OperationType)),
      allowNull: false,
      comment: '操作类型'
    },
    method: {
      type: DataTypes.STRING(10),
      allowNull: true,
      comment: '请求方法'
    },
    url: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '请求URL'
    },
    ip: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'IP地址'
    },
    params: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '请求参数'
    },
    result: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '返回结果'
    },
    status: {
      type: DataTypes.ENUM('success', 'fail'),
      allowNull: false,
      defaultValue: 'success',
      comment: '状态'
    },
    errorMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '错误信息'
    },
    duration: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: '耗时(ms)'
    },
    targetId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: '目标ID'
    },
    targetType: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '目标类型'
    },
    beforeData: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '变更前数据'
    },
    afterData: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '变更后数据'
    }
  },
  {
    sequelize,
    tableName: 'operation_logs',
    modelName: 'OperationLog',
    updatedAt: false,
    indexes: [
      { fields: ['userId'] },
      { fields: ['module', 'operation'] },
      { fields: ['targetId', 'targetType'] },
      { fields: ['createdAt'] }
    ]
  }
);

export default OperationLog;
