import { Table, Column, Model, DataType, CreatedAt, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from './User';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  QUERY = 'query',
  CHECK_IN = 'check_in',
  CHECK_OUT = 'check_out',
  CANCEL = 'cancel',
  REFUND = 'refund',
  STATUS_CHANGE = 'status_change'
}

@Table({
  tableName: 'operation_logs',
  timestamps: false
})
export class OperationLog extends Model<OperationLog> {
  @Column({
    type: DataType.BIGINT,
    primaryKey: true,
    autoIncrement: true
  })
  id: number;

  @Column({
    type: DataType.STRING(50),
    allowNull: false
  })
  module: string;

  @Column({
    type: DataType.ENUM(...Object.values(OperationType)),
    allowNull: false
  })
  operation: OperationType;

  @Column({
    type: DataType.STRING(100),
    allowNull: false
  })
  description: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: true
  })
  operatorId: number | null;

  @Column({
    type: DataType.STRING(50),
    allowNull: true
  })
  operatorName: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true
  })
  requestData: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true
  })
  responseData: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: true
  })
  ipAddress: string;

  @CreatedAt
  createdAt: Date;

  @BelongsTo(() => User)
  operator: User;
}
