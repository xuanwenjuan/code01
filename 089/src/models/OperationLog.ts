import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import { OperationType } from '../types';
import User from './User';

class OperationLogModel extends Model {
  public id!: number;
  public operationType!: OperationType;
  public module!: string;
  public recordId!: number;
  public recordCode?: string;
  public operatorId!: number;
  public operatorName!: string;
  public oldValue?: string;
  public newValue?: string;
  public remark?: string;
  public ipAddress?: string;
  public userAgent?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly operator?: User;
}

OperationLogModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    operationType: {
      type: DataTypes.ENUM(...Object.values(OperationType)),
      allowNull: false,
      field: 'operation_type'
    },
    module: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    recordId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'record_id'
    },
    recordCode: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'record_code'
    },
    operatorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'operator_id'
    },
    operatorName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'operator_name'
    },
    oldValue: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'old_value'
    },
    newValue: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'new_value'
    },
    remark: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    ipAddress: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'ip_address'
    },
    userAgent: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'user_agent'
    }
  },
  {
    sequelize,
    modelName: 'OperationLog',
    tableName: 'operation_logs',
    indexes: [
      { fields: ['module', 'record_id'] },
      { fields: ['operator_id'] },
      { fields: ['operation_type'] },
      { fields: ['created_at'] }
    ]
  }
);

OperationLogModel.belongsTo(User, {
  as: 'operator',
  foreignKey: 'operatorId'
});

export default OperationLogModel;
