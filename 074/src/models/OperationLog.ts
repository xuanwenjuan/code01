import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement, CreatedAt, Index } from 'sequelize-typescript';

@Table({
  tableName: 'operation_logs',
  timestamps: false
})
export class OperationLog extends Model<OperationLog> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  id!: number;

  @Column({
    type: DataType.STRING(50),
    allowNull: false
  })
  @Index
  module!: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: false
  })
  action!: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  @Index
  operatorId!: number;

  @Column({
    type: DataType.STRING(50)
  })
  operatorName?: string;

  @Column({
    type: DataType.BIGINT
  })
  @Index
  targetId?: number;

  @Column({
    type: DataType.STRING(50)
  })
  targetType?: string;

  @Column({
    type: DataType.JSON
  })
  oldData?: any;

  @Column({
    type: DataType.JSON
  })
  newData?: any;

  @Column({
    type: DataType.STRING(50)
  })
  ip?: string;

  @Column({
    type: DataType.STRING(255)
  })
  userAgent?: string;

  @Column({
    type: DataType.STRING(255)
  })
  description?: string;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    allowNull: false
  })
  createdAt!: Date;
}
