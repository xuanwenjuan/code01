import { Table, Column, Model, DataType, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { UserRole } from '../types';
import Store from './Store';

@Table({
  tableName: 'users',
  timestamps: true,
  paranoid: true
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
    allowNull: false
  })
  role: UserRole;

  @ForeignKey(() => Store)
  @Column({
    type: DataType.INTEGER,
    allowNull: true
  })
  storeId: number;

  @BelongsTo(() => Store)
  store: Store;

  @Column({
    type: DataType.STRING(20),
    allowNull: true
  })
  phone: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true
  })
  email: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true
  })
  isActive: boolean;
}
