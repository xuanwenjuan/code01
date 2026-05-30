import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database';
import { User } from './User';

interface OperationLogAttributes {
  id: number;
  userId?: number;
  username?: string;
  module: string;
  operation: string;
  method: string;
  url: string;
  ip?: string;
  params?: string;
  result?: string;
  status: boolean;
  errorMessage?: string;
  duration: number;
  createdAt: Date;
}

interface OperationLogCreationAttributes extends Optional<OperationLogAttributes, 'id' | 'createdAt'> {}

class OperationLog extends Model<OperationLogAttributes, OperationLogCreationAttributes> implements OperationLogAttributes {
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
  public status!: boolean;
  public errorMessage?: string;
  public duration!: number;
  public readonly createdAt!: Date;

  public readonly user?: User;
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
      comment: '操作人ID'
    },
    username: {
      type: DataTypes.STRING(50),
      comment: '操作人用户名'
    },
    module: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '操作模块'
    },
    operation: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '操作描述'
    },
    method: {
      type: DataTypes.STRING(10),
      allowNull: false,
      comment: '请求方法'
    },
    url: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: '请求URL'
    },
    ip: {
      type: DataTypes.STRING(50),
      comment: 'IP地址'
    },
    params: {
      type: DataTypes.TEXT,
      comment: '请求参数'
    },
    result: {
      type: DataTypes.TEXT,
      comment: '返回结果'
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      comment: '操作状态'
    },
    errorMessage: {
      type: DataTypes.TEXT,
      comment: '错误信息'
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '耗时(ms)'
    }
  },
  {
    sequelize,
    modelName: 'OperationLog',
    tableName: 'operation_logs',
    timestamps: true,
    updatedAt: false,
    indexes: [
      { fields: ['userId'] },
      { fields: ['module'] },
      { fields: ['createdAt'] },
      { fields: ['status'] }
    ]
  }
);

OperationLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export { OperationLog, OperationLogAttributes, OperationLogCreationAttributes };
