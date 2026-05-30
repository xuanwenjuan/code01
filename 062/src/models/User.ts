import { Table, Column, Model, DataType, CreatedAt, UpdatedAt } from 'sequelize-typescript';

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  RECEPTIONIST = 'receptionist',
  FINANCE = 'finance'
}

@Table({
  tableName: 'users',
  timestamps: true
})
export class User extends Model<User> {
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
    type: DataType.STRING(100),
    allowNull: false
  })
  password: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: false
  })
  realName: string;

  @Column({
    type: DataType.STRING(20),
    allowNull: true
  })
  phone: string;

  @Column({
    type: DataType.ENUM(...Object.values(UserRole)),
    allowNull: false,
    defaultValue: UserRole.RECEPTIONIST
  })
  role: UserRole;

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
