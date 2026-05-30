import {
  Column,
  Model,
  Table,
  DataType,
  HasMany,
} from 'sequelize-typescript';
import { User } from './user.model';
import { RoleCode, RoleName } from '../constants/role';

@Table({
  tableName: 'roles',
  timestamps: true,
  paranoid: true,
})
export class Role extends Model<Role> {
  @Column({
    type: DataType.ENUM(...Object.values(RoleCode)),
    allowNull: false,
    unique: true,
  })
  code!: RoleCode;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
  })
  name!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description?: string;

  @HasMany(() => User)
  users?: User[];
}
