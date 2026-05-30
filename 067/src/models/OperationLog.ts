import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  Index,
} from 'sequelize-typescript';
import { User } from './User';
import { UserRole } from '../types';

@Table({
  tableName: 'operation_logs',
  timestamps: true,
  indexes: [
    { fields: ['userId'] },
    { fields: ['createdAt'] },
    { fields: ['method'] },
  ],
})
export class OperationLog extends Model<OperationLog> {
  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    comment: '用户ID',
  })
  userId: number;

  @Column({
    type: DataType.STRING(50),
    comment: '用户名',
  })
  username: string;

  @Column({
    type: DataType.ENUM(...Object.values(UserRole)),
    comment: '用户角色',
  })
  role: UserRole;

  @Column({
    type: DataType.STRING(10),
    allowNull: false,
    comment: '请求方法',
  })
  method: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    comment: '请求路径',
  })
  path: string;

  @Column({
    type: DataType.STRING(50),
    comment: 'IP地址',
  })
  ip: string;

  @Column({
    type: DataType.TEXT,
    comment: '路径参数',
  })
  params: string;

  @Column({
    type: DataType.TEXT,
    comment: '查询参数',
  })
  query: string;

  @Column({
    type: DataType.TEXT,
    comment: '请求体',
  })
  body: string;

  @Column({
    type: DataType.INTEGER,
    comment: '响应状态码',
  })
  statusCode: number;

  @Column({
    type: DataType.INTEGER,
    comment: '耗时(ms)',
  })
  duration: number;

  @BelongsTo(() => User)
  user: User;
}
