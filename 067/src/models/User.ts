import {
  Table,
  Column,
  Model,
  DataType,
  HasMany,
  Index,
} from 'sequelize-typescript';
import { UserRole } from '../types';
import { ChargingOrder } from './ChargingOrder';
import { OperationLog } from './OperationLog';

@Table({
  tableName: 'users',
  timestamps: true,
  paranoid: true,
})
export class User extends Model<User> {
  @Index
  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    unique: true,
    comment: '用户名',
  })
  username: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    comment: '密码哈希',
  })
  password: string;

  @Column({
    type: DataType.STRING(20),
    allowNull: false,
    unique: true,
    comment: '手机号',
  })
  phone: string;

  @Column({
    type: DataType.ENUM(...Object.values(UserRole)),
    allowNull: false,
    defaultValue: UserRole.USER,
    comment: '用户角色',
  })
  role: UserRole;

  @Column({
    type: DataType.STRING(100),
    comment: '真实姓名',
  })
  realName: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    defaultValue: 0,
    comment: '账户余额',
  })
  balance: number;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
    comment: '是否启用',
  })
  isActive: boolean;

  @HasMany(() => ChargingOrder)
  orders: ChargingOrder[];

  @HasMany(() => OperationLog)
  operationLogs: OperationLog[];
}
