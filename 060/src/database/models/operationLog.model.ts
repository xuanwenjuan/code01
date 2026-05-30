import { Column, Table, DataType } from 'sequelize-typescript';
import { BaseModel } from './base.model';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  QUERY = 'query',
  VERIFY = 'verify',
  SETTLE = 'settle',
}

@Table({
  tableName: 'operation_logs',
  timestamps: true,
  indexes: [
    { fields: ['operator_id'] },
    { fields: ['module'] },
    { fields: ['created_at'] },
  ],
})
export class OperationLog extends BaseModel {
  @Column({
    type: DataType.INTEGER,
    comment: '操作人ID',
  })
  operatorId: number;

  @Column({
    type: DataType.STRING(50),
    comment: '操作人',
  })
  operatorName: string;

  @Column({
    type: DataType.STRING(50),
    comment: '模块',
  })
  module: string;

  @Column({
    type: DataType.ENUM(...Object.values(OperationType)),
    comment: '操作类型',
  })
  operation: OperationType;

  @Column({
    type: DataType.STRING(200),
    comment: '操作描述',
  })
  description: string;

  @Column({
    type: DataType.STRING(100),
    comment: '请求IP',
  })
  ip: string;

  @Column({
    type: DataType.TEXT,
    comment: '请求参数',
  })
  requestParams: string;

  @Column({
    type: DataType.TEXT,
    comment: '响应结果',
  })
  responseResult: string;
}
