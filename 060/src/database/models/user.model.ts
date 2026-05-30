import { Column, Table, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { BaseModel } from './base.model';
import { UserRole } from '../../types/common';
import { Distributor } from './distributor.model';

@Table({
  tableName: 'users',
  timestamps: true,
  paranoid: true,
})
export class User extends BaseModel {
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
    comment: '密码',
  })
  password: string;

  @Column({
    type: DataType.ENUM(...Object.values(UserRole)),
    allowNull: false,
    defaultValue: UserRole.VIEWER,
    comment: '角色',
  })
  role: UserRole;

  @ForeignKey(() => Distributor)
  @Column({
    type: DataType.INTEGER,
    comment: '关联分销商ID',
  })
  distributorId: number;

  @BelongsTo(() => Distributor)
  distributor: Distributor;

  @Column({
    type: DataType.STRING(50),
    comment: '真实姓名',
  })
  realName: string;

  @Column({
    type: DataType.STRING(20),
    comment: '手机号',
  })
  phone: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
    comment: '是否启用',
  })
  enabled: boolean;
}
