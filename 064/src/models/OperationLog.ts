import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../database';

export class OperationLog extends Model {
  public id!: number;
  public userId!: number | null;
  public username!: string;
  public module!: string;
  public operation!: string;
  public method!: string;
  public url!: string;
  public ip!: string;
  public params!: string;
  public result!: string;
  public status!: boolean;
  public duration!: number;
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
      comment: '操作人ID'
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: true,
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
      comment: '操作内容'
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
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: '操作状态 true:成功 false:失败'
    },
    duration: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: '耗时(ms)'
    }
  },
  {
    sequelize,
    tableName: 'operation_logs',
    modelName: 'OperationLog',
    timestamps: true,
    updatedAt: false,
    indexes: [
      { fields: ['userId'] },
      { fields: ['module'] },
      { fields: ['createdAt'] }
    ]
  }
);
