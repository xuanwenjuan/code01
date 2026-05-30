import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class OperationLog extends Model {
  public id!: number;
  public operatorId?: number;
  public operatorName?: string;
  public module!: string;
  public operation!: string;
  public method?: string;
  public url?: string;
  public ip?: string;
  public params?: string;
  public result?: string;
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
    operatorId: {
      type: DataTypes.INTEGER,
      comment: '操作人ID'
    },
    operatorName: {
      type: DataTypes.STRING(50),
      comment: '操作人姓名'
    },
    module: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '模块名称'
    },
    operation: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '操作描述'
    },
    method: {
      type: DataTypes.STRING(10),
      comment: '请求方法'
    },
    url: {
      type: DataTypes.STRING(255),
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
    comment: '操作日志表',
    timestamps: true,
    updatedAt: false
  }
);

export default OperationLog;
