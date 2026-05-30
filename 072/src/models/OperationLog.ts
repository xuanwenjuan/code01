import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class OperationLog extends Model {
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
  public status!: number;
  public duration!: number;
  public readonly createdAt!: Date;
}

OperationLog.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
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
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '请求耗时，毫秒'
    }
  },
  {
    sequelize,
    modelName: 'OperationLog',
    tableName: 'operation_logs',
    timestamps: true,
    updatedAt: false
  }
);

export default OperationLog;
