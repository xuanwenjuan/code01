import { Table, Column, Model, DataType, CreatedAt, UpdatedAt } from 'sequelize-typescript';
import { UserRole } from '../types/common';

@Table({
  tableName: 'users',
  timestamps: true
})
export default class User extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true
  })
  id: number;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    unique: true
  })
  username: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false
  })
  password: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: false
  })
  realName: string;

  @Column({
    type: DataType.ENUM(...Object.values(UserRole)),
    allowNull: false,
    defaultValue: UserRole.SALESMAN
  })
  role: UserRole;

  @Column({
    type: DataType.STRING(20)
  })
  phone: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true
  })
  isActive: boolean;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}
