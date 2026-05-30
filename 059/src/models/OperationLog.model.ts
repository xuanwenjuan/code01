import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import { OperationType } from '../types';

class OperationLog extends Model {
  public id!: number;
  public userId!: number;
  public username!: string;
  public module!: string;
  public operation!: OperationType;
  public description!: string;
  public ip!: string;
  public requestData!: string;
  public responseData!: string;
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
      comment: '操作模块'
    },
    operation: {
      type: DataTypes.ENUM(...Object.values(OperationType)),
      allowNull: false,
      comment: '操作类型'
    },
    description: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: '操作描述'
    },
    ip: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'IP地址'
    },
    requestData: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '请求数据'
    },
    responseData: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '响应数据'
    }
  },
  {
    sequelize,
    tableName: 'operation_logs',
    modelName: 'OperationLog',
    timestamps: true,
    updatedAt: false
  }
);

export default OperationLog;
