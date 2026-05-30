import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import User from './User';

interface OperationLogAttributes {
  id: string;
  userId?: string;
  username?: string;
  module: string;
  operation: string;
  method: string;
  url: string;
  ip?: string;
  userAgent?: string;
  params?: string;
  result?: string;
  status: boolean;
  errorMessage?: string;
  duration: number;
  createdAt: Date;
}

interface OperationLogCreationAttributes extends Optional<OperationLogAttributes, 'id' | 'createdAt' | 'status' | 'duration'> {}

class OperationLog extends Model<OperationLogAttributes, OperationLogCreationAttributes> implements OperationLogAttributes {
  public id!: string;
  public userId?: string;
  public username?: string;
  public module!: string;
  public operation!: string;
  public method!: string;
  public url!: string;
  public ip?: string;
  public userAgent?: string;
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
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'user_id',
      references: {
        model: 'users',
        key: 'id'
      }
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
      type: DataTypes.STRING(100),
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
    userAgent: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'user_agent'
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
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    errorMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'error_message'
    },
    duration: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  },
  {
    sequelize,
    tableName: 'operation_logs',
    timestamps: true,
    updatedAt: false
  }
);

OperationLog.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

export default OperationLog;
