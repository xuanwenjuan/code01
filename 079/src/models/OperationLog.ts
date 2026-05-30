import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from '../database'

interface OperationLogAttributes {
  id: number
  userId?: number
  username?: string
  module: string
  operation: string
  method?: string
  url?: string
  ip?: string
  params?: string
  result?: string
  status: boolean
  errorMsg?: string
  duration?: number
  createdAt: Date
}

interface OperationLogCreationAttributes extends Optional<OperationLogAttributes, 'id' | 'createdAt' | 'userId' | 'username' | 'method' | 'url' | 'ip' | 'params' | 'result' | 'errorMsg' | 'duration'> {}

class OperationLog extends Model<OperationLogAttributes, OperationLogCreationAttributes> implements OperationLogAttributes {
  public id!: number
  public userId?: number
  public username?: string
  public module!: string
  public operation!: string
  public method?: string
  public url?: string
  public ip?: string
  public params?: string
  public result?: string
  public status!: boolean
  public errorMsg?: string
  public duration?: number
  public readonly createdAt!: Date
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
      comment: '用户ID'
    },
    username: {
      type: DataTypes.STRING(50),
      comment: '用户名'
    },
    module: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '模块'
    },
    operation: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '操作'
    },
    method: {
      type: DataTypes.STRING(20),
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
      comment: '状态'
    },
    errorMsg: {
      type: DataTypes.TEXT,
      comment: '错误信息'
    },
    duration: {
      type: DataTypes.INTEGER,
      comment: '耗时(ms)'
    }
  },
  {
    sequelize,
    modelName: 'OperationLog',
    tableName: 'operation_logs',
    timestamps: true,
    updatedAt: false,
    indexes: [
      { fields: ['userId'] },
      { fields: ['module'] },
      { fields: ['createdAt'] }
    ]
  }
)

export default OperationLog
