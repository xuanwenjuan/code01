import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import User from './User';

@Table({
  tableName: 'stores',
  timestamps: true,
  paranoid: true
})
export default class Store extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true
  })
  id: number;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    unique: true
  })
  storeCode: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false
  })
  storeName: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: true
  })
  address: string;

  @Column({
    type: DataType.STRING(20),
    allowNull: true
  })
  contactPhone: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: true
  })
  manager: string;

  @Column({
    type: DataType.DECIMAL(10, 6),
    allowNull: true
  })
  longitude: number;

  @Column({
    type: DataType.DECIMAL(10, 6),
    allowNull: true
  })
  latitude: number;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true
  })
  isActive: boolean;

  @HasMany(() => User)
  users: User[];
}
