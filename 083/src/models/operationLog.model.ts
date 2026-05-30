import { Column, Model, Table, DataType } from 'sequelize-typescript';

export enum OperationType {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  IMPORT = 'IMPORT',
  EXPORT = 'EXPORT',
}

@Table({
  tableName: 'operation_logs',
  timestamps: true,
  paranoid: true,
})
export class OperationLog extends Model<OperationLog> {
  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  module!: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
  })
  operation!: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  targetId?: number;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  beforeData?: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  afterData?: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  operatorId!: number;

  @Column({
    type: DataType.STRING(50),
    allowNull: true,
  })
  operatorName?: string;

  @Column({
    type: DataType.STRING(500),
    allowNull: true,
  })
  remark?: string;
}
