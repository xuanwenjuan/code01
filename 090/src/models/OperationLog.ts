import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { OperationModule, OperationType } from '../types';

interface OperationLogAttributes {
  id: number;
  module: OperationModule;
  type: OperationType;
  targetId?: number;
  targetName?: string;
  operatorId: number;
  operatorName: string;
  storeId?: number;
  beforeData?: string;
  afterData?: string;
  remark?: string;
  ip?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface OperationLogCreationAttributes extends Optional<OperationLogAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class OperationLog extends Model<OperationLogAttributes, OperationLogCreationAttributes> implements OperationLogAttributes {
  public id!: number;
  public module!: OperationModule;
  public type!: OperationType;
  public targetId?: number;
  public targetName?: string;
  public operatorId!: number;
  public operatorName!: string;
  public storeId?: number;
  public beforeData?: string;
  public afterData?: string;
  public remark?: string;
  public ip?: string;
  public userAgent?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

OperationLog.init({
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true
  },
  module: {
    type: DataTypes.ENUM(...Object.values(OperationModule)),
    allowNull: false,
    comment: '操作模块'
  },
  type: {
    type: DataTypes.ENUM(...Object.values(OperationType)),
    allowNull: false,
    comment: '操作类型'
  },
  targetId: {
    type: DataTypes.BIGINT.UNSIGNED,
    comment: '目标ID'
  },
  targetName: {
    type: DataTypes.STRING(200),
    comment: '目标名称'
  },
  operatorId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    comment: '操作员ID'
  },
  operatorName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '操作员姓名'
  },
  storeId: {
    type: DataTypes.INTEGER.UNSIGNED,
    comment: '门店ID'
  },
  beforeData: {
    type: DataTypes.JSON,
    comment: '操作前数据'
  },
  afterData: {
    type: DataTypes.JSON,
    comment: '操作后数据'
  },
  remark: {
    type: DataTypes.TEXT,
    comment: '备注'
  },
  ip: {
    type: DataTypes.STRING(50),
    comment: 'IP地址'
  },
  userAgent: {
    type: DataTypes.STRING(500),
    comment: 'UserAgent'
  }
}, {
  sequelize,
  tableName: 'operation_logs',
  timestamps: true,
  indexes: [
    { fields: ['module'] },
    { fields: ['type'] },
    { fields: ['operatorId'] },
    { fields: ['storeId'] },
    { fields: ['targetId'] },
    { fields: ['createdAt'] }
  ]
});

export default OperationLog;
