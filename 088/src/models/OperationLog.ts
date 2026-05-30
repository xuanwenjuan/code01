import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class OperationLog extends Model {
  public id!: number;
  public userId!: number;
  public username!: string;
  public operation!: string;
  public module!: string;
  public ip?: string;
  public userAgent?: string;
  public requestParams?: string;
  public responseData?: string;
  public status!: boolean;
  public errorMessage?: string;
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
      allowNull: false
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    operation: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    module: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    ip: {
      type: DataTypes.STRING(50)
    },
    userAgent: {
      type: DataTypes.STRING(500)
    },
    requestParams: {
      type: DataTypes.TEXT
    },
    responseData: {
      type: DataTypes.TEXT
    },
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    errorMessage: {
      type: DataTypes.TEXT
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
