import { Table, Column, Model, DataType, CreatedAt } from 'sequelize-typescript';

@Table({
  tableName: 'operation_logs',
  timestamps: false
})
export default class OperationLog extends Model {
  @Column({
    type: DataType.BIGINT,
    primaryKey: true,
    autoIncrement: true
  })
  id: number;

  @Column({
    type: DataType.INTEGER
  })
  userId: number;

  @Column({
    type: DataType.STRING(50)
  })
  username: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: false
  })
  module: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false
  })
  operation: string;

  @Column({
    type: DataType.STRING(10),
    allowNull: false
  })
  method: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false
  })
  url: string;

  @Column({
    type: DataType.TEXT
  })
  params: string;

  @Column({
    type: DataType.TEXT
  })
  body: string;

  @Column({
    type: DataType.STRING(50)
  })
  ip: string;

  @Column({
    type: DataType.INTEGER
  })
  status: number;

  @Column({
    type: DataType.TEXT
  })
  response: string;

  @CreatedAt
  createdAt: Date;
}
