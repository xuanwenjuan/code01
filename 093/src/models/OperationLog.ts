import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { OperationType, OperationModule } from '../types';
import User from './User';

interface OperationLogAttributes {
  id: number;
  module: OperationModule;
  operationType: OperationType;
  recordId: number;
  operatorId?: number;
  previousData?: any;
  newData?: any;
  changes?: string[];
  ipAddress?: string;
  userAgent?: string;
  remarks?: string;
}

interface OperationLogCreationAttributes extends Optional<OperationLogAttributes, 'id'> {}

class OperationLog extends Model<OperationLogAttributes, OperationLogCreationAttributes> implements OperationLogAttributes {
  public id!: number;
  public module!: OperationModule;
  public operationType!: OperationType;
  public recordId!: number;
  public operatorId?: number;
  public previousData?: any;
  public newData?: any;
  public changes?: string[];
  public ipAddress?: string;
  public userAgent?: string;
  public remarks?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public readonly operator?: User;
}

OperationLog.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    module: {
      type: DataTypes.ENUM(...Object.values(OperationModule)),
      allowNull: false,
    },
    operationType: {
      type: DataTypes.ENUM(...Object.values(OperationType)),
      allowNull: false,
    },
    recordId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    operatorId: {
      type: DataTypes.INTEGER.UNSIGNED,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    previousData: {
      type: DataTypes.JSON,
    },
    newData: {
      type: DataTypes.JSON,
    },
    changes: {
      type: DataTypes.JSON,
    },
    ipAddress: {
      type: DataTypes.STRING(50),
    },
    userAgent: {
      type: DataTypes.STRING(255),
    },
    remarks: {
      type: DataTypes.TEXT,
    },
  },
  {
    sequelize,
    modelName: 'OperationLog',
    tableName: 'operation_logs',
    indexes: [
      { fields: ['module', 'recordId'] },
      { fields: ['operatorId'] },
      { fields: ['createdAt'] },
    ],
  }
);

OperationLog.belongsTo(User, { as: 'operator', foreignKey: 'operatorId' });
User.hasMany(OperationLog, { as: 'operations', foreignKey: 'operatorId' });

export default OperationLog;
