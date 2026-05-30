import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

export interface OperationLogAttributes {
  id?: number;
  userId?: number;
  username?: string;
  module: string;
  operation: string;
  method: string;
  url: string;
  ip?: string;
  params?: string;
  result?: string;
  status: 'SUCCESS' | 'FAIL';
  errorMessage?: string;
  duration?: number;
  createdAt?: Date;
}

class OperationLog extends Model<OperationLogAttributes> implements OperationLogAttributes {
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
  public status!: 'SUCCESS' | 'FAIL';
  public errorMessage?: string;
  public duration?: number;
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
      allowNull: true
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    module: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    operation: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    method: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    url: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    ip: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    params: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    result: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('SUCCESS', 'FAIL'),
      allowNull: false,
      defaultValue: 'SUCCESS'
    },
    errorMessage: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    duration: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: 'operation_logs',
    modelName: 'OperationLog',
    updatedAt: false
  }
);

export default OperationLog;
